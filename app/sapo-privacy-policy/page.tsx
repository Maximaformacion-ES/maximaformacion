import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import SapoLegalLayout from '../(legal)/SapoLegalLayout';

export const metadata: Metadata = {
  title: 'SAPO — Privacy Policy',
  description:
    'Privacy Policy of the SAPO statistical assistant application, owned by Biomáxima Información y Experimentación Científica SLU.',
  alternates: { canonical: '/sapo-privacy-policy' },
  robots: { index: false, follow: false },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'app', '(legal)', '_sapo-privacy.html'),
  'utf8',
);

export default function SapoPrivacyPolicyPage() {
  return <SapoLegalLayout title="Privacy Policy" bodyHtml={bodyHtml} />;
}
