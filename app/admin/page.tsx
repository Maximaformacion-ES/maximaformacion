import Link from 'next/link';

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-xl font-semibold mb-2">Panel de administración</h1>
      <p className="text-zinc-400 mb-6 text-sm">
        Back-office de negocio (Fase 1: alumnos). Strapi sigue siendo el CMS de contenido.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <Link
          href="/admin/alumnos"
          className="rounded-lg border border-zinc-800 hover:border-zinc-600 p-5 transition-colors"
        >
          <div className="font-medium mb-1">Alumnos</div>
          <div className="text-sm text-zinc-500">
            Buscar, ver ficha 360, conceder/revocar acceso, PRO, re-provisionar Moodle.
          </div>
        </Link>
      </div>
    </div>
  );
}
