import nodemailer from 'nodemailer';

let transporter = null;
let initialized = false;

export const initMailer = () => {
  if (initialized) return;
  initialized = true;

  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASSWORD;

  if (host && user && rawPass) {
    const pass = rawPass.replace(/\s+/g, '');
    const port = Number(process.env.SMTP_PORT) || 587;
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
    });

    transporter.verify((error) => {
      if (error) {
        console.error(`[SMTP Mailer] Verification error: ${error.message}`);
      } else {
        console.log(`[SMTP Mailer] Connected & verified successfully with ${host} (${user})`);
      }
    });
  } else {
    console.error('[SMTP Mailer] SMTP credentials are not configured.');
  }
};

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!initialized) initMailer();

  const rawFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'roundtable.dtu2k26@gmail.com';
  const from = rawFrom.includes('<') ? rawFrom : `"ROUNDCode — Round Table DTU" <${rawFrom.trim()}>`;

  console.log(`\n================== [ROUNDCode EMAIL DISPATCH] ==================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`From: ${from}`);
  console.log('Content: [redacted]');
  console.log(`=================================================================\n`);

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html: html || `<pre style="font-family: monospace; white-space: pre-wrap;">${text}</pre>`,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email through SMTP:', error.message);
      // Return simulated success in development so workflows don't fail if SMTP credentials are mock
      return { success: false, error: error.message, simulated: true };
    }
  }

  const error = 'SMTP transporter is not configured';
  console.error(`[SMTP Mailer] ${error}`);
  return {
    success: false,
    error,
    simulated: process.env.NODE_ENV !== 'production',
  };
};
