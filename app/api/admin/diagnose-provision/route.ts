import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { strapiRequest } from '@/lib/strapi/client';
import type { StrapiSingleResponse, StrapiProgram } from '@/lib/strapi/types';
import { provisionMoodleAccess } from '@/lib/moodle/provision';

/**
 * Mirror of what the Stripe webhook does after a successful checkout, but
 * runnable on demand and reporting each step in the HTTP response instead
 * of swallowing failures into Vercel logs.
 *
 * GET /api/admin/diagnose-provision?documentId=...&email=...
 *
 * Auth: signed-in user with an @atlansec.es address. This is a diagnostic
 * tool, not a public surface — gated by domain to keep it cheap.
 */
export async function GET(request: Request) {
  const steps: Array<{ step: string; ok: boolean; detail?: unknown }> = [];

  function record(step: string, ok: boolean, detail?: unknown) {
    steps.push({ step, ok, detail });
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await currentUser();
    const myEmail = me?.emailAddresses?.[0]?.emailAddress ?? '';
    if (!myEmail.endsWith('@atlansec.es')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId') ?? '';
    const email = url.searchParams.get('email') ?? '';

    if (!documentId || !email) {
      return NextResponse.json(
        { error: 'documentId and email query params are required' },
        { status: 400 }
      );
    }

    record('env:STRAPI_URL', !!process.env.STRAPI_URL, process.env.STRAPI_URL);
    record('env:STRAPI_API_TOKEN', !!process.env.STRAPI_API_TOKEN);
    record('env:RESEND_API_KEY', !!process.env.RESEND_API_KEY);
    record('env:EMAIL_FROM', !!process.env.EMAIL_FROM, process.env.EMAIL_FROM);
    record('env:MOODLE_MAXIMA_URL', !!process.env.MOODLE_MAXIMA_URL, process.env.MOODLE_MAXIMA_URL);
    record('env:MOODLE_MAXIMA_TOKEN', !!process.env.MOODLE_MAXIMA_TOKEN);
    record('env:MOODLE_MAXYMIA_URL', !!process.env.MOODLE_MAXYMIA_URL, process.env.MOODLE_MAXYMIA_URL);
    record('env:MOODLE_MAXYMIA_TOKEN', !!process.env.MOODLE_MAXYMIA_TOKEN);

    let program: StrapiProgram | null = null;
    try {
      const response = await strapiRequest<StrapiSingleResponse<StrapiProgram>>(
        `/api/programs/${documentId}?populate=*`,
        { revalidate: 0 }
      );
      program = response.data;
      record('strapi:fetch-program', !!program, {
        title: program?.title,
        type: program?.type,
        moodleCourseId: program?.moodleCourseId,
        moodle: program?.moodle,
      });
    } catch (e) {
      record('strapi:fetch-program', false, e instanceof Error ? e.message : String(e));
      return NextResponse.json({ ok: false, steps }, { status: 200 });
    }

    if (!program) {
      record('strapi:program-exists', false, 'Strapi returned no program');
      return NextResponse.json({ ok: false, steps }, { status: 200 });
    }

    if (!program.moodleCourseId || !program.moodle) {
      record('program:has-moodle-config', false, {
        moodleCourseId: program.moodleCourseId,
        moodle: program.moodle,
        hint: 'Webhook would skip provisioning here. Fill these fields in Strapi.',
      });
      return NextResponse.json({ ok: false, steps }, { status: 200 });
    }
    record('program:has-moodle-config', true);

    try {
      const result = await provisionMoodleAccess({
        email,
        firstname: 'Diagnostic',
        lastname: 'Run',
        programTitle: program.title,
        programType: program.type,
        moodleInstance: program.moodle,
        moodleCourseId: program.moodleCourseId,
      });
      record('provision:run', true, result);
      return NextResponse.json({ ok: true, steps });
    } catch (e) {
      record('provision:run', false, e instanceof Error ? e.message : String(e));
      return NextResponse.json({ ok: false, steps }, { status: 200 });
    }
  } catch (e) {
    record('handler', false, e instanceof Error ? e.message : String(e));
    return NextResponse.json({ ok: false, steps }, { status: 500 });
  }
}
