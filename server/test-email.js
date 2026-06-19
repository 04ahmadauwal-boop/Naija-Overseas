// Run on the server: node test-email.js
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function run() {
  console.log('\n=== Email Diagnostic (Brevo API) ===');
  console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? `✅ set (${process.env.BREVO_API_KEY.length} chars)` : '❌ NOT SET');
  console.log('EMAIL_FROM   :', process.env.EMAIL_FROM || '❌ NOT SET');
  console.log('ADMIN_EMAIL  :', process.env.ADMIN_EMAIL || '❌ NOT SET');

  if (!process.env.BREVO_API_KEY) {
    console.log('\n❌ STOP: Set BREVO_API_KEY in your .env and restart.');
    process.exit(1);
  }

  const to = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';
  console.log(`\n--- Sending test email to ${to} ---`);
  try {
    await sendEmail({
      to,
      subject: 'Server Email Test — Education Naija & Overseas',
      html: `<p>This test email was sent from the server at <strong>${new Date().toISOString()}</strong>.</p><p>Email is working correctly!</p>`,
    });
    console.log('✅ Email sent successfully! Check your inbox.');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

run();
