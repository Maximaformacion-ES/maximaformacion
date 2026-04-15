interface MoodleCredentialsEmailParams {
  firstname: string;
  programTitle: string;
  programType: 'Master' | 'Curso';
  username: string;
  password: string;
  moodleUrl: string;
}

/**
 * HTML email sent after a successful purchase, delivering the
 * Moodle login credentials to the new student.
 */
export function moodleCredentialsEmail({
  firstname,
  programTitle,
  programType,
  username,
  password,
  moodleUrl,
}: MoodleCredentialsEmailParams): { subject: string; html: string; text: string } {
  const isMaster = programType === 'Master';
  const intro = isMaster
    ? `¡Bienvenido/a al ${programTitle}!`
    : `¡Gracias por inscribirte en ${programTitle}!`;
  const subject = `Tu acceso a ${programTitle} | Máxima Formación`;
  const loginUrl = `${moodleUrl}/login/index.php`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background-color:#0a0a0a;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#f59e0b;font-size:24px;font-weight:800;letter-spacing:2px;text-transform:uppercase;">
                Máxima Formación
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#0a0a0a;font-size:22px;font-weight:700;">
                Hola ${firstname},
              </h2>
              <p style="margin:0 0 24px;color:#4a4a4a;font-size:16px;line-height:1.6;">
                ${intro} Tu pago se ha procesado correctamente y ya tienes acceso a tu campus virtual.
              </p>

              <p style="margin:0 0 16px;color:#4a4a4a;font-size:16px;line-height:1.6;">
                Aquí tienes tus credenciales de acceso:
              </p>

              <!-- Credentials box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:8px;margin:16px 0 32px;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 12px;color:#78350f;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                      Usuario
                    </p>
                    <p style="margin:0 0 20px;color:#0a0a0a;font-size:18px;font-family:'Courier New',monospace;font-weight:700;word-break:break-all;">
                      ${username}
                    </p>
                    <p style="margin:0 0 12px;color:#78350f;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                      Contraseña
                    </p>
                    <p style="margin:0;color:#0a0a0a;font-size:18px;font-family:'Courier New',monospace;font-weight:700;word-break:break-all;">
                      ${password}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" style="display:inline-block;background-color:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:8px;">
                      Acceder al campus
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
                <strong>Recomendamos que cambies tu contraseña</strong> la primera vez que accedas, desde tu perfil de usuario en el campus.
              </p>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                Si tienes cualquier duda, puedes responder directamente a este correo o escribirnos a
                <a href="mailto:cursos@maximaformacion.es" style="color:#f59e0b;text-decoration:none;">cursos@maximaformacion.es</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">
                © ${new Date().getFullYear()} Máxima Formación. Todos los derechos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hola ${firstname},

${intro} Tu pago se ha procesado correctamente y ya tienes acceso a tu campus virtual.

Tus credenciales de acceso:

  Usuario: ${username}
  Contraseña: ${password}

Accede al campus: ${loginUrl}

Recomendamos que cambies tu contraseña la primera vez que accedas.

Si tienes cualquier duda, escríbenos a cursos@maximaformacion.es.

— Máxima Formación`;

  return { subject, html, text };
}
