import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { leadCaptureLog, contactMessages, consultingLeads } from '@/lib/db/schema';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiResponse } from '@/lib/strapi/types';
import { upsertProfile, trackEvent, subscribeToList, isKlaviyoConfigured } from '@/lib/klaviyo/client';
import { writeAudit } from './audit';

const LIST_ID = process.env.KLAVIYO_LIST_NEWSLETTER_ID;

// ─── Leads de captación (lead_capture_log, Neon) ───────────────────────
export interface CaptureLead {
  id: string;
  source: string;
  email: string;
  name: string | null;
  resourceTitle: string | null;
  consent: boolean;
  utmSource: string | null;
  synced: boolean;
  klaviyoError: string | null;
  createdAt: string;
}

export async function getLeads(opts: { limit?: number } = {}): Promise<CaptureLead[]> {
  const { limit = 200 } = opts;
  try {
    const rows = await db
      .select()
      .from(leadCaptureLog)
      .orderBy(desc(leadCaptureLog.createdAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      source: r.source,
      email: r.email,
      name: r.name,
      resourceTitle: r.resourceTitle,
      consent: r.consent,
      utmSource: r.utmSource,
      synced: !!r.klaviyoSyncedAt,
      klaviyoError: r.klaviyoError,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (e) {
    console.warn('[admin:getLeads] failed:', e);
    return [];
  }
}

// ─── Leads de consultoría (Strapi) ─────────────────────────────────────
export interface ConsultingLead {
  documentId: string;
  fullName: string;
  organization: string | null;
  email: string;
  sector: string | null;
  questionGoal: string | null;
  projectPhase: string | null;
  deadline: string | null;
  createdAt: string | null;
}

interface StrapiConsultingLead {
  documentId: string;
  fullName?: string;
  organization?: string;
  email?: string;
  sector?: string;
  questionGoal?: string;
  projectPhase?: string;
  deadline?: string;
  createdAt?: string;
}

/**
 * Leads de consultoría. Fuente de verdad = Neon (guardado dual desde el
 * endpoint). Mientras no se backfilee el histórico, además fusionamos los que
 * solo existen en Strapi (deduplicados por strapiDocumentId). Resiliente: si
 * Strapi no está disponible, se muestran igualmente los de Neon.
 */
export async function getConsultingLeads(): Promise<ConsultingLead[]> {
  // 1. Neon (fuente de verdad).
  let neon: ConsultingLead[] = [];
  const seenStrapiIds = new Set<string>();
  try {
    const rows = await db
      .select()
      .from(consultingLeads)
      .orderBy(desc(consultingLeads.createdAt))
      .limit(200);
    neon = rows.map((r) => {
      if (r.strapiDocumentId) seenStrapiIds.add(r.strapiDocumentId);
      return {
        documentId: r.strapiDocumentId ?? `neon:${r.id}`,
        fullName: r.fullName,
        organization: r.organization,
        email: r.email,
        sector: r.sector,
        questionGoal: r.questionGoal,
        projectPhase: r.projectPhase,
        deadline: r.deadline,
        createdAt: r.createdAt.toISOString(),
      };
    });
  } catch (e) {
    console.warn('[admin:getConsultingLeads] Neon failed:', e);
  }

  // 2. Strapi: histórico aún no migrado. Best-effort; se omiten los ya en Neon.
  let strapiOnly: ConsultingLead[] = [];
  try {
    const res = await strapiRequest<StrapiResponse<StrapiConsultingLead[]>>(
      '/api/consulting-leads?sort=createdAt:desc&pagination[pageSize]=100',
      { revalidate: 0 }
    );
    strapiOnly = (res?.data ?? [])
      .filter((l) => !seenStrapiIds.has(l.documentId))
      .map((l) => ({
        documentId: l.documentId,
        fullName: l.fullName ?? '(sin nombre)',
        organization: l.organization ?? null,
        email: l.email ?? '',
        sector: l.sector ?? null,
        questionGoal: l.questionGoal ?? null,
        projectPhase: l.projectPhase ?? null,
        deadline: l.deadline ?? null,
        createdAt: l.createdAt ?? null,
      }));
  } catch (e) {
    console.warn('[admin:getConsultingLeads] Strapi failed (histórico):', e);
  }

  // 3. Merge y orden por fecha descendente (nulls al final).
  return [...neon, ...strapiOnly].sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

// ─── Mensajes de contacto (contact_messages, Neon) ─────────────────────
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
}

export async function getContactMessages(opts: { limit?: number } = {}): Promise<ContactMessage[]> {
  const { limit = 200 } = opts;
  try {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      subject: r.subject,
      message: r.message,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (e) {
    console.warn('[admin:getContactMessages] failed:', e);
    return [];
  }
}

// ─── Reintentar sync a Klaviyo de un lead de captación ─────────────────
export async function resyncKlaviyo(params: {
  actor: string;
  leadId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { actor, leadId } = params;
  if (!isKlaviyoConfigured()) {
    return { ok: false, error: 'Klaviyo no está configurado (falta KLAVIYO_PRIVATE_API_KEY).' };
  }

  const [lead] = await db
    .select()
    .from(leadCaptureLog)
    .where(eq(leadCaptureLog.id, leadId))
    .limit(1);
  if (!lead) return { ok: false, error: 'Lead no encontrado.' };

  try {
    const [first, ...rest] = lead.name ? lead.name.split(/\s+/) : [];
    await upsertProfile({
      email: lead.email,
      firstName: first || undefined,
      lastName: rest.length ? rest.join(' ') : undefined,
      properties: {
        lifecycle_stage: 'lead',
        ...(lead.resourceSlug ? { last_resource_downloaded: lead.resourceSlug } : {}),
      },
    });
    if (lead.resourceTitle) {
      await trackEvent({
        email: lead.email,
        metric: 'Resource Downloaded',
        properties: { resource_title: lead.resourceTitle, resource_slug: lead.resourceSlug ?? '' },
      });
    }
    if (LIST_ID) {
      await subscribeToList({ email: lead.email, listId: LIST_ID, consent: lead.consent });
    }
    await db
      .update(leadCaptureLog)
      .set({ klaviyoSyncedAt: new Date(), klaviyoError: null })
      .where(eq(leadCaptureLog.id, leadId));
    await writeAudit({ actor, action: 'resync_klaviyo', entityType: 'lead', entityId: leadId, diff: { email: lead.email } });
    return { ok: true };
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    await db
      .update(leadCaptureLog)
      .set({ klaviyoError: error.slice(0, 1000) })
      .where(eq(leadCaptureLog.id, leadId))
      .catch(() => {});
    await writeAudit({ actor, action: 'resync_klaviyo', entityType: 'lead', entityId: leadId, diff: { email: lead.email, error } });
    return { ok: false, error };
  }
}
