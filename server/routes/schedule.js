const express = require('express');
const router = express.Router();
const TutorAvailability = require('../models/TutorAvailability');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');
const { protect, optionalAuth } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { localToUTC, formatTimeInTZ, getDayInTZ, todayInTZ } = require('../utils/timezone');

// ── GET /api/schedule/availability/:tutorId ─────────────────────────────────
// Public — return a tutor's availability settings
router.get('/availability/:tutorId', async (req, res) => {
  try {
    const avail = await TutorAvailability.findOne({ tutor: req.params.tutorId });
    res.json({ availability: avail });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/schedule/availability ────────────────────────────────────────
// Tutor only — create or replace their availability settings
router.patch('/availability', protect, async (req, res) => {
  try {
    let profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) {
      // Auto-create a minimal profile so the tutor can set availability right away
      profile = await TutorProfile.create({ user: req.user._id });
    }

    const { timezone, sessionDuration, bufferMinutes, maxDaysAhead, weeklySlots, blockedDates } = req.body;

    const avail = await TutorAvailability.findOneAndUpdate(
      { tutor: profile._id },
      { $set: { timezone, sessionDuration, bufferMinutes, maxDaysAhead, weeklySlots, blockedDates } },
      { new: true, upsert: true }
    );

    res.json({ availability: avail, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/schedule/available-dates/:tutorId ──────────────────────────────
// Public — which calendar dates in a given month have open slots
// Query: ?month=YYYY-MM
router.get('/available-dates/:tutorId', async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: 'month query param required (YYYY-MM)' });

    const avail = await TutorAvailability.findOne({ tutor: req.params.tutorId });
    if (!avail || avail.weeklySlots.length === 0) return res.json({ availableDates: [] });

    const [year, mon] = month.split('-').map(Number);
    const daysInMonth = new Date(year, mon, 0).getDate();
    const today = todayInTZ(avail.timezone);
    const maxDate = new Date(today + 'T12:00:00Z');
    maxDate.setDate(maxDate.getDate() + avail.maxDaysAhead);

    const activeDays = new Set(avail.weeklySlots.map(s => s.day));
    const blockedSet = new Set(avail.blockedDates || []);
    const availableDates = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(mon).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateUTC = new Date(dateStr + 'T12:00:00Z');

      if (dateStr <= today) continue;             // past
      if (dateUTC > maxDate) continue;            // beyond booking window
      if (blockedSet.has(dateStr)) continue;      // explicitly blocked

      const dow = getDayInTZ(dateStr, avail.timezone);
      if (activeDays.has(dow)) availableDates.push(dateStr);
    }

    res.json({ availableDates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/schedule/slots/:tutorId ────────────────────────────────────────
// Public — return available time slots for a specific date
// Query: ?date=YYYY-MM-DD&timezone=Africa/Lagos  (student's timezone for display)
router.get('/slots/:tutorId', async (req, res) => {
  try {
    const { date, timezone: studentTz } = req.query;
    if (!date) return res.status(400).json({ message: 'date query param required' });

    const avail = await TutorAvailability.findOne({ tutor: req.params.tutorId });
    if (!avail || avail.weeklySlots.length === 0) return res.json({ slots: [], sessionDuration: 60 });

    // Blocked or past check
    const today = todayInTZ(avail.timezone);
    if (date <= today || (avail.blockedDates || []).includes(date)) return res.json({ slots: [] });

    const dow = getDayInTZ(date, avail.timezone);
    const daySlots = avail.weeklySlots.filter(s => s.day === dow);
    if (daySlots.length === 0) return res.json({ slots: [], sessionDuration: avail.sessionDuration });

    // Existing confirmed/pending bookings for this tutor on this date
    const dateStart = new Date(date + 'T00:00:00Z');
    const dateEnd   = new Date(date + 'T23:59:59Z');
    const existing  = await Booking.find({
      tutorId: req.params.tutorId,
      date: { $gte: dateStart, $lte: dateEnd },
      status: { $in: ['pending', 'confirmed'] },
    });

    const { sessionDuration, bufferMinutes } = avail;
    const now = new Date();
    const slots = [];

    for (const slot of daySlots) {
      let [curH, curM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);

      while (true) {
        const endTotalMin = curH * 60 + curM + sessionDuration;
        const slotEndH = Math.floor(endTotalMin / 60);
        const slotEndM = endTotalMin % 60;

        // Past availability window end → stop
        if (slotEndH > endH || (slotEndH === endH && slotEndM > endM)) break;

        const timeStr  = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;
        const slotUTC  = localToUTC(date, timeStr, avail.timezone);
        const slotEndU = new Date(slotUTC.getTime() + sessionDuration * 60000);

        // Skip past slots (add 30-min lead time)
        if (slotUTC <= new Date(now.getTime() + 30 * 60000)) {
          const nextMin = curH * 60 + curM + sessionDuration + bufferMinutes;
          curH = Math.floor(nextMin / 60); curM = nextMin % 60;
          continue;
        }

        // Check conflict with existing bookings
        const conflict = existing.some(b => {
          const bStart = new Date(b.date);
          const bEnd   = new Date(bStart.getTime() + (sessionDuration + bufferMinutes) * 60000);
          return slotUTC < bEnd && slotEndU > bStart;
        });

        if (!conflict) {
          slots.push({
            utc:         slotUTC.toISOString(),
            tutorTime:   timeStr,
            studentTime: studentTz ? formatTimeInTZ(slotUTC, studentTz) : null,
          });
        }

        const nextMin = curH * 60 + curM + sessionDuration + bufferMinutes;
        curH = Math.floor(nextMin / 60); curM = nextMin % 60;
      }
    }

    res.json({ slots, sessionDuration: avail.sessionDuration, timezone: avail.timezone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/schedule/book ──────────────────────────────────────────────────
// Create a booking — requires login; name/email come from the authenticated user
router.post('/book', protect, async (req, res) => {
  try {
    const {
      tutorId,
      slotUTC,        // ISO string of the chosen slot
      timezone,       // student's timezone
      notes,
      recurrence,     // 'none' | 'weekly' | 'biweekly' | 'monthly'
      recurrenceCount,
      isTrial,
    } = req.body;

    const name  = req.user.name  || req.user.email;
    const email = req.user.email;
    const phone = req.user.phone || '';

    if (!tutorId || !slotUTC) {
      return res.status(400).json({ message: 'tutorId and slotUTC are required' });
    }

    const tutorProfile = await TutorProfile.findById(tutorId)
      .populate('user', 'name email googleTokens');
    if (!tutorProfile) return res.status(404).json({ message: 'Tutor not found' });

    // Enforce: one trial per tutor per student
    if (isTrial) {
      const existingTrial = await Booking.findOne({
        user:    req.user._id,
        tutorId: tutorId,
        isTrial: true,
        status:  { $ne: 'cancelled' },
      });
      if (existingTrial) {
        return res.status(400).json({
          message: 'You have already booked a free trial with this tutor. Subscribe to continue learning with them.',
          alreadyTrialled: true,
        });
      }
    }

    const avail          = await TutorAvailability.findOne({ tutor: tutorId });
    const sessionDuration = avail?.sessionDuration || 60;
    const tutorTz         = avail?.timezone || 'Africa/Lagos';

    const isRecurring = recurrence && recurrence !== 'none';
    const count       = isRecurring ? (Number(recurrenceCount) || 4) : 1;
    const intervalMs  = recurrence === 'weekly'   ? 7  * 86400000
                      : recurrence === 'biweekly' ? 14 * 86400000
                      : recurrence === 'monthly'  ? 30 * 86400000 : 0;

    const baseDate = new Date(slotUTC);
    const created  = [];

    for (let i = 0; i < count; i++) {
      const sessionDate = new Date(baseDate.getTime() + i * intervalMs);
      const timeSlot    = formatTimeInTZ(sessionDate, tutorTz);

      const booking = await Booking.create({
        user:            req.user._id,
        tutorId,
        name, email, phone,
        service:         'tutoring-session',
        date:            sessionDate,
        timeSlot,
        timezone:        timezone || tutorTz,
        notes,
        recurrence:      recurrence || 'none',
        recurrenceCount: count,
        isTrial:         !!isTrial,
        status:          'pending',
        ...(i > 0 && created.length > 0 ? { parentBookingId: created[0]._id } : {}),
      });

      created.push(booking);
    }

    // Create Google Calendar event for the first session if tutor connected
    if (tutorProfile.user?.googleTokens?.accessToken) {
      try {
        const { createCalendarEvent } = require('./gcalendar');
        const eventId = await createCalendarEvent(tutorProfile.user, {
          summary:     `Tutoring with ${name}`,
          description: notes || '',
          startISO:    baseDate.toISOString(),
          endISO:      new Date(baseDate.getTime() + sessionDuration * 60000).toISOString(),
          timezone:    tutorTz,
          attendees:   [email, tutorProfile.user.email].filter(Boolean),
        });
        if (eventId) {
          await Booking.findByIdAndUpdate(created[0]._id, { googleEventId: eventId });
        }
      } catch (_) { /* GCal failure should not block booking */ }
    }

    // Confirmation email to student
    const datesList = created
      .map(b => `${new Date(b.date).toDateString()} at ${b.timeSlot}`)
      .join(', ');

    await sendEmail({
      to: email,
      subject: 'Tutoring Session Booked — Naija & Overseas',
      html: `<p>Hi ${name},</p>
<p>Your tutoring session with <strong>${tutorProfile.displayName || tutorProfile.user?.name || 'your tutor'}</strong> has been booked and is pending confirmation.</p>
<p><strong>Session${created.length > 1 ? 's' : ''}:</strong> ${datesList}</p>
<p>We'll notify you once the tutor confirms.</p>
<p>— Naija &amp; Overseas Team</p>`,
    }).catch(() => {});

    // Notify the tutor
    if (tutorProfile.user?.email) {
      await sendEmail({
        to: tutorProfile.user.email,
        subject: `New Booking Request — ${name}`,
        html: `<p>Hi ${tutorProfile.displayName || 'Tutor'},</p>
<p>You have a new booking request from <strong>${name}</strong> (${email}).</p>
<p><strong>Session${created.length > 1 ? 's' : ''}:</strong> ${datesList}</p>
<p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/schedule">schedule dashboard</a> to confirm or decline.</p>
<p>— Naija &amp; Overseas Team</p>`,
      }).catch(() => {});
    }

    res.status(201).json({
      bookings: created,
      message: `${created.length} session${created.length > 1 ? 's' : ''} booked. Check your email for details.`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/schedule/sessions ───────────────────────────────────────────────
// Protected — return sessions for the current user (tutor or student)
// Query: ?status=&from=ISO&to=ISO
router.get('/sessions', protect, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = { service: 'tutoring-session' };

    if (req.user.role === 'tutor') {
      const profile = await TutorProfile.findOne({ user: req.user._id });
      if (!profile) return res.json({ sessions: [] });
      filter.tutorId = profile._id;
    } else {
      filter.user = req.user._id;
    }

    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(to);
    }

    const sessions = await Booking.find(filter)
      .populate('user',    'name email')
      .populate('tutorId', 'displayName profilePhoto subjects')
      .sort({ date: 1 });

    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
