import nodemailer from 'nodemailer';

const smtpHost = process.env['SMTP_HOST'];
const smtpPort = Number(process.env['SMTP_PORT'] ?? 587);
const smtpUser = process.env['SMTP_USER'];
const smtpPass = process.env['SMTP_PASS'];
const smtpFrom = process.env['SMTP_FROM'] ?? smtpUser ?? 'noreply@guruapp.com';

const transporter =
  smtpHost && smtpUser && smtpPass
    ? nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      })
    : null;

export async function sendInquiryEmail(opts: {
  toEmail: string;
  toName: string;
  fromName: string;
  fromEmail: string;
  phone?: string;
  message: string;
}) {
  if (!transporter) return; // SMTP not configured — silently skip
  await transporter.sendMail({
    from: `"${opts.fromName}" <${smtpFrom}>`,
    to: opts.toEmail,
    subject: `New enquiry from ${opts.fromName}`,
    text: [
      `You received a new enquiry via GuruApp.`,
      ``,
      `From: ${opts.fromName} <${opts.fromEmail}>${opts.phone ? `\nPhone: ${opts.phone}` : ''}`,
      ``,
      opts.message,
    ].join('\n'),
    html: `
      <p>You received a new enquiry via <strong>GuruApp</strong>.</p>
      <table>
        <tr><td><strong>From</strong></td><td>${opts.fromName}</td></tr>
        <tr><td><strong>Email</strong></td><td><a href="mailto:${opts.fromEmail}">${opts.fromEmail}</a></td></tr>
        ${opts.phone ? `<tr><td><strong>Phone</strong></td><td>${opts.phone}</td></tr>` : ''}
      </table>
      <hr/>
      <p>${opts.message.replace(/\n/g, '<br/>')}</p>
    `,
  });
}
