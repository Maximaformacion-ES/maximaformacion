/**
 * Orchestrates the post-purchase Moodle provisioning flow:
 *   1. Look up or create the Moodle user
 *   2. Enrol the user in the corresponding course
 *   3. Send the credentials email
 *
 * Designed to be called from the Stripe webhook after a successful checkout.
 * Errors are logged and re-thrown so the webhook caller can decide whether
 * to swallow them (to avoid Stripe retries) or surface them.
 */

import {
  createMoodleUser,
  enrolUserInCourse,
  generateSecurePassword,
  getMoodleUrl,
  getMoodleUserByEmail,
  usernameFromEmail,
  type MoodleInstance,
} from './client';
import { sendEmail } from '@/lib/email/client';
import { moodleCredentialsEmail } from '@/lib/email/templates/moodle-credentials';

interface ProvisionParams {
  email: string;
  firstname: string;
  lastname: string;
  programTitle: string;
  programType: 'Master' | 'Curso';
  moodleInstance: MoodleInstance;
  moodleCourseId: number;
}

interface ProvisionResult {
  userId: number;
  username: string;
  wasNewUser: boolean;
}

/**
 * Wrap a step so its error surfaces with a clear phase tag in the logs.
 * The provisioning flow has four moving pieces (Moodle lookup, Moodle
 * create, Moodle enrol, Resend send); when something silently fails in
 * production we want to know which one — re-throwing with a labelled
 * message keeps the catch in the webhook informative.
 */
async function runPhase<T>(phase: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[provision:${phase}] failed: ${msg}`);
    throw new Error(`[${phase}] ${msg}`);
  }
}

export async function provisionMoodleAccess(
  params: ProvisionParams
): Promise<ProvisionResult> {
  const {
    email,
    firstname,
    lastname,
    programTitle,
    programType,
    moodleInstance,
    moodleCourseId,
  } = params;

  // 1. Check if the user already exists in Moodle
  let user = await runPhase('moodle:lookup', () =>
    getMoodleUserByEmail(moodleInstance, email)
  );
  let wasNewUser = false;
  let plainPassword: string | null = null;

  // 2. Create the user if needed
  if (!user) {
    plainPassword = generateSecurePassword();
    const created = await runPhase('moodle:create-user', () =>
      createMoodleUser(moodleInstance, {
        username: usernameFromEmail(email),
        password: plainPassword!,
        firstname: firstname || 'Alumno',
        lastname: lastname || 'Máxima',
        email,
      })
    );
    user = {
      id: created.id,
      username: created.username,
      firstname: firstname || 'Alumno',
      lastname: lastname || 'Máxima',
      email,
    };
    wasNewUser = true;
    console.log(
      `[provision] Created Moodle user "${user.username}" (id=${user.id}) on ${moodleInstance}`
    );
  } else {
    console.log(
      `[provision] Reusing existing Moodle user "${user.username}" (id=${user.id}) on ${moodleInstance}`
    );
  }

  // 3. Enrol in the course
  await runPhase('moodle:enrol', () =>
    enrolUserInCourse(moodleInstance, user!.id, moodleCourseId)
  );
  console.log(
    `[provision] Enrolled user ${user.id} in course ${moodleCourseId} on ${moodleInstance}`
  );

  // 4. Send credentials email
  //    - For new users: include the generated password
  //    - For existing users: just confirm enrollment, don't leak the password
  const moodleUrl = getMoodleUrl(moodleInstance);

  if (wasNewUser && plainPassword) {
    const { subject, html, text } = moodleCredentialsEmail({
      firstname: firstname || 'Alumno',
      programTitle,
      programType,
      username: user.username,
      password: plainPassword,
      moodleUrl,
    });
    await runPhase('email:credentials', () =>
      sendEmail({ to: email, subject, html, text })
    );
  } else {
    const subject = `Acceso confirmado a ${programTitle} | Máxima Formación`;
    const loginUrl = `${moodleUrl}/login/index.php`;
    const html = `
      <p>Hola ${firstname || 'alumno/a'},</p>
      <p>Tu compra de <strong>${programTitle}</strong> se ha procesado correctamente.</p>
      <p>Ya tienes acceso a tu campus con tu cuenta existente. Puedes acceder en
        <a href="${loginUrl}">${loginUrl}</a>.
      </p>
      <p>Si has olvidado tu contraseña, puedes restablecerla desde la propia página de acceso.</p>
      <p>— Máxima Formación</p>
    `;
    const text = `Hola ${firstname || 'alumno/a'},\n\nTu compra de ${programTitle} se ha procesado correctamente. Ya tienes acceso a tu campus con tu cuenta existente: ${loginUrl}\n\nSi has olvidado tu contraseña, puedes restablecerla desde la propia página de acceso.\n\n— Máxima Formación`;
    await runPhase('email:confirmation', () =>
      sendEmail({ to: email, subject, html, text })
    );
  }

  return { userId: user.id, username: user.username, wasNewUser };
}
