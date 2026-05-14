import type { Metadata } from 'next';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import LegalLayout from '../(legal)/LegalLayout';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Máxima Formación',
  description:
    'Información sobre el tratamiento de datos personales que realiza Máxima Formación, S.L.U. conforme al RGPD y a la LOPDGDD.',
  alternates: { canonical: '/politica-de-privacidad' },
};

const bodyHtml = readFileSync(
  path.join(process.cwd(), 'app', '(legal)', '_privacy.html'),
  'utf8',
);

export default function PoliticaPrivacidadPage() {
  return <LegalLayout title="Política de Privacidad" lastUpdated="11 de mayo de 2026" bodyHtml={bodyHtml} />;
}
