const express = require('express');
const router = express.Router();
const https = require('https');

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  const { reference } = req.body;
  if (!reference) return res.status(400).json({ message: 'Payment reference is required' });

  const options = {
    hostname: 'api.paystack.co',
    port: 443,
    path: `/transaction/verify/${reference}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => {
      const parsed = JSON.parse(data);
      if (parsed.data?.status === 'success') {
        return res.json({ verified: true, data: parsed.data });
      }
      return res.json({ verified: false, message: 'Payment not successful' });
    });
  });

  request.on('error', (err) => res.status(500).json({ message: err.message }));
  request.end();
});

module.exports = router;
