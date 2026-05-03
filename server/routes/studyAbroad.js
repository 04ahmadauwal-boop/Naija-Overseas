const express = require('express');
const router = express.Router();
const StudyAbroadApplication = require('../models/StudyAbroadApplication');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');

// POST /api/study-abroad
router.post('/', optionalAuth, async (req, res) => {
  try {
    const application = await StudyAbroadApplication.create({
      ...req.body,
      user: req.user?._id,
    });

    await sendEmail({
      to: req.body.email,
      subject: 'Study Abroad Application Received — Naija and Overseas',
      html: `<p>Hi ${req.body.fullName}, we have received your application to study in <strong>${req.body.destinationCountry}</strong>. Our team will review it and contact you within 48 hours.</p>`,
    });

    res.status(201).json({ application, message: 'Application submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/study-abroad/my — logged-in user's own applications
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await StudyAbroadApplication.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/study-abroad — admin
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const applications = await StudyAbroadApplication.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/study-abroad/:id/status — admin updates status
router.patch('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const app = await StudyAbroadApplication.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, notes: req.body.notes },
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Application not found' });
    res.json({ application: app });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
