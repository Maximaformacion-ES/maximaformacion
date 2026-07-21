import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { listCourses } from '@/lib/admin/courses';

/** GET → lista de cursos/programas matriculables (para el buscador). requireAdmin. */
export async function GET() {
  const gate = await requireAdmin();
  if (gate instanceof NextResponse) return gate;

  const courses = await listCourses();
  return NextResponse.json({ courses });
}
