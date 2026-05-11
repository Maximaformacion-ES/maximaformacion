import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db/client';
import { certificates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { CheckCircle2, XCircle, Calendar, GraduationCap, User, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Verificar certificado | Máxima Formación',
  description: 'Verifica la autenticidad de un certificado emitido por Máxima Formación.',
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ code: string }>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { code } = await params;

  let cert: typeof certificates.$inferSelect | null = null;
  if (UUID_RE.test(code)) {
    const rows = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, code))
      .limit(1);
    cert = rows[0] ?? null;
  }

  const valid = cert !== null && cert.revokedAt === null;
  const revoked = cert !== null && cert.revokedAt !== null;

  return (
    <div className="min-h-screen bg-mx-bg text-mx-text px-6 py-16 md:py-24">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-mx-text-muted hover:text-mx-orange text-label-md mb-8 transition-colors"
        >
          ← Máxima Formación
        </Link>

        <div className="bg-mx-card border border-mx-border rounded-2xl p-8 md:p-12 shadow-sm">
          {valid && cert ? (
            <ValidView cert={cert} />
          ) : revoked && cert ? (
            <RevokedView cert={cert} />
          ) : (
            <NotFoundView code={code} />
          )}
        </div>

        <p className="mt-8 text-center text-mx-text-muted text-body-sm font-light flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-mx-blue" />
          Verificación pública oficial · maximaformacion.es
        </p>
      </div>
    </div>
  );
}

function ValidView({ cert }: { cert: typeof certificates.$inferSelect }) {
  const formatDate = (d: Date) =>
    d.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <>
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-4">
          <CheckCircle2 size={36} className="text-green-600" strokeWidth={2} />
        </div>
        <h1 className="text-mx-text text-heading-md md:text-heading-lg font-black mb-2">
          Certificado válido
        </h1>
        <p className="text-mx-text-muted text-body-sm md:text-body-md font-light max-w-md">
          Este certificado fue emitido oficialmente por Máxima Formación y no ha sido revocado.
        </p>
      </div>

      <dl className="space-y-5 border-t border-mx-border pt-6">
        <Row icon={User} label="Alumno">
          {cert.studentName}
        </Row>
        <Row icon={GraduationCap} label="Curso">
          {cert.courseTitle}
        </Row>
        {cert.instructor && (
          <Row icon={User} label="Instructor">
            {cert.instructor}
          </Row>
        )}
        <Row icon={Calendar} label="Fecha de finalización">
          {formatDate(cert.completedAt)}
        </Row>
        <Row icon={Calendar} label="Fecha de emisión">
          {formatDate(cert.issuedAt)}
        </Row>
        <Row icon={ShieldCheck} label="Código de verificación">
          <span className="font-mono text-body-sm break-all">{cert.id}</span>
        </Row>
      </dl>
    </>
  );
}

function RevokedView({ cert }: { cert: typeof certificates.$inferSelect }) {
  return (
    <div className="text-center">
      <div className="inline-flex w-16 h-16 rounded-full bg-red-50 border border-red-200 items-center justify-center mb-4">
        <XCircle size={36} className="text-red-600" strokeWidth={2} />
      </div>
      <h1 className="text-mx-text text-heading-md md:text-heading-lg font-black mb-2">
        Certificado revocado
      </h1>
      <p className="text-mx-text-muted text-body-sm md:text-body-md font-light max-w-md mx-auto">
        Este certificado fue emitido para <span className="font-medium text-mx-text">{cert.studentName}</span> en
        el curso <span className="font-medium text-mx-text">{cert.courseTitle}</span> pero ha sido revocado y ya
        no es válido.
      </p>
    </div>
  );
}

function NotFoundView({ code }: { code: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex w-16 h-16 rounded-full bg-red-50 border border-red-200 items-center justify-center mb-4">
        <XCircle size={36} className="text-red-600" strokeWidth={2} />
      </div>
      <h1 className="text-mx-text text-heading-md md:text-heading-lg font-black mb-2">
        Certificado no encontrado
      </h1>
      <p className="text-mx-text-muted text-body-sm md:text-body-md font-light max-w-md mx-auto mb-6">
        No existe ningún certificado con este código de verificación. Comprueba que el código está
        bien escrito o escanea de nuevo el QR del certificado.
      </p>
      <p className="text-mx-text-muted text-label-md font-mono break-all">{code}</p>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="text-mx-orange shrink-0 mt-0.5">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <dt className="text-mx-text-muted text-label-sm tracking-widest uppercase mb-1">
          {label}
        </dt>
        <dd className="text-mx-text text-body-md md:text-body-lg font-medium">{children}</dd>
      </div>
    </div>
  );
}
