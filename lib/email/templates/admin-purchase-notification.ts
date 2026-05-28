interface AdminPurchaseNotificationParams {
  studentName: string;
  studentEmail: string;
  productTitle: string;
  productType: 'Curso' | 'Master' | 'Maxymia';
  amount: number;
  currency: string;
  stripeSessionId: string;
  purchasedAt: Date;
}

/**
 * Internal notification sent to the maximaformación team after every
 * successful course purchase. Short, plain, optimised for a quick
 * skim in an inbox — no marketing styling.
 */
export function adminPurchaseNotificationEmail(
  params: AdminPurchaseNotificationParams,
): { subject: string; html: string; text: string } {
  const { studentName, studentEmail, productTitle, productType, amount, currency, stripeSessionId, purchasedAt } = params;

  const formattedAmount = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
  const formattedDate = purchasedAt.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Nueva compra: ${productTitle} (${formattedAmount})`;

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
              <p style="margin:0 0 4px;color:#f59e0b;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">
                Nueva compra
              </p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;">
                ${productTitle}
              </h1>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e5e5;">
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;width:130px;color:#666;font-size:14px;">Alumno</td>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:500;">${studentName}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;color:#666;font-size:14px;">Email</td>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:500;">
                    <a href="mailto:${studentEmail}" style="color:#f59e0b;text-decoration:none;">${studentEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;color:#666;font-size:14px;">Tipo</td>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:500;">${productType}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;color:#666;font-size:14px;">Importe</td>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:14px;font-weight:600;color:#f59e0b;">${formattedAmount}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;color:#666;font-size:14px;">Fecha</td>
                  <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-size:14px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;color:#666;font-size:14px;">Stripe session</td>
                  <td style="padding:14px 0;font-family:'SFMono-Regular',Menlo,monospace;font-size:12px;color:#666;">${stripeSessionId}</td>
                </tr>
              </table>

              <p style="margin:24px 0 0;color:#999;font-size:12px;line-height:1.5;">
                Notificación automática del sistema de checkout. La factura
                PDF se envía aparte al alumno desde Stripe.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `NUEVA COMPRA`,
    ``,
    `Producto: ${productTitle}`,
    `Tipo:     ${productType}`,
    `Alumno:   ${studentName} <${studentEmail}>`,
    `Importe:  ${formattedAmount}`,
    `Fecha:    ${formattedDate}`,
    `Stripe:   ${stripeSessionId}`,
    ``,
    `Notificación automática. La factura PDF se envía aparte al alumno desde Stripe.`,
  ].join('\n');

  return { subject, html, text };
}
