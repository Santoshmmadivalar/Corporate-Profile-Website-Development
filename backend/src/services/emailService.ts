import nodemailer from 'nodemailer';

/**
 * Configure Nodemailer SMTP transporter.
 * If env credentials are missing, we fall back to a mock transporter
 * that prints email contents to the terminal console.
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }

  // Fallback console-logger mock
  return {
    sendMail: async (options: any) => {
      console.log('----------------------------------------------------');
      console.log('📧 SIMULATED EMAIL OUTBOX (SMTP Creds Missing):');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.text || options.html}`);
      console.log('----------------------------------------------------');
      return { messageId: 'mock-message-id-' + Date.now() };
    }
  };
};

export const sendEmail = async (options: { to: string; subject: string; text?: string; html?: string }) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Outpro India" <noreply@outpro.in>',
      ...options
    });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};
