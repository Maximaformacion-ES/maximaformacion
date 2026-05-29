/**
 * Welcome email para alumnos que se matriculan en el "Curso Moodle para
 * Docentes y Creación de Contenidos con eXeLearning" — pide la
 * documentación necesaria para emitir el diploma de la Universidad de
 * Nebrija. Replica el correo manual que José Antonio mandaba hasta hoy
 * (29-may-2026).
 *
 * Adjuntos esperados:
 *   - Autorización Solicitud de Título.pdf
 *   - ANEXO I - TRATAMIENTO DATOS PERSONALES NEBRIJA.pdf
 *
 * From: cursos@maximaformacion.es (debe estar verificado en Resend)
 * Reply-To: tutor@maximaformacion.es (a donde el alumno envía las docs)
 */

interface DiplomaWelcomeParams {
  /** Nombre que saluda el correo. Idealmente sólo el nombre de pila,
   *  pero acepta nombre+apellidos sin romperse. */
  studentName: string;
}

export function diplomaWelcomeEmail(params: DiplomaWelcomeParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { studentName } = params;
  const subject = 'MÁXIMA FORMACIÓN | Solicitud de Documentación';
  const tutorEmail = 'tutor@maximaformacion.es';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;line-height:1.55;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border-radius:8px;padding:32px;">
          <tr>
            <td>
              <h1 style="margin:0 0 18px;font-size:20px;font-weight:600;">¡Hola, ${escapeHtml(studentName)}!</h1>

              <p style="margin:0 0 16px;font-size:15px;">
                Con el fin de gestionar el expediente del <strong style="font-variant:small-caps;">Curso Moodle para Docentes y Creación de Contenidos con eXeLearning</strong> te solicito que me envíes, a la mayor brevedad, la siguiente documentación.
              </p>

              <ul style="margin:0 0 16px;padding-left:0;list-style:none;font-size:15px;">
                <li style="margin:0 0 10px;padding-left:24px;text-indent:-24px;">
                  ✓ <strong>Nombre, apellidos y NIF</strong> <span style="color:#1e40af;">(Estos datos serán los que aparecerán en el diploma, por lo que es importante que estén escritos de forma correcta y sin abreviaturas)</span>
                </li>
                <li style="margin:0 0 10px;padding-left:24px;text-indent:-24px;">
                  ✓ <strong>Autorización Solicitud de Título</strong> <span style="color:#1e40af;">(Documento adjunto)</span>
                </li>
                <li style="margin:0 0 10px;padding-left:24px;text-indent:-24px;">
                  ✓ <strong>Anexo de Tratamiento de Datos Personales</strong> <span style="color:#1e40af;">(Documento adjunto)</span>. Si no deseas recibir información de la Universidad NO marques la casilla del documento.
                </li>
                <li style="margin:0 0 10px;padding-left:24px;text-indent:-24px;">
                  ✓ <strong>Teléfono de Contacto</strong>
                </li>
              </ul>

              <p style="margin:0 0 16px;font-size:15px;">
                Cuando finalices esta formación, abonarás los <strong>35 €</strong> en concepto de Tasas de expedición del diploma.
              </p>

              <p style="margin:0 0 16px;font-size:15px;">
                Por favor, envía toda la documentación a <a href="mailto:${tutorEmail}" style="color:#1d4ed8;">${tutorEmail}</a>.
              </p>

              <p style="margin:0 0 16px;font-size:15px;">
                Además de este correo, también te he enviado un correo de bienvenida con tus datos de acceso; si no lo has recibido, comprueba la bandeja de correo no deseado (SPAM).
              </p>

              <p style="margin:0 0 28px;font-size:15px;">Un saludo.</p>

              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border-top:2px solid #e5e7eb;padding-top:18px;">
                <tr>
                  <td style="padding-right:20px;vertical-align:top;">
                    <div style="font-size:18px;font-weight:700;color:#0b1d4d;line-height:1.2;">José Antonio Lorente</div>
                    <div style="font-size:13px;color:#475569;margin-top:4px;">Departamento de e-learning</div>
                    <div style="margin-top:14px;font-size:13px;color:#475569;line-height:1.7;">
                      ✉ <a href="mailto:cursos@maximaformacion.es" style="color:#475569;text-decoration:none;">cursos@maximaformacion.es</a><br>
                      🌐 <a href="https://www.maximaformacion.es" style="color:#475569;text-decoration:none;">www.maximaformacion.es</a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `¡Hola, ${studentName}!`,
    '',
    'Con el fin de gestionar el expediente del Curso Moodle para Docentes y Creación de Contenidos con eXeLearning te solicito que me envíes, a la mayor brevedad, la siguiente documentación.',
    '',
    '  ✓ Nombre, apellidos y NIF (Estos datos serán los que aparecerán en el diploma, por lo que es importante que estén escritos de forma correcta y sin abreviaturas)',
    '  ✓ Autorización Solicitud de Título (Documento adjunto)',
    '  ✓ Anexo de Tratamiento de Datos Personales (Documento adjunto). Si no deseas recibir información de la Universidad NO marques la casilla del documento.',
    '  ✓ Teléfono de Contacto',
    '',
    'Cuando finalices esta formación, abonarás los 35 € en concepto de Tasas de expedición del diploma.',
    '',
    `Por favor, envía toda la documentación a ${tutorEmail}.`,
    '',
    'Además de este correo, también te he enviado un correo de bienvenida con tus datos de acceso; si no lo has recibido, comprueba la bandeja de correo no deseado (SPAM).',
    '',
    'Un saludo.',
    '',
    '—',
    'José Antonio Lorente',
    'Departamento de e-learning',
    'cursos@maximaformacion.es',
    'www.maximaformacion.es',
  ].join('\n');

  return { subject, html, text };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
