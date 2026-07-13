/**
 * Moodle Web Services client
 *
 * Supports two Moodle instances ("data-science" and "e-learning"),
 * each with its own URL and API token configured via environment variables:
 *
 *   MOODLE_DATA_SCIENCE_URL    https://www.maximacampus.es
 *   MOODLE_DATA_SCIENCE_TOKEN  <token>
 *   MOODLE_E_LEARNING_URL       https://maximaformacion.com.es
 *   MOODLE_E_LEARNING_TOKEN     <token>
 *
 * The instance to use for a given program is stored in Strapi as the
 * `moodle` field on the Program content type.
 */

export type MoodleInstance = 'data-science' | 'e-learning';

interface MoodleConfig {
  url: string;
  token: string;
}

function getMoodleConfig(instance: MoodleInstance): MoodleConfig {
  const env = process.env;
  const url =
    instance === 'data-science'
      ? env.MOODLE_DATA_SCIENCE_URL
      : env.MOODLE_E_LEARNING_URL;
  const token =
    instance === 'data-science'
      ? env.MOODLE_DATA_SCIENCE_TOKEN
      : env.MOODLE_E_LEARNING_TOKEN;

  if (!url || !token) {
    throw new Error(
      `Moodle credentials are not configured for instance "${instance}". ` +
        `Set the corresponding URL and TOKEN environment variables.`
    );
  }

  return { url: url.replace(/\/$/, ''), token };
}

interface MoodleErrorResponse {
  exception?: string;
  errorcode?: string;
  message?: string;
}

async function moodleRequest<T>(
  instance: MoodleInstance,
  wsfunction: string,
  params: Record<string, string> = {}
): Promise<T> {
  const { url, token } = getMoodleConfig(instance);

  const body = new URLSearchParams({
    wstoken: token,
    wsfunction,
    moodlewsrestformat: 'json',
    ...params,
  });

  const response = await fetch(`${url}/webservice/rest/server.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  const text = await response.text();

  // Moodle returns 200 with HTML when web services are disabled. Detect that.
  if (text.startsWith('<')) {
    throw new Error(
      `Moodle "${instance}" returned HTML instead of JSON for ${wsfunction}. ` +
        `Web services may be disabled or the endpoint is being intercepted.`
    );
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Moodle "${instance}" returned invalid JSON for ${wsfunction}: ${text.slice(0, 200)}`
    );
  }

  if (data && typeof data === 'object' && 'exception' in data) {
    const err = data as MoodleErrorResponse;
    throw new Error(
      `Moodle ${wsfunction} error: ${err.errorcode ?? 'unknown'} — ${err.message ?? 'no message'}`
    );
  }

  return data as T;
}

// ============ Types ============

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface MoodleCreatedUser {
  id: number;
  username: string;
}

// ============ Public API ============

/**
 * Look up a user by email. Returns null if not found.
 */
export async function getMoodleUserByEmail(
  instance: MoodleInstance,
  email: string
): Promise<MoodleUser | null> {
  const users = await moodleRequest<MoodleUser[]>(
    instance,
    'core_user_get_users_by_field',
    {
      field: 'email',
      'values[0]': email,
    }
  );

  return users.length > 0 ? users[0] : null;
}

/**
 * Create a new Moodle user. Returns the created user's id and username.
 */
export async function createMoodleUser(
  instance: MoodleInstance,
  user: {
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    email: string;
  }
): Promise<MoodleCreatedUser> {
  const result = await moodleRequest<MoodleCreatedUser[]>(
    instance,
    'core_user_create_users',
    {
      'users[0][username]': user.username.toLowerCase(),
      'users[0][password]': user.password,
      'users[0][firstname]': user.firstname,
      'users[0][lastname]': user.lastname,
      'users[0][email]': user.email,
      'users[0][auth]': 'manual',
      'users[0][lang]': 'es',
    }
  );

  if (!result?.[0]) {
    throw new Error(`Moodle did not return a created user for ${user.email}`);
  }

  return result[0];
}

/**
 * Manually enrol a user in a course as a student (roleid=5 = student).
 */
export async function enrolUserInCourse(
  instance: MoodleInstance,
  userId: number,
  courseId: number,
  roleId = 5
): Promise<void> {
  // enrol_manual_enrol_users returns null on success
  await moodleRequest<null>(instance, 'enrol_manual_enrol_users', {
    'enrolments[0][roleid]': String(roleId),
    'enrolments[0][userid]': String(userId),
    'enrolments[0][courseid]': String(courseId),
  });
}

/**
 * Manually unenrol a user from a course — the reverse of enrolUserInCourse.
 * Uses the Manual enrolments web service `enrol_manual_unenrol_users`, which
 * must be enabled on the token's external service for this instance (if it is
 * not, Moodle throws and the caller falls back to "unenrol manually").
 */
export async function unenrolUserFromCourse(
  instance: MoodleInstance,
  userId: number,
  courseId: number
): Promise<void> {
  // enrol_manual_unenrol_users returns null on success
  await moodleRequest<null>(instance, 'enrol_manual_unenrol_users', {
    'enrolments[0][userid]': String(userId),
    'enrolments[0][courseid]': String(courseId),
  });
}

/**
 * Generate a secure random password meeting Moodle's default policy:
 * 8+ chars, 1 lowercase, 1 uppercase, 1 digit, 1 non-alphanumeric.
 */
export function generateSecurePassword(length = 14): string {
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%&*?';
  const all = lower + upper + digits + symbols;

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

  // Guarantee one of each required class
  const chars = [pick(lower), pick(upper), pick(digits), pick(symbols)];
  for (let i = chars.length; i < length; i++) {
    chars.push(pick(all));
  }

  // Fisher–Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/**
 * Build a username from an email by removing special chars and the domain part.
 * Moodle 3.x usernames must be lowercase, alphanumeric and limited length.
 */
export function usernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 30);
}

/**
 * Get the public-facing URL of the Moodle instance for use in emails.
 */
export function getMoodleUrl(instance: MoodleInstance): string {
  return getMoodleConfig(instance).url;
}
