import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import SapoLegalLayout from '../(legal)/SapoLegalLayout';

export const metadata: Metadata = {
  title: 'SAPO — Terms of Service',
  description:
    'Terms of Service for the premium subscription of the SAPO — Statistical Assistant mobile application.',
  alternates: { canonical: '/sapo-terms-of-service' },
  robots: { index: false, follow: false },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'app', '(legal)', '_sapo-terms.html'),
  'utf8',
);

export default function SapoTermsOfServicePage() {
  return <SapoLegalLayout title="Terms of Service" bodyHtml={bodyHtml} />;
}
