const nodemailer = require('nodemailer');

// Transporter created lazily inside the function so it always reads
// the current process.env values even after a hot reload in development.
const createTransporter = () =>
  nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });

const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Naija and Overseas" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
