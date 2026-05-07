'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle, Loader2, Send } from 'lucide-react';

const SECTORS = [
  { value: 'bioestadistica-salud', label: 'Bioestadística / Salud' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'academia', label: 'Academia' },
  { value: 'otro', label: 'Otro' },
] as const;

const PHASES = [
  { value: 'idea', label: 'Solo tengo una idea (necesito diseño experimental)' },
  { value: 'datos-recogidos', label: 'Ya recolecté los datos (necesito análisis)' },
  { value: 'necesita-validacion', label: 'Ya tengo un análisis, pero necesito validación o corrección' },
] as const;

const FORMATS = [
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'sql', label: 'SQL' },
  { value: 'papel', label: 'Papel / Físico' },
  { value: 'otros', label: 'Otros' },
] as const;

const OUTPUTS = [
  { value: 'informe-ejecutivo', label: 'Informe ejecutivo con conclusiones' },
  { value: 'graficos', label: 'Gráficos y visualizaciones listas para publicar' },
  { value: 'codigo', label: 'Código fuente (R, Python, etc.)' },
  { value: 'base-datos-limpia', label: 'Base de datos limpia y curada' },
  { value: 'sesion-consultoria', label: 'Una sesión de consultoría para explicar los resultados' },
] as const;

type OutputValue = (typeof OUTPUTS)[number]['value'];

export default function ConsultoriaForm() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<Set<OutputValue>>(new Set());

  const toggleOutput = (value: OutputValue) => {
    setOutputs((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = formData.get(k);
      return typeof v === 'string' ? v.trim() : '';
    };
    const rows = Number(formData.get('rowsEstimate'));
    const cols = Number(formData.get('columnsEstimate'));
    const payload = {
      fullName: get('fullName'),
      organization: get('organization') || undefined,
      email: get('email'),
      sector: get('sector') || undefined,
      questionGoal: get('questionGoal'),
      projectPhase: get('projectPhase') || undefined,
      dataSource: get('dataSource') || undefined,
      rowsEstimate: Number.isFinite(rows) && rows > 0 ? rows : undefined,
      columnsEstimate: Number.isFinite(cols) && cols > 0 ? cols : undefined,
      dataFormat: get('dataFormat') || undefined,
      expectedOutputs: [...outputs],
      deadline: get('deadline') || undefined,
      observations: get('observations') || undefined,
    };

    try {
      setSubmitting(true);
      const res = await fetch('/api/consultoria/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mx-orange/10 border border-mx-orange/30 mb-6">
          <CheckCircle size={28} className="text-mx-orange" />
        </div>
        <h2 className="text-mx-text text-heading-md md:text-heading-lg font-bold mb-3">
          ¡Gracias! Hemos recibido tu consulta
        </h2>
        <p className="text-mx-text/60 text-body-md">
          Te contactaremos en las próximas 24–48 horas al email que nos has facilitado.
        </p>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 text-center">
        <p className="text-mx-orange text-label-md tracking-[0.3em] uppercase font-semibold mb-3">
          Consulta gratuita
        </p>
        <h2 className="text-mx-text text-heading-md md:text-heading-lg font-bold mb-3">
          Cuéntanos tu proyecto
        </h2>
        <p className="text-mx-text/60 text-body-md">
          Rellena el formulario y preparamos una propuesta adaptada a tus datos y objetivos.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* 1. Contacto */}
        <FormBlock number={1} title="Información de contacto">
          <Field label="Nombre completo u organización" required>
            <input
              name="fullName"
              type="text"
              required
              placeholder="Ejemplo: Ana Pérez · Bioestat Labs"
              className={inputCls}
            />
          </Field>
          <Field label="Correo electrónico" required>
            <input
              name="email"
              type="email"
              required
              placeholder="Ejemplo: ana.perez@bioestatlabs.com"
              className={inputCls}
            />
          </Field>
          <Field label="Sector de actividad" required>
            <select name="sector" required defaultValue="" className={inputCls}>
              <option value="" disabled>Selecciona un sector</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>
        </FormBlock>

        {/* 2. Contexto */}
        <FormBlock number={2} title="El contexto">
          <Field label="¿Qué pregunta quieres responder con tus datos?" required>
            <textarea
              name="questionGoal"
              required
              rows={4}
              placeholder='Ejemplo: "Quiero saber si el nuevo fármaco es más efectivo que el anterior" o "Busco entender por qué pierdo clientes"'
              className={textareaCls}
            />
          </Field>
          <Field label="¿En qué fase se encuentra tu proyecto?" required>
            <div className="space-y-2">
              {PHASES.map((p) => (
                <label
                  key={p.value}
                  className="flex items-start gap-3 px-4 py-3 rounded-lg border border-mx-text/10 hover:border-mx-orange/40 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="projectPhase"
                    value={p.value}
                    required
                    className="mt-1 accent-mx-orange"
                  />
                  <span className="text-mx-text/80 text-body-sm">{p.label}</span>
                </label>
              ))}
            </div>
          </Field>
        </FormBlock>

        {/* 3. Datos */}
        <FormBlock number={3} title="Radiografía de los datos">
          <Field label="¿De dónde vienen los datos?">
            <input
              name="dataSource"
              type="text"
              placeholder="Ejemplo: Ensayos clínicos, encuestas, sensores, base de datos interna"
              className={inputCls}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nº de individuos / filas (aprox.)">
              <input
                name="rowsEstimate"
                type="number"
                min={0}
                placeholder="Ejemplo: 1200"
                className={inputCls}
              />
            </Field>
            <Field label="Nº de variables / columnas (aprox.)">
              <input
                name="columnsEstimate"
                type="number"
                min={0}
                placeholder="Ejemplo: 25"
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Formato de los datos">
            <select name="dataFormat" defaultValue="" className={inputCls}>
              <option value="">Selecciona un formato</option>
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </FormBlock>

        {/* 4. Necesidades */}
        <FormBlock number={4} title="Qué esperas recibir">
          <div className="space-y-2">
            {OUTPUTS.map((o) => {
              const checked = outputs.has(o.value);
              return (
                <label
                  key={o.value}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? 'border-mx-orange/60 bg-mx-orange/5'
                      : 'border-mx-text/10 hover:border-mx-orange/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOutput(o.value)}
                    className="mt-1 accent-mx-orange"
                  />
                  <span className="text-mx-text/80 text-body-sm">{o.label}</span>
                </label>
              );
            })}
          </div>
        </FormBlock>

        {/* 5. Logística */}
        <FormBlock number={5} title="Logística y plazos">
          <Field label="Fecha límite para la entrega de resultados">
            <input name="deadline" type="date" className={inputCls} />
          </Field>
          <Field label="Observaciones adicionales">
            <textarea
              name="observations"
              rows={4}
              placeholder="Ejemplo: Necesitamos los resultados para presentarlos a un congreso en junio"
              className={textareaCls}
            />
          </Field>
        </FormBlock>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-red-400 text-body-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-mx-orange text-white px-8 py-3.5 rounded-full text-body-sm font-medium hover:bg-mx-orange/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Enviando…' : 'Enviar consulta'}
        </button>
      </form>
    </>
  );
}

const inputCls =
  'w-full bg-transparent border border-mx-text/15 rounded-lg px-4 py-3 text-mx-text placeholder:text-mx-text/30 text-body-sm focus:outline-none focus:border-mx-orange/60 transition-colors';
const textareaCls = inputCls + ' resize-y min-h-[100px]';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-mx-text/70 text-label-md mb-2 block">
        {label} {required && <span className="text-mx-orange">*</span>}
      </span>
      {children}
    </label>
  );
}

function FormBlock({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-mx-text/10 pt-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-mx-orange/10 border border-mx-orange/30 text-mx-orange text-label-md font-bold">
          {number}
        </span>
        <h3 className="text-mx-text text-body-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
