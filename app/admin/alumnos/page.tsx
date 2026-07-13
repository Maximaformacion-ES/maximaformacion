import Link from 'next/link';
import { listStudents } from '@/lib/admin/students';

export const dynamic = 'force-dynamic';

export default async function AlumnosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const limit = 25;

  const { items, total } = await listStudents({ query: q, limit, offset: (page - 1) * limit });
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Alumnos</h1>
        <span className="text-sm text-zinc-500">{total} en total</span>
      </div>

      <form method="get" className="mb-5 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o email…"
          className="w-full max-w-sm rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
        <button type="submit" className="rounded-md bg-amber-500 text-black px-4 py-2 text-sm font-medium">
          Buscar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="text-left font-medium px-4 py-2.5">Alumno</th>
              <th className="text-left font-medium px-4 py-2.5">Email</th>
              <th className="text-left font-medium px-4 py-2.5">Plan</th>
              <th className="text-right font-medium px-4 py-2.5">Cursos</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              items.map((s) => (
                <tr key={s.clerkId} className="border-t border-zinc-800/70 hover:bg-zinc-900/50">
                  <td className="px-4 py-2.5">
                    <Link href={`/admin/alumnos/${s.clerkId}`} className="text-amber-400 hover:underline">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-zinc-300">{s.email ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={
                        s.plan === 'pro'
                          ? 'rounded-full bg-amber-500/15 text-amber-300 px-2 py-0.5 text-xs font-medium'
                          : 'text-zinc-500 text-xs'
                      }
                    >
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-zinc-300">{s.enrollmentCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <PageLink q={q} page={page - 1} disabled={page <= 1} label="← Anterior" />
          <span className="text-zinc-500">
            Página {page} de {totalPages}
          </span>
          <PageLink q={q} page={page + 1} disabled={page >= totalPages} label="Siguiente →" />
        </div>
      )}
    </div>
  );
}

function PageLink({ q, page, disabled, label }: { q: string; page: number; disabled: boolean; label: string }) {
  if (disabled) return <span className="text-zinc-700">{label}</span>;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  return (
    <Link href={`/admin/alumnos?${params.toString()}`} className="text-zinc-300 hover:text-white">
      {label}
    </Link>
  );
}
