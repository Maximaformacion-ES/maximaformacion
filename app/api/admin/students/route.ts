import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { importStudent, type ImportCourse } from '@/lib/admin/import-students';

/**
 * POST → alta (o reutilización) de UN alumno + matrículas + email de contraseña.
 * body: { email, firstName?, lastName?, courses?: [{ documentId, title }] }
 *
 * La importación masiva (CSV) llama a este mismo endpoint una vez por fila desde
 * el cliente, con throttle y barra de progreso — así no dependemos de una
 * función serverless de larga duración ni del rate-limit en un único request.
 */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    firstName?: string;
    lastName?: string;
    courses?: ImportCourse[];
  };

  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Email obligatorio y válido' }, { status: 400 });
  }

  const result = await importStudent(
    {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      courses: Array.isArray(body.courses) ? body.courses.filter((c) => c?.documentId) : [],
    },
    { actor: gate.userId },
  );

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
