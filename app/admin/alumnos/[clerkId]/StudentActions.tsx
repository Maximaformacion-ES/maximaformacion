'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Enrollment {
  documentId: string;
  title: string;
  accessType: string;
  purchasedAt: string | null;
  percent: number | null;
}

interface Props {
  clerkId: string;
  plan: string;
  enrollments: Enrollment[];
}

export default function StudentActions({ clerkId, plan, enrollments }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [grantDocId, setGrantDocId] = useState('');
  const [notify, setNotify] = useState(true);

  const base = `/api/admin/students/${clerkId}`;

  async function run(key: string, req: () => Promise<Response>) {
    setBusy(key);
    setMsg(null);
    try {
      const res = await req();
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: summarize(data) });
        router.refresh();
      } else {
        setMsg({ ok: false, text: data?.error || `Error ${res.status}` });
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  const isPro = plan === 'pro';

  function grant() {
    const documentId = grantDocId.trim();
    if (!documentId) return;
    run('grant', () =>
      fetch(`${base}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, notify }),
      })
    ).then(() => setGrantDocId(''));
  }

  function togglePro() {
    run('pro', () =>
      fetch(`${base}/pro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPro: !isPro }),
      })
    );
  }

  async function revoke(documentId: string, title: string) {
    // 1) dry-run
    setBusy(`revoke:${documentId}`);
    setMsg(null);
    try {
      const dry = await fetch(`${base}/access?documentId=${encodeURIComponent(documentId)}`, {
        method: 'DELETE',
      });
      const dryData = await dry.json().catch(() => ({}));
      const moodle = dryData?.steps?.[0]?.detail?.wouldUnenrolMoodle ? ' + baja en Moodle' : '';
      if (!window.confirm(`Revocar acceso a "${title}"${moodle}? Esta acción es destructiva.`)) {
        setBusy(null);
        return;
      }
      // 2) confirm
      const res = await fetch(
        `${base}/access?documentId=${encodeURIComponent(documentId)}&confirm=true`,
        { method: 'DELETE' }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMsg({ ok: true, text: `Acceso revocado a "${title}".` });
        router.refresh();
      } else {
        setMsg({ ok: false, text: data?.error || `Error ${res.status}` });
      }
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  function reprovision(documentId: string) {
    run(`reprov:${documentId}`, () =>
      fetch(`${base}/reprovision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {msg && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            msg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* PRO + conceder acceso */}
      <div className="flex flex-wrap items-end gap-4">
        <button
          onClick={togglePro}
          disabled={busy === 'pro'}
          className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors ${
            isPro
              ? 'bg-zinc-100 text-zinc-700 border border-zinc-200 hover:bg-zinc-200'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {busy === 'pro' ? '…' : isPro ? 'Quitar PRO' : 'Dar PRO'}
        </button>

        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-zinc-500 mb-1">Conceder acceso (documentId de Strapi)</label>
            <input
              value={grantDocId}
              onChange={(e) => setGrantDocId(e.target.value)}
              placeholder="documentId del programa o curso Maxymia"
              className="w-72 rounded-md bg-white border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-300"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-500 pb-2.5">
            <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            avisar
          </label>
          <button
            onClick={grant}
            disabled={busy === 'grant' || !grantDocId.trim()}
            className="rounded-md bg-zinc-900 text-white hover:bg-zinc-700 px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {busy === 'grant' ? '…' : 'Conceder'}
          </button>
        </div>
      </div>

      {/* Matrículas */}
      <section>
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          Matrículas ({enrollments.length})
        </h2>
        <div className="rounded-lg border border-zinc-200">
          {enrollments.length === 0 ? (
            <p className="p-4 text-sm text-zinc-400">Sin matrículas.</p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {enrollments.map((e) => (
                <li key={e.documentId} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-zinc-900 truncate">{e.title}</div>
                    <div className="text-xs text-zinc-500">
                      {e.accessType}
                      {e.percent != null && ` · ${e.percent}%`}
                      <span className="text-zinc-400"> · {e.documentId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => reprovision(e.documentId)}
                      disabled={busy === `reprov:${e.documentId}`}
                      title="Re-ejecutar alta en Moodle (solo programas)"
                      className="rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-50 px-2.5 py-1.5 text-xs disabled:opacity-50 transition-colors"
                    >
                      {busy === `reprov:${e.documentId}` ? '…' : 'Re-provisionar'}
                    </button>
                    <button
                      onClick={() => revoke(e.documentId, e.title)}
                      disabled={busy === `revoke:${e.documentId}`}
                      className="rounded-md border border-red-300 text-red-600 hover:bg-red-50 px-2.5 py-1.5 text-xs disabled:opacity-50 transition-colors"
                    >
                      {busy === `revoke:${e.documentId}` ? '…' : 'Revocar'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function summarize(data: unknown): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if ('plan' in d) return `Plan actualizado a "${String(d.plan)}".`;
    if ('steps' in d && Array.isArray(d.steps)) {
      const failed = (d.steps as { step: string; ok: boolean }[]).filter((s) => !s.ok);
      return failed.length === 0
        ? 'Hecho. Todos los pasos OK.'
        : `Hecho con avisos: fallaron ${failed.map((s) => s.step).join(', ')}.`;
    }
    if ('ok' in d) return d.ok ? 'Hecho.' : `Error: ${String(d.error ?? 'desconocido')}`;
  }
  return 'Hecho.';
}
