const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');

// POST /api/bookings
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, service, date, timeSlot, notes, paymentRef } = req.body;
    const booking = await Booking.create({
      user: req.user?._id,
      name,
      email,
      phone,
      service,
      date,
      timeSlot,
      notes,
      paymentRef,
    });

    await sendEmail({
      to: email,
      subject: 'Booking Confirmed — Naija and Overseas',
      html: `<p>Hi ${name}, your <strong>${service}</strong> appointment on <strong>${new Date(date).toDateString()}</strong> at <strong>${timeSlot}</strong> has been received. We'll confirm shortly.</p>`,
    });

    res.status(201).json({ booking, message: 'Booking received. Check your email for confirmation.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/my — logged-in user's own bookings
router.get('/my', protect, async (req, res) => {
  try {
    const { service } = req.query;
    const filter = { user: req.user._id };
    if (service) filter.service = service;
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/cancel — user cancels their own booking
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings — admin
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter).populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/status — admin updates status and/or call link
router.patch('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const updates = {};
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (req.body.callLink !== undefined) updates.callLink = req.body.callLink;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
