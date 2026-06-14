const express = require('express');
const router = express.Router();
const TutorAvailability = require('../models/TutorAvailability');
const TutorProfile = require('../models/TutorProfile');
const Booking = require('../models/Booking');
const TutorQuestion = require('../models/TutorQuestion');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
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
      paymentRef,     // Paystack reference (required for discounted trial sessions)
      paidAmount,     // amount paid in naira
      quizAnswers,    // [{ questionId, chosenIndex }] — sent from student browser
      quizSubject,    // label for the quiz in the email
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
          message: 'You have already booked a discounted session with this tutor. Subscribe to continue learning with them.',
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

    // ── Server-side quiz scoring (correct answers never touch the browser) ──────
    let quizResults;
    if (isTrial && Array.isArray(quizAnswers) && quizAnswers.length > 0) {
      try {
        const ids = quizAnswers.map(a => a.questionId).filter(Boolean);
        const qs  = await TutorQuestion.find({ _id: { $in: ids }, tutor: tutorId });
        const qMap = {};
        qs.forEach(q => { qMap[q._id.toString()] = q; });

        let score = 0;
        const scoredAnswers = quizAnswers.map(a => {
          const q = qMap[a.questionId?.toString()];
          if (!q) return null;
          const isCorrect = Number(a.chosenIndex) === q.correctIndex;
          if (isCorrect) score++;
          return {
            topic:     q.topic || '',
            question:  q.question,
            options:   q.options,
            chosen:    Number(a.chosenIndex),
            correct:   q.correctIndex,
            isCorrect,
          };
        }).filter(Boolean);

        if (scoredAnswers.length > 0) {
          quizResults = {
            subject: quizSubject || qs[0]?.subject || 'Unknown',
            score,
            total:   scoredAnswers.length,
            answers: scoredAnswers,
          };
        }
      } catch { /* non-fatal — booking still saves without quiz */ }
    }

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
        notes:           isTrial && paidAmount !== undefined
                           ? [notes, `Discounted session — paid ₦${Number(paidAmount).toLocaleString()} (ref: ${paymentRef})`].filter(Boolean).join(' | ')
                           : notes,
        recurrence:      recurrence || 'none',
        recurrenceCount: count,
        isTrial:         !!isTrial,
        paymentRef:      isTrial ? paymentRef : undefined,
        quizResults:     quizResults || undefined,
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
    sendWhatsApp({
      to: phone,
      message: `Hi ${name},\n\nYour tutoring session with *${tutorProfile.displayName || tutorProfile.user?.name || 'your tutor'}* has been booked and is pending confirmation.\n\n*Session${created.length > 1 ? 's' : ''}:* ${datesList}\n\nWe'll notify you once the tutor confirms.\n\n— Naija & Overseas Team`,
    }).catch(() => {});

    // Notify the tutor — include quiz results when present
    if (tutorProfile.user?.email) {
      const LABELS = ['A', 'B', 'C', 'D', 'E'];

      let quizHtml = '';
      if (isTrial && quizResults && quizResults.answers?.length) {
        const score   = quizResults.score || 0;
        const total   = quizResults.total || quizResults.answers.length;
        const pct     = Math.round((score / total) * 100);
        const subject = quizResults.subject || 'Unknown';

        const weakTopics = quizResults.answers
          .filter(a => !a.isCorrect)
          .map(a => a.topic)
          .filter(Boolean);

        const rowsHtml = quizResults.answers.map((a, i) => {
          const chosen  = a.chosen !== undefined ? `${LABELS[a.chosen]}: ${a.options?.[a.chosen] || '—'}` : '—';
          const correct = a.correct !== undefined ? `${LABELS[a.correct]}: ${a.options?.[a.correct] || '—'}` : '—';
          const mark    = a.isCorrect ? '✅' : '❌';
          return `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;white-space:nowrap;">${i + 1}. ${a.topic || ''}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#111827;">${a.question || ''}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:${a.isCorrect ? '#16a34a' : '#dc2626'};">${chosen}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:12px;color:#16a34a;">${correct}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:14px;text-align:center;">${mark}</td>
            </tr>`;
        }).join('');

        const weakHtml = weakTopics.length
          ? `<p style="margin:16px 0 0;font-size:13px;color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:10px 14px;">
               <strong>⚠️ Areas needing attention:</strong> ${[...new Set(weakTopics)].join(', ')}
             </p>`
          : `<p style="margin:16px 0 0;font-size:13px;color:#166534;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;">
               🎉 <strong>Excellent!</strong> The student answered all questions correctly.
             </p>`;

        quizHtml = `
          <div style="margin:24px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <div style="background:#1e40af;padding:14px 20px;">
              <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">📊 Pre-Session Quiz Results — ${subject}</p>
              <p style="margin:4px 0 0;font-size:12px;color:#bfdbfe;">Score: ${score} / ${total} correct &nbsp;·&nbsp; ${pct}%</p>
            </div>
            <div style="overflow-x:auto;">
              <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;min-width:500px;">
                <thead>
                  <tr style="background:#f9fafb;">
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Topic</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Question</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Student Answered</th>
                    <th style="padding:8px 12px;text-align:left;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Correct Answer</th>
                    <th style="padding:8px 12px;text-align:center;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;border-bottom:1px solid #e5e7eb;">Result</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
            <div style="padding:4px 20px 16px;">${weakHtml}</div>
          </div>`;
      }

      const tutorName = tutorProfile.displayName || tutorProfile.user?.name || 'Tutor';
      const sessionType = isTrial ? 'Discounted First Session' : `Session${created.length > 1 ? 's' : ''}`;

      await sendEmail({
        to: tutorProfile.user.email,
        subject: `New Booking — ${name}${isTrial ? ' (Discounted Session + Quiz)' : ''}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#14532d;padding:24px 32px;">
            <p style="margin:0;font-size:18px;font-weight:800;color:#fff;">Naija &amp; Overseas</p>
            <p style="margin:4px 0 0;font-size:11px;color:#86efac;letter-spacing:.05em;">TUTOR NOTIFICATION</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px 8px;">
            <h2 style="margin:0 0 6px;font-size:18px;font-weight:800;color:#111827;">New ${sessionType} Request</h2>
            <p style="margin:0;font-size:14px;color:#6b7280;">Hi ${tutorName}, you have a new booking. Log in to confirm or decline.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 32px 24px;">
            <table cellpadding="0" cellspacing="0" style="width:100%;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-weight:600;width:36%;">Student</td>
                <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:700;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-weight:600;">Email</td>
                <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${email}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:12px;color:#6b7280;font-weight:600;">Session(s)</td>
                <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${datesList}</td>
              </tr>
              ${isTrial ? `<tr>
                <td style="padding:10px 16px;background:#f9fafb;font-size:12px;color:#6b7280;font-weight:600;">Type</td>
                <td style="padding:10px 16px;background:#fff;font-size:13px;color:#d97706;font-weight:700;">🏷️ Discounted First Session</td>
              </tr>` : ''}
            </table>

            ${quizHtml}

            <div style="text-align:center;margin-top:24px;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/schedule"
                 style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;font-size:14px;padding:13px 32px;border-radius:10px;text-decoration:none;">
                View &amp; Confirm Booking →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Naija and Overseas · Lagos, Nigeria</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }).catch(() => {});

      // WhatsApp to tutor
      const tutorUser = await User.findById(tutorProfile.user._id).select('phone').lean().catch(() => null);
      if (tutorUser?.phone) {
        let waQuiz = '';
        if (isTrial && quizResults?.answers?.length) {
          const pct = Math.round((quizResults.score / quizResults.total) * 100);
          const weak = [...new Set(quizResults.answers.filter(a => !a.isCorrect).map(a => a.topic).filter(Boolean))];
          waQuiz = `\n\n📊 *Quiz Result (${quizResults.subject}):* ${quizResults.score}/${quizResults.total} (${pct}%)${weak.length ? `\n⚠️ Weak areas: ${weak.join(', ')}` : '\n🎉 All correct!'}`;
        }
        sendWhatsApp({
          to: tutorUser.phone,
          message: `Hi ${tutorName},\n\nYou have a new *${sessionType}* booking!\n\n👤 *Student:* ${name}\n📧 *Email:* ${email}\n📅 *Session${created.length > 1 ? 's' : ''}:* ${datesList}${waQuiz}\n\nLog in to confirm or decline the booking.\n\n— Naija & Overseas`,
        }).catch(() => {});
      }
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
