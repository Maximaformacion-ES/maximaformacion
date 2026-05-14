import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import LegalLayout from '../(legal)/LegalLayout';

export const metadata: Metadata = {
  title: 'Aviso Legal | Máxima Formación',
  description:
    'Aviso legal y condiciones generales de uso del sitio web de Máxima Formación, S.L.U.',
  alternates: { canonical: '/aviso-legal' },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'app', '(legal)', '_legal.html'),
  'utf8',
);

export default function AvisoLegalPage() {
  return <LegalLayout title="Aviso Legal" lastUpdated="11 de mayo de 2026" bodyHtml={bodyHtml} />;
}
