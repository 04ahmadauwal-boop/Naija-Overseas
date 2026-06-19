const https = require('https');

const sendEmail = ({ to, subject, html }) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('📧 sendEmail: RESEND_API_KEY not set — skipped');
    return Promise.resolve();
  }

  const from = process.env.EMAIL_FROM
    ? `Education Naija & Overseas <${process.env.EMAIL_FROM}>`
    : 'Education Naija & Overseas <onboarding@resend.dev>';

  const body = JSON.stringify({ from, to, subject, html });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
            const err = new Error(`Resend API ${res.statusCode}: ${data}`);
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
