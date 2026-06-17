const nodemailer = require('nodemailer');

// Transporter created lazily inside the function so it always reads
// the current process.env values even after a hot reload in development.
const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // force IPv4 — IPv6 is unreachable on this network
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('📧 sendEmail: EMAIL_USER or EMAIL_PASS env var is missing — email not sent');
    return;
  }
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Education Education Naija & Overseas" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
