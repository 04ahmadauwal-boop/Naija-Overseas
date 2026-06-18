const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contact.create({ name, email, phone, subject, message });

    sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact: ${subject || 'No subject'} — from ${name}`,
      html: `<p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
             <p><strong>Message:</strong></p><p>${message}</p>`,
    }).catch((err) => console.error('📧 Contact notification email failed:', err.message));

    res.status(201).json({ message: 'Message sent. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/contact/test-email — admin diagnostic: send a test email from the live server
router.post('/test-email', protect, isAdmin, async (req, res) => {
  const to = req.body.to || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  try {
    await sendEmail({
      to,
      subject: 'Test Email — Education Naija & Overseas Server',
      html: `<p>This test email was sent from the live server at <strong>${new Date().toISOString()}</strong>.</p>
             <p>EMAIL_USER present: <strong>${process.env.EMAIL_USER ? 'YES' : 'NO'}</strong><br/>
             EMAIL_PASS present: <strong>${process.env.EMAIL_PASS ? 'YES' : 'NO'}</strong></p>`,
    });
    res.json({ ok: true, message: `Test email sent to ${to}` });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// GET /api/contact — admin
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/contact/:id/read — admin marks as read
router.patch('/:id/read', protect, isAdmin, async (req, res) => {
  try {
    const msg = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json({ message: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
