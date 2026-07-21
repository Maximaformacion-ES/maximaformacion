// Email de bienvenida al plan PRO. Se envía cuando un admin da PRO a un alumno
// desde el panel (lib/admin/pro.ts). Mismo estilo de marca que las campañas:
// logo alojado en R2 (URL pública, se ve en cualquier cliente) + acento naranja.

const LOGO = 'https://pub-a3cc095f320346dca3aa9ded3eab6141.r2.dev/email/logo-maxima.png';
const PRO_URL = 'https://www.maximaformacion.es/pro-content';
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function proWelcomeEmail(name: string): { subject: string; html: string; text: string } {
  const hi = name && name !== 'alumno' ? `¡Hola, ${escapeHtml(name)}!` : '¡Hola!';
  const subject = '¡Ya eres PRO! · Máxima Formación';

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;"><tr><td align="center" style="padding:32px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ececec;font-family:${FONT};">
      <tr><td style="padding:24px 36px 20px;border-bottom:3px solid #F7A000;"><img src="${LOGO}" alt="Máxima Formación" height="30" style="height:30px;width:auto;display:block;border:0;"/></td></tr>
      <tr><td style="padding:32px 36px;color:#2b2b2b;font-size:16px;line-height:1.65;">
        <p style="margin:0 0 16px;">${hi}</p>
        <p style="margin:0 0 16px;">Te damos la bienvenida al plan <strong style="color:#171717;">PRO</strong> de Máxima Formación. A partir de ahora tienes:</p>
        <ul style="margin:0 0 16px;padding-left:22px;">
          <li style="margin:6px 0;">Acceso al <strong style="color:#171717;">contenido exclusivo PRO</strong>: apps, datasets, plantillas y recursos que no están disponibles en abierto.</li>
          <li style="margin:6px 0;">Un <strong style="color:#171717;">20&nbsp;% de descuento</strong> en todos nuestros cursos y másters.</li>
        </ul>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr><td style="border-radius:8px;background:#F7A000;">
          <a href="${PRO_URL}" style="display:inline-block;padding:12px 26px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">Explorar el contenido PRO →</a>
        </td></tr></table>
        <p style="margin:0;">Si tienes cualquier duda, responde a este email y te ayudamos.</p>
        <p style="margin:16px 0 0;">— El equipo de Máxima Formación</p>
      </td></tr>
      <tr><td style="padding:20px 36px;border-top:1px solid #f0f0f0;background:#fafafa;color:#9a9a9a;font-size:12px;line-height:1.5;font-family:${FONT};">Has recibido este email como alumno de <strong style="color:#6b6b6b;">Máxima Formación</strong>.</td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `${hi}\n\nTe damos la bienvenida al plan PRO de Máxima Formación. Ahora tienes:\n- Acceso al contenido exclusivo PRO (apps, datasets, plantillas).\n- Un 20% de descuento en todos nuestros cursos y másters.\n\nExplora el contenido PRO: ${PRO_URL}\n\nSi tienes cualquier duda, responde a este email.\n\n— El equipo de Máxima Formación`;

  return { subject, html, text };
}
