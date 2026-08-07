import { sendEmail } from './client';

/**
 * Email de bienvenida para alumnos importados del campus antiguo. Su cuenta se
 * crea en Clerk (email ya verificado, sin contraseña conocida por ellos), así
 * que les invitamos a crear su propia contraseña con el flujo estándar de reset
 * de Clerk ("¿Olvidaste tu contraseña?") en la página de acceso.
 */
export async function sendWelcomeSetPasswordEmail(params: {
  to: string;
  firstName?: string;
}): Promise<void> {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.maximaformacion.es').replace(/\/$/, '');
  const signInUrl = `${appUrl}/sign-in`;
  const hi = params.firstName?.trim() ? `Hola ${params.firstName.trim()},` : 'Hola,';

  const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e6e8eb;">
        <tr><td style="background:#0a2540;padding:24px 32px;">
          <span style="color:#ffffff;font-size:18px;font-weight:800;letter-spacing:.5px;">Máxima Formación</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0a2540;">Tu acceso al nuevo campus está listo</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${hi}</p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
            Hemos migrado tu cuenta al nuevo campus de Máxima Formación, con tus cursos ya cargados.
            Para entrar, solo tienes que <strong>crear tu contraseña</strong>:
          </p>
          <ol style="margin:0 0 24px;padding-left:20px;font-size:15px;line-height:1.7;color:#333;">
            <li>Abre la página de acceso con el botón de abajo.</li>
            <li>Pulsa <strong>"¿Olvidaste tu contraseña?"</strong>.</li>
            <li>Introduce este mismo correo y sigue los pasos para elegir tu contraseña.</li>
          </ol>
          <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
            <tr><td style="border-radius:999px;background:#f59e0b;">
              <a href="${signInUrl}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">
                Crear mi contraseña
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
            Si el botón no funciona, copia esta dirección en tu navegador:<br>
            <a href="${signInUrl}" style="color:#0a2540;">${signInUrl}</a>
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eef0f2;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9aa1a9;">
            Recibes este correo porque tenías una cuenta en el campus de Máxima Formación.
            Si no reconoces esta cuenta, puedes ignorar este mensaje.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    hi,
    '',
    'Hemos migrado tu cuenta al nuevo campus de Máxima Formación, con tus cursos ya cargados.',
    'Para entrar, crea tu contraseña:',
    `1) Abre ${signInUrl}`,
    '2) Pulsa "¿Olvidaste tu contraseña?"',
    '3) Introduce este mismo correo y elige tu contraseña.',
    '',
    'Máxima Formación',
  ].join('\n');

  await sendEmail({
    to: params.to,
    subject: 'Tu acceso al nuevo campus de Máxima Formación',
    html,
    text,
  });
}
