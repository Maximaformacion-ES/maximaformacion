import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { listCampaigns } from '@/lib/email/campaign';

/** GET → últimas campañas de email (historial). requireAdmin. */
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;
  const campaigns = await listCampaigns();
  return NextResponse.json({ campaigns });
}
