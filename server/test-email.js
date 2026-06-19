// Run: node test-email.js
require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

async function run() {
  console.log('\n=== Email Diagnostic (Resend) ===');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? `✅ set (${process.env.RESEND_API_KEY.length} chars)` : '❌ NOT SET');

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 'YOUR_RESEND_API_KEY_HERE') {
    console.log('\n❌ Paste your Resend API key into .env as RESEND_API_KEY=re_xxxx');
    process.exit(1);
  }

  const to = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';
  console.log(`\nSending test to ${to} ...`);
  try {
    await sendEmail({
      to,
      subject: 'Server Email Test — Education Naija & Overseas',
      html: '<p>Email is working! Sent via Resend.</p>',
    });
    console.log('✅ Email sent! Check your inbox.');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
}

run();
