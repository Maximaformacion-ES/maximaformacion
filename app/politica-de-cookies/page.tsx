import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import LegalLayout from '../(legal)/LegalLayout';

export const metadata: Metadata = {
  title: 'Política de Cookies | Máxima Formación',
  description:
    'Información sobre el uso de cookies en el sitio web de Máxima Formación, S.L.U., conforme a la LSSI y al RGPD.',
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'app', '(legal)', '_cookies.html'),
  'utf8',
);

export default function PoliticaCookiesPage() {
  return <LegalLayout title="Política de Cookies" lastUpdated="11 de mayo de 2026" bodyHtml={bodyHtml} />;
}
