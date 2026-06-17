const express = require('express');
const router  = express.Router();
const https   = require('https');
const Subscription  = require('../models/Subscription');
const Booking       = require('../models/Booking');
const TutorProfile  = require('../models/TutorProfile');
const TutorAvailability = require('../models/TutorAvailability');
const { protect } = require('../middleware/auth');
const sendEmail   = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { localToUTC, formatTimeInTZ, getDayInTZ } = require('../utils/timezone');

// ── Paystack helpers ──────────────────────────────────────────────────────────

function paystackRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', c => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch { reject(new Error('Bad JSON from Paystack')); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

// ── Slot → monthly booking algorithm ─────────────────────────────────────────

/**
 * Given a preferred slot (day-of-week + time-string) and a timezone,
 * return the next `occurrences` future dates for that slot as UTC Date objects.
 */
function getNextOccurrences(dayOfWeek, timeStr, timezone, occurrences) {
  const results = [];
  const cursor  = new Date();
  cursor.setDate(cursor.getDate() + 1); // start searching from tomorrow

  while (results.length < occurrences) {
    const dateStr = cursor.toISOString().split('T')[0];
    if (getDayInTZ(dateStr, timezone) === dayOfWeek) {
      const utc = localToUTC(dateStr, timeStr, timezone);
      if (utc > new Date()) results.push(utc);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

// ── POST /api/subscriptions/init-payment ─────────────────────────────────────
// Student initiates payment. Returns a Paystack authorization_url.
router.post('/init-payment', protect, async (req, res) => {
  try {
    const { tutorId, timesPerWeek, preferredSlots, monthlyRate, trialBookingId } = req.body;

    if (!tutorId || !timesPerWeek || !monthlyRate) {
      return res.status(400).json({ message: 'tutorId, timesPerWeek and monthlyRate are required' });
    }

    const tutor = await TutorProfile.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    // Guard: already has an active subscription with this tutor
    const existing = await Subscription.findOne({
      tutor: tutorId,
      student: req.user._id,
      status: 'active',
    });
    if (existing) return res.status(400).json({ message: 'You already have an active subscription with this tutor' });

    const amountKobo = Math.round(monthlyRate * 100);

    const paystackRes = await paystackRequest('POST', '/transaction/initialize', {
      email:        req.user.email,
      amount:       amountKobo,
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscribe/callback`,
      metadata: {
        studentId:      req.user._id.toString(),
        tutorId:        tutorId.toString(),
        timesPerWeek,
        preferredSlots: JSON.stringify(preferredSlots || []),
        monthlyRate,
        trialBookingId: trialBookingId || '',
      },
    });

    if (!paystackRes.status) {
      return res.status(500).json({ message: paystackRes.message || 'Paystack init failed' });
    }

    res.json({
      authorization_url: paystackRes.data.authorization_url,
      reference:         paystackRes.data.reference,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/subscriptions/activate ─────────────────────────────────────────
// Verify Paystack payment and create subscription + book sessions for the month.
router.post('/activate', protect, async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ message: 'Payment reference required' });

    // Verify with Paystack
    const verify = await paystackRequest('GET', `/transaction/verify/${reference}`);
    if (!verify.data || verify.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Prevent double-activation
    const alreadyExists = await Subscription.findOne({ paymentRef: reference });
    if (alreadyExists) {
      return res.json({ subscription: alreadyExists, message: 'Already activated' });
    }

    const meta = verify.data.metadata || {};
    const tutorId        = meta.tutorId;
    const timesPerWeek   = Number(meta.timesPerWeek || 1);
    const preferredSlots = JSON.parse(meta.preferredSlots || '[]');
    const monthlyRate    = Number(meta.monthlyRate || 0);
    const trialBookingId = meta.trialBookingId || null;

    const tutorProfile = await TutorProfile.findById(tutorId).populate('user', 'name email');
    if (!tutorProfile) return res.status(404).json({ message: 'Tutor not found' });

    const avail = await TutorAvailability.findOne({ tutor: tutorId });
    const sessionDuration = avail?.sessionDuration || 60;
    const timezone        = avail?.timezone || 'Africa/Lagos';

    const startDate   = new Date();
    const renewalDate = new Date(startDate.getTime() + 30 * 24 * 3600000); // +30 days

    // Create subscription record
    const subscription = await Subscription.create({
      tutor:           tutorId,
      student:         req.user._id,
      trialBookingId:  trialBookingId || undefined,
      timesPerWeek,
      preferredSlots,
      sessionDuration,
      monthlyRate,
      status:          'active',
      startDate,
      renewalDate,
      paymentRef:      reference,
    });

    // ── Auto-book sessions for the next month ──────────────────────────────
    // Each preferred slot appears once per week × 4 weeks = 4 sessions per slot
    const WEEKS = 4;
    const createdBookings = [];

    for (const slot of preferredSlots) {
      const occurrences = getNextOccurrences(slot.day, slot.time, timezone, WEEKS);
      for (const sessionDate of occurrences) {
        const timeSlot = formatTimeInTZ(sessionDate, timezone);
        const booking  = await Booking.create({
          user:           req.user._id,
          tutorId,
          name:           req.user.name || '',
          email:          req.user.email,
          service:        'tutoring-session',
          date:           sessionDate,
          timeSlot,
          timezone,
          recurrence:     'weekly',
          recurrenceCount: WEEKS,
          status:         'confirmed',
          isTrial:        false,
          subscriptionId: subscription._id,
        });
        createdBookings.push(booking);
      }
    }

    // Attach booking IDs to the subscription
    subscription.sessionIds = createdBookings.map(b => b._id);
    await subscription.save();

    // ── Email: student ─────────────────────────────────────────────────────
    const tutorName = tutorProfile.displayName || tutorProfile.user?.name || 'your tutor';
    const dateList  = createdBookings
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(b => `${new Date(b.date).toDateString()} at ${b.timeSlot}`)
      .join('<br/>');

    const plainDateList = createdBookings
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(b => `${new Date(b.date).toDateString()} at ${b.timeSlot}`)
      .join('\n');

    await sendEmail({
      to:      req.user.email,
      subject: `Subscription Confirmed — ${timesPerWeek}× per week with ${tutorName}`,
      html: `<p>Hi ${req.user.name},</p>
<p>Your monthly tutoring subscription with <strong>${tutorName}</strong> is now <strong>active</strong>.</p>
<p><strong>Sessions booked (${createdBookings.length} total):</strong><br/>${dateList}</p>
<p><strong>Monthly rate:</strong> ₦${monthlyRate.toLocaleString()}</p>
<p>Your next renewal date is <strong>${renewalDate.toDateString()}</strong>. You will receive a reminder before then.</p>
<p>— Education Naija &amp; Overseas Team</p>`,
    }).catch(() => {});
    sendWhatsApp({
      to: req.user.phone,
      message: `Hi ${req.user.name},\n\nYour monthly tutoring subscription with *${tutorName}* is now *active*! 🎉\n\n📅 *Sessions booked (${createdBookings.length} total):*\n${plainDateList}\n\n💰 *Monthly rate:* ₦${monthlyRate.toLocaleString()}\n📆 *Next renewal:* ${renewalDate.toDateString()}\n\n— Education Naija & Overseas Team`,
    }).catch(() => {});

    // ── Email: tutor ───────────────────────────────────────────────────────
    if (tutorProfile.user?.email) {
      await sendEmail({
        to:      tutorProfile.user.email,
        subject: `New Subscriber — ${req.user.name}`,
        html: `<p>Hi ${tutorName},</p>
<p><strong>${req.user.name}</strong> has subscribed to ${timesPerWeek} session${timesPerWeek > 1 ? 's' : ''} per week with you.</p>
<p>${createdBookings.length} sessions have been auto-booked for the next month. Log in to your <a href="${process.env.CLIENT_URL}/schedule">schedule dashboard</a> to view them.</p>
<p>— Education Naija &amp; Overseas Team</p>`,
      }).catch(() => {});
      const tutorUserDoc = await require('../models/User').findById(tutorProfile.user._id).select('phone').lean().catch(() => null);
      sendWhatsApp({
        to: tutorUserDoc?.phone,
        message: `Hi ${tutorName},\n\n*${req.user.name}* has subscribed to ${timesPerWeek} session${timesPerWeek > 1 ? 's' : ''} per week with you. 🎓\n\n${createdBookings.length} sessions have been auto-booked for the next month. Log in to your schedule dashboard to view them.\n\n— Education Naija & Overseas Team`,
      }).catch(() => {});
    }

    res.status(201).json({
      subscription,
      bookings: createdBookings,
      message: `Subscription activated! ${createdBookings.length} sessions booked for the month.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/subscriptions/my ─────────────────────────────────────────────────
// Student: get their own subscriptions
router.get('/my', protect, async (req, res) => {
  try {
    const subs = await Subscription.find({ student: req.user._id })
      .populate('tutor', 'displayName profilePhoto subjects hourlyRateNaira')
      .sort({ createdAt: -1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/subscriptions/tutor ──────────────────────────────────────────────
// Tutor: get their subscribers
router.get('/tutor', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.json({ subscriptions: [] });
    const subs = await Subscription.find({ tutor: profile._id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/subscriptions/:id/cancel ──────────────────────────────────────
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, student: req.user._id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });
    sub.status = 'cancelled';
    await sub.save();
    // Cancel future unconfirmed bookings in this subscription
    await Booking.updateMany(
      { subscriptionId: sub._id, date: { $gte: new Date() }, status: 'confirmed' },
      { $set: { status: 'cancelled' } }
    );
    res.json({ subscription: sub, message: 'Subscription cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/subscriptions/:id/renew ────────────────────────────────────────
// Student renews (initiates new payment for the next month)
router.post('/:id/renew', protect, async (req, res) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, student: req.user._id });
    if (!sub) return res.status(404).json({ message: 'Subscription not found' });

    const paystackRes = await paystackRequest('POST', '/transaction/initialize', {
      email:        req.user.email,
      amount:       Math.round(sub.monthlyRate * 100),
      callback_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscribe/callback?renew=${sub._id}`,
      metadata: {
        studentId:      req.user._id.toString(),
        tutorId:        sub.tutor.toString(),
        timesPerWeek:   sub.timesPerWeek,
        preferredSlots: JSON.stringify(sub.preferredSlots),
        monthlyRate:    sub.monthlyRate,
        renewSubscriptionId: sub._id.toString(),
      },
    });

    if (!paystackRes.status) {
      return res.status(500).json({ message: 'Paystack init failed' });
    }

    res.json({ authorization_url: paystackRes.data.authorization_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/subscriptions/admin ──────────────────────────────────────────────
// Admin: see all subscriptions with payment info
router.get('/admin', protect, async (req, res) => {
  try {
    // inline admin check
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const subs = await Subscription.find()
      .populate('student', 'name email')
      .populate('tutor', 'displayName')
      .sort({ createdAt: -1 });
    res.json({ subscriptions: subs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
