interface PackPurchasePendingParams {
  buyerName?: string;
  itemTitle: string;
  amount: number;
  currency: string;
}

/**
 * Confirmación al comprador del pack de cursos universitarios. Los cursos
 * están en fase de lanzamiento: aquí NO se da acceso ni credenciales — se
 * confirma el pago y se avisa de que le contactaremos cuando esté disponible
 * (es exactamente lo acordado con el cliente para esta página).
 */
export function packPurchasePendingEmail(
  params: PackPurchasePendingParams,
): { subject: string; html: string; text: string } {
  const { buyerName, itemTitle, amount, currency } = params;

  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
  const greeting = buyerName ? `Hola, ${buyerName}:` : 'Hola:';

  const subject = `Pago confirmado — ${itemTitle}`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:8px;padding:32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;color:#f59e0b;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Máxima Formación</p>
              <h1 style="margin:0 0 24px;font-size:22px;line-height:1.3;">¡Pago confirmado!</h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Hemos recibido correctamente tu pago de <strong>${formattedAmount}</strong> por:
              </p>
              <p style="margin:0 0 24px;padding:16px;background:#fffbeb;border-left:4px solid #f59e0b;border-radius:4px;font-size:15px;font-weight:600;line-height:1.5;">
                ${itemTitle}
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                Tu formación estará <strong>disponible próximamente</strong>. En cuanto abramos el
                acceso, nos pondremos en contacto contigo en este mismo email con todas las
                instrucciones para empezar. No tienes que hacer nada más.
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
                Recibirás también la factura de tu compra en un email aparte.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#666563;">
                ¿Alguna duda? Escríbenos a
                <a href="mailto:cursos@maximaformacion.es" style="color:#ab6f00;">cursos@maximaformacion.es</a>
                y te ayudamos.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#999;">Máxima Formación · www.maximaformacion.es</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    '',
    `Hemos recibido correctamente tu pago de ${formattedAmount} por:`,
    itemTitle,
    '',
    'Tu formación estará disponible próximamente. En cuanto abramos el acceso,',
    'nos pondremos en contacto contigo en este mismo email con todas las',
    'instrucciones para empezar. No tienes que hacer nada más.',
    '',
    'Recibirás también la factura de tu compra en un email aparte.',
    '',
    '¿Alguna duda? Escríbenos a cursos@maximaformacion.es.',
    '',
    'Máxima Formación · www.maximaformacion.es',
  ].join('\n');

  return { subject, html, text };
}
