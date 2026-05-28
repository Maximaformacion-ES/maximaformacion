import { getServerUserState } from '@/lib/auth/server-user-state';
import PricingClient from './PricingClient';

// `auth()` inside getServerUserState opts the route into per-request
// rendering. The page's user-aware bits (Pro plan, trial used, etc.)
// resolve before the first paint so /pricing no longer flashes the
// "Probar Pro 1€" CTA at users who have already used their trial.
//
// SEO note: the metadata for this route lives in ./layout.tsx so the
// indexable surface (title, description, OG, canonical) is unaffected
// by the dynamic switch — crawlers see the same HTML they did before.
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  const initialUserState = await getServerUserState();
  return <PricingClient initialUserState={initialUserState} />;
}
