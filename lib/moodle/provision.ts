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
  let user = await getMoodleUserByEmail(moodleInstance, email);
  let wasNewUser = false;
  let plainPassword: string | null = null;

  // 2. Create the user if needed
  if (!user) {
    plainPassword = generateSecurePassword();
    const created = await createMoodleUser(moodleInstance, {
      username: usernameFromEmail(email),
      password: plainPassword,
      firstname: firstname || 'Alumno',
      lastname: lastname || 'Máxima',
      email,
    });
    user = {
      id: created.id,
      username: created.username,
      firstname: firstname || 'Alumno',
      lastname: lastname || 'Máxima',
      email,
    };
    wasNewUser = true;
    console.log(
      `Created Moodle user "${user.username}" (id=${user.id}) on ${moodleInstance}`
    );
  } else {
    console.log(
      `Reusing existing Moodle user "${user.username}" (id=${user.id}) on ${moodleInstance}`
    );
  }

  // 3. Enrol in the course
  await enrolUserInCourse(moodleInstance, user.id, moodleCourseId);
  console.log(
    `Enrolled user ${user.id} in course ${moodleCourseId} on ${moodleInstance}`
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
    await sendEmail({ to: email, subject, html, text });
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
    await sendEmail({ to: email, subject, html, text });
  }

  return { userId: user.id, username: user.username, wasNewUser };
}
