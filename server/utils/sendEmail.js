const https = require('https');

const sendEmail = ({ to, subject, html }) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('📧 sendEmail: BREVO_API_KEY not set — skipped');
    return Promise.resolve();
  }

  const body = JSON.stringify({
    sender: {
      name: 'Education Naija & Overseas',
      email: process.env.EMAIL_FROM || 'noreply@visiteno.com',
    },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            const err = new Error(`Brevo API ${res.statusCode}: ${data}`);
            console.error(`📧 sendEmail failed — to:${to} | ${err.message}`);
            reject(err);
          }
        });
      }
    );
    req.on('error', (err) => {
      console.error(`📧 sendEmail network error — to:${to} | ${err.message}`);
      reject(err);
    });
    req.write(body);
    req.end();
  });
};

module.exports = sendEmail;
