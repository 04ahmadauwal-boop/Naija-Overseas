const nodemailer = require('nodemailer');

const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,       // 587 + STARTTLS — works on cloud/VPS servers (465 is blocked by most hosts)
    secure: false,   // false = STARTTLS (upgrades connection); true = SSL (port 465, blocked on servers)
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
  try {
    await transporter.sendMail({
      from: `"Education Naija & Overseas" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`📧 sendEmail failed — to:${to} | ${err.message}`);
    throw err;
  }
};

module.exports = sendEmail;
