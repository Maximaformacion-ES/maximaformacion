'use client';

import { useState } from 'react';
import { CheckCircle, Loader2, MailX } from 'lucide-react';

/** Confirmación de baja/alta de comunicaciones comerciales (enlace del email). */
export default function BajaClient({
  u,
  t,
  initialOptedOut,
}: {
  u: string;
  t: string;
  initialOptedOut: boolean;
}) {
  const [optedOut, setOptedOut] = useState(initialOptedOut);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(optOut: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/baja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ u, t, optOut }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || `Error ${res.status}`);
      setOptedOut(optOut);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  }

  if (optedOut) {
    return (
      <>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mx-orange/10 border border-mx-orange/30 mb-5">
          <CheckCircle size={26} className="text-mx-orange" />
        </div>
        <h1 className="text-heading-sm font-bold mb-3">Baja confirmada</h1>
        <p className="text-body-sm text-mx-text-muted mb-6">
          No volverás a recibir comunicaciones comerciales de Máxima Formación. Si tienes cursos
          contratados, seguirás recibiendo los emails relativos a tu formación.
        </p>
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={busy}
          className="text-body-sm text-mx-orange underline disabled:opacity-50"
        >
          {busy ? 'Guardando…' : 'Me lo he pensado: volver a suscribirme'}
        </button>
        {error && <p className="mt-3 text-body-sm text-red-600">{error}</p>}
      </>
    );
  }

  return (
    <>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mx-blue/10 border border-mx-blue/30 mb-5">
        <MailX size={26} className="text-mx-blue" />
      </div>
      <h1 className="text-heading-sm font-bold mb-3">¿Dejar de recibir comunicaciones?</h1>
      <p className="text-body-sm text-mx-text-muted mb-6">
        Dejarás de recibir <strong>comunicaciones comerciales</strong> (novedades, ofertas). Los
        emails relativos a los cursos que tengas contratados seguirán llegándote con normalidad.
      </p>
      <button
        type="button"
        onClick={() => submit(true)}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-xl bg-mx-orange px-6 py-3 text-body-sm font-semibold text-white hover:bg-mx-orange-dark transition-colors disabled:opacity-60"
      >
        {busy && <Loader2 size={16} className="animate-spin" />}
        Confirmar baja
      </button>
      {error && <p className="mt-3 text-body-sm text-red-600">{error}</p>}
      <p className="mt-4 text-xs text-mx-text-muted">
        También puedes gestionarlo cuando quieras desde tu perfil en la plataforma.
      </p>
    </>
  );
}
