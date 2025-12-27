import nodemailer from "nodemailer";

/**
 * Create and configure nodemailer transporter
 * Supports multiple SMTP providers: Gmail, Outlook, SendGrid, Mailgun, custom SMTP
 */
export function createEmailTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser || "noreply@example.com";
  const fromName = process.env.SMTP_FROM_NAME || "Oracle - Tarot Reading";

  // Validate required settings
  if (!smtpHost || !smtpUser || !smtpPassword) {
    throw new Error(
      "SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables."
    );
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    // Optional: Add TLS options for better security
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production",
    },
  });

  return {
    transporter,
    fromEmail: `${fromName} <${fromEmail}>`,
  };
}

/**
 * Send email using nodemailer
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const { transporter, fromEmail } = createEmailTransporter();

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      html,
      text,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

