const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const School = require('../models/School');
const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';

// POST /api/bookings
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, service, date, timeSlot, notes, paymentRef, schoolId } = req.body;

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
      schoolId: schoolId || null,
    });

    const dateStr = new Date(date).toDateString();

    // Email the parent/requester
    await sendEmail({
      to: email,
      subject: 'Booking Received — Naija and Overseas',
      html: `<p>Hi ${name},</p>
<p>Your <strong>${service.replace(/-/g, ' ')}</strong> request for <strong>${dateStr}</strong> at <strong>${timeSlot}</strong> has been received. We'll confirm shortly.</p>
<p>— Naija &amp; Overseas Team</p>`,
    }).catch(() => {});

    // If school visit — notify school owner + admin
    if (service === 'school-visit') {
      // Notify admin
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `New School Visit Request — ${name}`,
        html: `<p>A new school visit request has been submitted.</p>
<ul>
  <li><strong>Parent:</strong> ${name} (${email})</li>
  <li><strong>Date:</strong> ${dateStr}</li>
  <li><strong>Time:</strong> ${timeSlot}</li>
  ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
  ${schoolId ? `<li><strong>School ID:</strong> ${schoolId}</li>` : ''}
</ul>
<p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/bookings">View in Admin Panel</a></p>`,
      }).catch(() => {});

      // Notify school owner if a specific school was selected
      if (schoolId) {
        const school = await School.findById(schoolId).populate('owner', 'name email');
        if (school?.owner?.email) {
          await sendEmail({
            to: school.owner.email,
            subject: `New Visit Request for ${school.name} — Naija & Overseas`,
            html: `<p>Hi ${school.owner.name},</p>
<p>A parent has requested a visit to <strong>${school.name}</strong>.</p>
<ul>
  <li><strong>Parent:</strong> ${name}</li>
  <li><strong>Date:</strong> ${dateStr}</li>
  <li><strong>Time:</strong> ${timeSlot}</li>
  ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
</ul>
<p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/school-owner">School Dashboard</a> to confirm or manage this visit.</p>
<p>— Naija &amp; Overseas Team</p>`,
          }).catch(() => {});
        }
      }
    }

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
    const bookings = await Booking.find(filter)
      .populate('schoolId', 'name state city')
      .populate('tutorId', 'displayName profilePhoto')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/school — school owner sees visits to their school(s)
router.get('/school', protect, async (req, res) => {
  try {
    const schools = await School.find({ owner: req.user._id }).select('_id name');
    if (!schools.length) return res.json({ bookings: [] });
    const schoolIds = schools.map(s => s._id);
    const bookings = await Booking.find({
      schoolId: { $in: schoolIds },
      service: 'school-visit',
    })
      .populate('user', 'name email phone')
      .populate('schoolId', 'name')
      .sort({ createdAt: -1 });
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

// PATCH /api/bookings/:id/school-action — school owner confirms or declines a visit
router.patch('/:id/school-action', protect, async (req, res) => {
  try {
    const { action } = req.body; // 'confirm' | 'decline'
    if (!['confirm', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'action must be confirm or decline' });
    }
    const schools = await School.find({ owner: req.user._id }).select('_id');
    const schoolIds = schools.map(s => String(s._id));
    const booking = await Booking.findById(req.params.id);
    if (!booking || !schoolIds.includes(String(booking.schoolId))) {
      return res.status(404).json({ message: 'Booking not found or does not belong to your school' });
    }
    booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';
    await booking.save();

    // Notify parent
    const subject = action === 'confirm'
      ? 'Your School Visit is Confirmed — Naija & Overseas'
      : 'School Visit Update — Naija & Overseas';
    const html = action === 'confirm'
      ? `<p>Hi ${booking.name},</p><p>Your visit on <strong>${new Date(booking.date).toDateString()}</strong> at <strong>${booking.timeSlot}</strong> has been <strong>confirmed</strong> by the school. See you there!</p>`
      : `<p>Hi ${booking.name},</p><p>Unfortunately your visit on <strong>${new Date(booking.date).toDateString()}</strong> could not be accommodated. Please try another date or contact the school directly.</p>`;
    await sendEmail({ to: booking.email, subject, html }).catch(() => {});

    // Notify admin
    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `School Visit ${action === 'confirm' ? 'Confirmed' : 'Declined'} — ${booking.name}`,
      html: `<p>A school owner has <strong>${action === 'confirm' ? 'confirmed' : 'declined'}</strong> a visit request from ${booking.name} (${booking.email}) on ${new Date(booking.date).toDateString()}.</p>`,
    }).catch(() => {});

    res.json({ booking, message: `Visit ${action === 'confirm' ? 'confirmed' : 'declined'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/tutor-action — tutor confirms or declines their own booking
router.patch('/:id/tutor-action', protect, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['confirm', 'decline'].includes(action)) {
      return res.status(400).json({ message: 'action must be confirm or decline' });
    }
    const tutorProfile = await TutorProfile.findOne({ user: req.user._id });
    if (!tutorProfile) return res.status(403).json({ message: 'Only tutors can perform this action' });

    const booking = await Booking.findOne({ _id: req.params.id, tutorId: tutorProfile._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found or does not belong to you' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';

    if (action === 'confirm' && !booking.callLink) {
      const roomId = `${booking._id.toString().slice(-6)}-${Date.now().toString(36)}`;
      booking.callLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/classroom/${roomId}`;
    }
    await booking.save();

    if (action === 'confirm') {
      await sendEmail({
        to: booking.email,
        subject: 'Your Tutoring Session is Confirmed! — Naija & Overseas',
        html: `<p>Hi ${booking.name},</p>
<p>Your tutoring session on <strong>${new Date(booking.date).toDateString()}</strong> at <strong>${booking.timeSlot}</strong> has been <strong>confirmed</strong>.</p>
${booking.callLink ? `<p>Join your class here: <a href="${booking.callLink}">${booking.callLink}</a></p>` : ''}`,
      }).catch(() => {});
    } else {
      await sendEmail({
        to: booking.email,
        subject: 'Tutoring Session Update — Naija & Overseas',
        html: `<p>Hi ${booking.name},</p><p>Your tutoring session on <strong>${new Date(booking.date).toDateString()}</strong> could not be confirmed. Please book with another tutor.</p>`,
      }).catch(() => {});
    }

    res.json({ booking, message: action === 'confirm' ? 'Session confirmed' : 'Session declined' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings — admin
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { status, service } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (service) filter.service = service;
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('schoolId', 'name state')
      .populate('tutorId', 'displayName')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/bookings/:id/status — admin updates status and/or call link
router.patch('/:id/status', protect, isAdmin, async (req, res) => {
  try {
    const updates = {};
    if (req.body.status   !== undefined) updates.status   = req.body.status;
    if (req.body.callLink !== undefined) updates.callLink = req.body.callLink;
    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
