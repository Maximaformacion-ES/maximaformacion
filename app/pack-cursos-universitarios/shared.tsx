'use client';

import React, { useState } from 'react';
import { m } from 'framer-motion';
import { toast } from 'sonner';
import { Loader2, Send, X } from 'lucide-react';

/** Modal de compra: pedimos nombre y email ANTES de ir a Stripe porque el
 *  email es la clave de deduplicación (quien compró el pack no puede volver a
 *  comprar un curso suelto) y queda fijado como customer_email del checkout. */
export function PurchaseModal({
  item,
  title,
  price,
  returnPath,
  onClose,
}: {
  item: string;
  title: string;
  price: number;
  /** Página a la que vuelve el usuario si cancela en Stripe. */
  returnPath: string;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/pack/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, email, name, returnPath }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo iniciar el pago. Inténtalo de nuevo.');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
      setSending(false);
    }
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <m.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="w-full max-w-md bg-mx-card rounded-2xl border border-mx-border p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-heading-sm font-bold text-mx-blue leading-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="shrink-0 text-mx-text-muted hover:text-mx-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-body-sm text-mx-text-muted mb-6">
          Importe: <span className="font-bold text-mx-text">{price} €</span> · pago único y seguro con Stripe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="pack-name" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
              Nombre y apellidos
            </label>
            <input
              id="pack-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-3 text-body-sm text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="pack-email" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
              Email
            </label>
            <input
              id="pack-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-3 text-body-sm text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50"
            />
            <p className="text-[13px] text-mx-text-muted/80 leading-snug">
              Usaremos este email para confirmarte la compra y avisarte cuando tu acceso esté disponible.
            </p>
          </div>

          {error && (
            <p className="text-body-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="group w-full bg-mx-orange text-white py-4 rounded-xl font-bold text-label-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mx-orange-dark transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Preparando el pago…
              </>
            ) : (
              <>Continuar al pago seguro</>
            )}
          </button>
        </form>
      </m.div>
    </m.div>
  );
}

/** Formulario de consulta (pack o curso suelto). Reutiliza el endpoint
 *  público de /contacto fijando `subject` al título del producto: el aviso
 *  llega al equipo etiquetado (asunto del email + columna Curso en
 *  /admin/leads) y queda guardado igual en campus.contact_messages. */
export function ConsultaForm({ subject, placeholder }: { subject: string; placeholder: string }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, subject }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar la consulta');
      }
      toast.success('Consulta enviada. Te responderemos muy pronto.');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar la consulta', {
        description: 'Inténtalo de nuevo o escríbenos a cursos@maximaformacion.es.',
      });
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    'w-full bg-mx-bg border border-mx-border rounded-xl px-4 py-4 text-body-sm text-mx-text focus:outline-none focus:border-mx-orange transition-colors placeholder:text-mx-text-muted/50';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="consulta-nombre" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
            Nombre
          </label>
          <input
            id="consulta-nombre"
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Tu nombre"
            className={inputCls}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="consulta-email" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
            Email
          </label>
          <input
            id="consulta-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="tu@email.com"
            className={inputCls}
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="consulta-mensaje" className="text-label-sm uppercase tracking-widest text-mx-text-muted font-medium">
          Tu consulta
        </label>
        <textarea
          id="consulta-mensaje"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder={placeholder}
          className={`${inputCls} resize-none`}
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="group w-full sm:w-auto bg-mx-orange text-white px-10 py-4 rounded-xl font-bold text-label-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-mx-orange-dark transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {sending ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Enviando…
          </>
        ) : (
          <>
            Enviar consulta
            <Send size={16} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
