import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.EMAIL_FROM || 'noreply@maximaformacion.es';

if (!apiKey && process.env.NODE_ENV === 'production') {
  console.warn('RESEND_API_KEY is not set — emails will not be sent.');
}

const resend = apiKey ? new Resend(apiKey) : null;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (!resend) {
    console.warn(`Email skipped (no Resend client): ${options.subject} → ${options.to}`);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
    replyTo: options.replyTo,
  });

  if (error) {
    // Log full error shape so Vercel logs show Resend's reason
    // (invalid_from_address, domain_not_verified, rate_limit, etc.)
    console.error(`[resend] send failed → ${options.to} from=${fromAddress}`, error);
    throw new Error(`Resend send failed: ${error.message}`);
  }

  console.log(`[resend] sent id=${data?.id} → ${options.to} subject="${options.subject}"`);
}
