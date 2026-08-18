import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/client';
import { db } from '@/lib/db/client';
import { consultingLeads } from '@/lib/db/schema';

const STRAPI_URL = process.env.STRAPI_URL || '';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';
// Destinatarios de los leads de consultoría (WEB-56: además de cursos@, el
// equipo de consultoría en mrodriguez@maximaconsultoria.es). Coma-separado en la
// env para añadir/quitar sin tocar código.
const LEAD_NOTIFY_TO = (process.env.CONSULTING_LEAD_NOTIFY_TO || 'cursos@maximaformacion.es,mrodriguez@maximaconsultoria.es')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_SECTORS = ['bioestadistica-salud', 'marketing', 'finanzas', 'academia', 'otro'] as const;
const ALLOWED_PHASES = ['idea', 'datos-recogidos', 'necesita-validacion'] as const;
const ALLOWED_FORMATS = ['excel', 'csv', 'sql', 'papel', 'otros'] as const;
const ALLOWED_OUTPUTS = [
  'informe-ejecutivo',
  'graficos',
  'codigo',
  'base-datos-limpia',
  'sesion-consultoria',
] as const;

type Sector = (typeof ALLOWED_SECTORS)[number];
type Phase = (typeof ALLOWED_PHASES)[number];
type Format = (typeof ALLOWED_FORMATS)[number];
type Output = (typeof ALLOWED_OUTPUTS)[number];

interface LeadBody {
  fullName: string;
  organization?: string;
  email: string;
  sector: Sector;
  questionGoal: string;
  projectPhase: Phase;
  dataSource?: string;
  rowsEstimate?: number;
  columnsEstimate?: number;
  dataFormat?: Format;
  expectedOutputs?: Output[];
  deadline?: string;
  observations?: string;
}

const SECTOR_LABEL: Record<Sector, string> = {
  'bioestadistica-salud': 'Bioestadística / Salud',
  marketing: 'Marketing',
  finanzas: 'Finanzas',
  academia: 'Academia',
  otro: 'Otro',
};
const PHASE_LABEL: Record<Phase, string> = {
  idea: 'Solo tengo una idea',
  'datos-recogidos': 'Ya recolecté los datos',
  'necesita-validacion': 'Necesito validación o corrección',
};
const FORMAT_LABEL: Record<Format, string> = {
  excel: 'Excel',
  csv: 'CSV',
  sql: 'SQL',
  papel: 'Papel / Físico',
  otros: 'Otros',
};
const OUTPUT_LABEL: Record<Output, string> = {
  'informe-ejecutivo': 'Informe ejecutivo con conclusiones',
  graficos: 'Gráficos y visualizaciones',
  codigo: 'Código fuente (R, Python, etc.)',
  'base-datos-limpia': 'Base de datos limpia y curada',
  'sesion-consultoria': 'Sesión de consultoría',
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(body: unknown): { ok: true; data: LeadBody } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid body' };
  const b = body as Record<string, unknown>;

  const fullName = typeof b.fullName === 'string' ? b.fullName.trim() : '';
  if (!fullName) return { ok: false, error: 'Nombre requerido' };

  const email = typeof b.email === 'string' ? b.email.trim() : '';
  if (!isEmail(email)) return { ok: false, error: 'Email inválido' };

  const sector = b.sector as Sector;
  if (!ALLOWED_SECTORS.includes(sector)) return { ok: false, error: 'Sector inválido' };

  const questionGoal = typeof b.questionGoal === 'string' ? b.questionGoal.trim() : '';
  if (!questionGoal) return { ok: false, error: 'Pregunta requerida' };

  const projectPhase = b.projectPhase as Phase;
  if (!ALLOWED_PHASES.includes(projectPhase)) return { ok: false, error: 'Fase inválida' };

  const dataFormat = b.dataFormat as Format | undefined;
  if (dataFormat && !ALLOWED_FORMATS.includes(dataFormat)) return { ok: false, error: 'Formato inválido' };

  const expectedOutputs = Array.isArray(b.expectedOutputs)
    ? (b.expectedOutputs.filter((v) => typeof v === 'string' && ALLOWED_OUTPUTS.includes(v as Output)) as Output[])
    : [];

  const rowsEstimate = typeof b.rowsEstimate === 'number' && Number.isFinite(b.rowsEstimate)
    ? Math.max(0, Math.floor(b.rowsEstimate))
    : undefined;
  const columnsEstimate = typeof b.columnsEstimate === 'number' && Number.isFinite(b.columnsEstimate)
    ? Math.max(0, Math.floor(b.columnsEstimate))
    : undefined;

  const deadline = typeof b.deadline === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.deadline) ? b.deadline : undefined;

  return {
    ok: true,
    data: {
      fullName,
      organization: typeof b.organization === 'string' ? b.organization.trim() || undefined : undefined,
      email,
      sector,
      questionGoal,
      projectPhase,
      dataSource: typeof b.dataSource === 'string' ? b.dataSource.trim() || undefined : undefined,
      rowsEstimate,
      columnsEstimate,
      dataFormat,
      expectedOutputs,
      deadline,
      observations: typeof b.observations === 'string' ? b.observations.trim() || undefined : undefined,
    },
  };
}

async function saveToStrapi(lead: LeadBody): Promise<string | null> {
  if (!STRAPI_URL || !STRAPI_API_TOKEN) {
    console.warn('Strapi not configured — lead not saved to CMS');
    return null;
  }
  const res = await fetch(`${STRAPI_URL}/api/consulting-leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
    body: JSON.stringify({ data: lead }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Strapi lead save failed:', res.status, text);
    throw new Error(`Strapi save failed: ${res.status}`);
  }
  const json = await res.json();
  return json?.data?.documentId ?? json?.data?.id ?? null;
}

async function saveToNeon(lead: LeadBody, strapiId: string | null): Promise<void> {
  await db.insert(consultingLeads).values({
    strapiDocumentId: strapiId,
    fullName: lead.fullName,
    organization: lead.organization ?? null,
    email: lead.email,
    sector: lead.sector,
    questionGoal: lead.questionGoal,
    projectPhase: lead.projectPhase,
    deadline: lead.deadline ?? null,
    // Campos ricos que no tienen columna propia, para no perder nada.
    payload: {
      dataSource: lead.dataSource,
      rowsEstimate: lead.rowsEstimate,
      columnsEstimate: lead.columnsEstimate,
      dataFormat: lead.dataFormat,
      expectedOutputs: lead.expectedOutputs,
      observations: lead.observations,
    },
  });
}

function buildEmailHtml(lead: LeadBody): string {
  const row = (label: string, value: string | number | undefined) =>
    value === undefined || value === '' || value === null
      ? ''
      : `<tr><td style="padding:6px 12px;color:#666;background:#f5f5f5;font-weight:600">${label}</td><td style="padding:6px 12px">${value}</td></tr>`;

  const outputs = (lead.expectedOutputs ?? [])
    .map((o) => OUTPUT_LABEL[o])
    .join(', ');

  return `
    <div style="font-family:system-ui,sans-serif;color:#111;max-width:640px;margin:0 auto">
      <h2 style="color:#f59e0b;margin:0 0 16px">Nuevo lead de consultoría</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden">
        ${row('Nombre', lead.fullName)}
        ${row('Organización', lead.organization)}
        ${row('Email', `<a href="mailto:${lead.email}">${lead.email}</a>`)}
        ${row('Sector', SECTOR_LABEL[lead.sector])}
        ${row('Pregunta', lead.questionGoal)}
        ${row('Fase del proyecto', PHASE_LABEL[lead.projectPhase])}
        ${row('Origen de datos', lead.dataSource)}
        ${row('Filas (aprox.)', lead.rowsEstimate)}
        ${row('Columnas (aprox.)', lead.columnsEstimate)}
        ${row('Formato', lead.dataFormat ? FORMAT_LABEL[lead.dataFormat] : undefined)}
        ${row('Entregables esperados', outputs || undefined)}
        ${row('Fecha límite', lead.deadline)}
        ${row('Observaciones', lead.observations)}
      </table>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const result = validate(raw);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const lead = result.data;

  // Guardado dual, ambos best-effort:
  //  - Strapi (compat con el histórico existente).
  //  - Neon = fuente de verdad del panel admin.
  let strapiId: string | null = null;
  try {
    strapiId = await saveToStrapi(lead);
  } catch (err) {
    console.error('Strapi lead save failed:', err);
  }

  let savedToNeon = false;
  try {
    await saveToNeon(lead, strapiId);
    savedToNeon = true;
  } catch (err) {
    console.error('Neon lead save failed:', err);
  }

  // Si no se pudo guardar en NINGÚN sitio, el lead se perdería → error.
  if (!strapiId && !savedToNeon) {
    return NextResponse.json({ error: 'No se pudo guardar el lead' }, { status: 502 });
  }

  try {
    await sendEmail({
      to: LEAD_NOTIFY_TO,
      subject: `Nuevo lead de consultoría — ${lead.fullName}`,
      html: buildEmailHtml(lead),
      replyTo: lead.email,
    });
  } catch (emailErr) {
    console.error('Email notification failed:', emailErr);
  }

  return NextResponse.json({ success: true, id: strapiId });
}
