import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || 'noreply@maximaformacion.es';

if (!apiKey && process.env.NODE_ENV === 'production') {
  console.warn('RESEND_API_KEY is not set — emails will not be sent.');
}

const resend = apiKey ? new Resend(apiKey) : null;

interface EmailAttachment {
  filename: string;
  /** Raw PDF/file bytes. Resend re-encodes to base64 on the wire. */
  content: Buffer;
  contentType?: string;
}

interface SendEmailOptions {
  /** Uno o varios destinatarios. Resend acepta string o array. */
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Override the sender address for this email. Falls back to the global
   *  EMAIL_FROM (noreply@…). Pass this when the email represents a person
   *  (e.g. tutor académico, customer success) and the user might reply
   *  expecting a human on the other side. The address must be verified
   *  in Resend (DKIM/SPF) under the same domain — otherwise Resend
   *  rejects the send or it lands in spam. */
  from?: string;
  attachments?: EmailAttachment[];
  /** Cabeceras extra (p.ej. List-Unsubscribe para el botón nativo de Gmail). */
  headers?: Record<string, string>;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!resend) {
    console.warn(`Email skipped (no Resend client): ${options.subject} → ${options.to}`);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: options.from || fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
    ...(options.headers ? { headers: options.headers } : {}),
    ...(options.attachments && options.attachments.length > 0
      ? {
          attachments: options.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            ...(a.contentType ? { contentType: a.contentType } : {}),
          })),
        }
      : {}),
  });

  if (error) {
    // Log full error shape so Vercel logs show Resend's reason
    // (invalid_from_address, domain_not_verified, rate_limit, etc.)
    console.error(`[resend] send failed → ${options.to} from=${options.from || fromAddress}`, error);
    throw new Error(`Resend send failed: ${error.message}`);
  }

  console.log(`[resend] sent id=${data?.id} → ${options.to} subject="${options.subject}"`);
}
