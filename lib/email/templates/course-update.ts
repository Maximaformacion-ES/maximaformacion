interface CourseUpdateEmailParams {
  programTitle: string;
  changeType: string;
  updateTitle: string;
  updateDescription?: string;
  courseUrl: string;
}

const changeTypeLabels: Record<string, string> = {
  new_lesson: 'Nueva lección',
  updated_lesson: 'Lección actualizada',
  new_module: 'Nuevo módulo',
  updated_content: 'Contenido actualizado',
  new_resource: 'Nuevo recurso',
};

export function courseUpdateEmail({
  programTitle,
  changeType,
  updateTitle,
  updateDescription,
  courseUrl,
}: CourseUpdateEmailParams): { subject: string; html: string; text: string } {
  const changeLabel = changeTypeLabels[changeType] || 'Actualización';
  const subject = `${changeLabel} en ${programTitle} | Máxima Formación`;

  const descriptionBlock = updateDescription
    ? `<p style="margin:0 0 24px;color:#4a4a4a;font-size:15px;line-height:1.6;">${updateDescription}</p>`
    : '';

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
              <p style="margin:0 0 8px;color:#f59e0b;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:700;">
                ${changeLabel}
              </p>
              <h2 style="margin:0 0 24px;color:#0a0a0a;font-size:22px;font-weight:700;">
                ${programTitle}
              </h2>

              <!-- Update box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;margin:0 0 24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;color:#0a0a0a;font-size:17px;font-weight:600;line-height:1.4;">
                      ${updateTitle}
                    </p>
                  </td>
                </tr>
              </table>

              ${descriptionBlock}

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 32px;">
                <tr>
                  <td align="center">
                    <a href="${courseUrl}" style="display:inline-block;background-color:#f59e0b;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:16px 40px;border-radius:8px;">
                      Ver actualización
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                Recibes este correo porque tienes acceso a este curso. Si tienes cualquier duda, escríbenos a
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

  const descriptionText = updateDescription ? `\n${updateDescription}\n` : '';

  const text = `${changeLabel} en ${programTitle}

${updateTitle}
${descriptionText}
Accede al curso: ${courseUrl}

Recibes este correo porque tienes acceso a este curso.
Si tienes cualquier duda, escríbenos a cursos@maximaformacion.es.

— Máxima Formación`;

  return { subject, html, text };
}
