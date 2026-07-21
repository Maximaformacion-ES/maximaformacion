import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getLeads, getConsultingLeads } from '@/lib/admin/leads';

/** GET → leads de captación (Neon) + consultoría (Strapi). requireAdmin. */
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const [capture, consulting] = await Promise.all([getLeads({ limit: 200 }), getConsultingLeads()]);
  return NextResponse.json({ capture, consulting });
}
