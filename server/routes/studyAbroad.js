const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const StudyAbroadApplication = require('../models/StudyAbroadApplication');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const EmailOTP = require('../models/EmailOTP');
const ConsultationAvailability = require('../models/ConsultationAvailability');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

const CLIENT_URL = process.env.CLIENT_URL || 'https://www.visiteno.com';
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

async function getAvailability() {
  let doc = await ConsultationAvailability.findOne();
  if (!doc) doc = await ConsultationAvailability.create({});
  return doc;
}

// GET /api/study-abroad/availability — public: weekly schedule for calendar rendering
router.get('/availability', async (req, res) => {
  try {
    const doc = await getAvailability();
    const weeklySchedule = {};
    DAY_KEYS.forEach((key) => {
      weeklySchedule[key] = { enabled: doc[key].enabled, slots: doc[key].slots };
    });
    res.json({ weeklySchedule, dateOverrides: doc.dateOverrides });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/study-abroad/slots?date=YYYY-MM-DD — public: slots for a date with booked status
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date is required' });

    const doc = await getAvailability();
    const dayObj = new Date(date + 'T12:00:00Z');
    const dayKey = DAY_KEYS[dayObj.getUTCDay()];

    const override = doc.dateOverrides.find((o) => o.date === date);
    let enabled, slots;
    if (override) {
      enabled = override.enabled;
      slots = override.slots.length > 0 ? override.slots : doc[dayKey].slots;
    } else {
      enabled = doc[dayKey].enabled;
      slots = doc[dayKey].slots;
    }

    if (!enabled || slots.length === 0) {
      return res.json({ enabled: false, slots: [] });
    }

    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedDocs = await Booking.find({
      service: 'study-abroad-consultation',
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'cancelled' },
    }).select('timeSlot');

    const bookedSet = new Set(bookedDocs.map((b) => b.timeSlot));

    res.json({
      enabled: true,
      slots: slots.map((time) => ({ time, booked: bookedSet.has(time) })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/study-abroad/admin/availability — admin: full config
router.get('/admin/availability', protect, isAdmin, async (req, res) => {
  try {
    const doc = await getAvailability();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/study-abroad/admin/availability — admin: update config
router.put('/admin/availability', protect, isAdmin, async (req, res) => {
  try {
    let doc = await ConsultationAvailability.findOne();
    if (!doc) {
      doc = await ConsultationAvailability.create(req.body);
    } else {
      const { sun, mon, tue, wed, thu, fri, sat, dateOverrides } = req.body;
      if (sun !== undefined) doc.sun = sun;
      if (mon !== undefined) doc.mon = mon;
      if (tue !== undefined) doc.tue = tue;
      if (wed !== undefined) doc.wed = wed;
      if (thu !== undefined) doc.thu = thu;
      if (fri !== undefined) doc.fri = fri;
      if (sat !== undefined) doc.sat = sat;
      if (dateOverrides !== undefined) doc.dateOverrides = dateOverrides;
      await doc.save();
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study-abroad/check-email — duplicate booking check before payment
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    const duplicate = await Booking.findOne({
      email: email.toLowerCase(),
      service: 'study-abroad-consultation',
    });
    if (duplicate) {
      return res.status(400).json({
        message: 'This email has already been used to book a consultation. Our team will be in touch with you shortly.',
        alreadyBooked: true,
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('check-email error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study-abroad/send-otp — kept for backwards compatibility (unused by frontend)
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    // Block if already booked
    const duplicate = await Booking.findOne({
      email: email.toLowerCase(),
      service: 'study-abroad-consultation',
    });
    if (duplicate) {
      return res.status(400).json({
        message: 'This email has already been used to book a consultation. Our team will be in touch with you shortly.',
        alreadyBooked: true,
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await EmailOTP.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otpHash, expires: new Date(Date.now() + 10 * 60 * 1000) },
      { upsert: true }
    );

    res.json({ message: 'Verification code sent. Please check your email.' });

    sendEmail({
      to: email,
      subject: 'Your Email Verification Code — Education Naija & Overseas',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#14532d;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">Education Naija &amp; Overseas</p>
            <p style="margin:4px 0 0;font-size:11px;color:#86efac;letter-spacing:.05em;">INTERNATIONAL EDUCATIONAL CONSULTANCY</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;text-align:center;">
            <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;font-size:26px;line-height:56px;">✉️</div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Verify Your Email</h1>
            <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.6;">
              Use the code below to verify your email address and proceed to booking your consultation.<br/>
              This code expires in <strong>10 minutes</strong>.
            </p>
            <div style="display:inline-block;background:#f0fdf4;border:2px solid #16a34a;border-radius:16px;padding:20px 48px;margin-bottom:24px;">
              <p style="margin:0;font-size:42px;font-weight:900;color:#14532d;letter-spacing:12px;">${otp}</p>
            </div>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              If you did not request this, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">&copy; ${new Date().getFullYear()} Education Education Naija & Overseas &bull; Lagos, Nigeria</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => console.error('📧 OTP email failed:', err.message));

  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study-abroad/verify-otp — verify code and return a short-lived token
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and code are required.' });

    const record = await EmailOTP.findOne({ email: email.toLowerCase() });
    if (!record || record.expires < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }

    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    if (hash !== record.otpHash) {
      return res.status(400).json({ message: 'Incorrect code. Please try again.' });
    }

    await EmailOTP.deleteOne({ _id: record._id });

    const verificationToken = jwt.sign(
      { email: email.toLowerCase(), verified: true },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    res.json({ verificationToken, message: 'Email verified. You may now proceed to payment.' });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study-abroad/consultation — paid consultation booking
router.post('/consultation', optionalAuth, async (req, res) => {
  try {
    const { fullName, email, phone, destinationCountry, program, educationLevel,
            consultDate, consultTime, reference, couponCode, finalAmount } = req.body;

    if (!fullName || !email || !phone || !consultDate || !consultTime || !reference) {
      return res.status(400).json({ message: 'Missing required booking fields.' });
    }

    // Duplicate check (primary check is in /check-email, this is the safety net)
    const duplicate = await Booking.findOne({
      email: email.toLowerCase(),
      service: 'study-abroad-consultation',
    });
    if (duplicate) {
      return res.status(400).json({
        message: 'This email has already been used to book a consultation.',
      });
    }

    // Slot conflict check — prevent double-booking the same date+time
    const bookingDate = new Date(consultDate);
    const startOfDay = new Date(bookingDate); startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate); endOfDay.setUTCHours(23, 59, 59, 999);
    const slotConflict = await Booking.findOne({
      service: 'study-abroad-consultation',
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot: consultTime,
      status: { $ne: 'cancelled' },
    });
    if (slotConflict) {
      return res.status(400).json({
        message: 'This time slot was just booked by someone else. Please go back and select a different time.',
        slotTaken: true,
      });
    }

    // ── 0. Validate & consume coupon (if provided) ───────────────
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });
      if (appliedCoupon) {
        await Coupon.findByIdAndUpdate(appliedCoupon._id, { $inc: { usedCount: 1 } });
      }
    }

    // ── 1. Find or auto-create user account ──────────────────────
    let user = await User.findOne({ email: email.toLowerCase() });
    let isNewUser = false;
    let passwordSetToken = null;

    if (!user) {
      isNewUser = true;
      const rawToken = crypto.randomBytes(32).toString('hex');
      passwordSetToken = rawToken;
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      user = await User.create({
        name: fullName,
        email: email.toLowerCase(),
        phone,
        password: crypto.randomBytes(16).toString('hex'), // temp password — user sets via link
        role: 'student',
        goal: 'study-abroad',
        isVerified: true, // system-created — no email verification needed
        resetPasswordToken: hashedToken,
        resetPasswordExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }

    // ── 2. Save booking record ────────────────────────────────────
    const booking = await Booking.create({
      user: user._id,
      name: fullName,
      email: email.toLowerCase(),
      phone,
      service: 'study-abroad-consultation',
      date: new Date(consultDate),
      timeSlot: consultTime,
      status: 'pending',
      paymentRef: reference,
      notes: [
        educationLevel && `Education: ${educationLevel}`,
        destinationCountry && `Destination: ${destinationCountry}`,
        program && `Program: ${program}`,
        appliedCoupon && `Coupon: ${appliedCoupon.code} (${appliedCoupon.type === 'full' ? 'Free' : appliedCoupon.value + '% off'})`,
        finalAmount !== undefined && `Amount Paid: ₦${Number(finalAmount).toLocaleString()}`,
      ].filter(Boolean).join(' | '),
    });

    // ── 3. Build email content ────────────────────────────────────
    const clientUrl = process.env.CLIENT_URL || 'https://www.visiteno.com';
    const setPasswordLink = isNewUser
      ? `${clientUrl}/set-password/${passwordSetToken}`
      : null;

    const formattedDate = new Date(consultDate).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    const paidAmount = finalAmount !== undefined ? Number(finalAmount) : 10000;
    const detailsRows = [
      ['Full Name', fullName],
      ['Date', formattedDate],
      ['Time', consultTime],
      educationLevel && ['Education Level', educationLevel],
      destinationCountry && ['Destination', destinationCountry],
      program && ['Program / Course', program],
      appliedCoupon && ['Coupon Applied', appliedCoupon.type === 'full' ? 'Full Discount (Free)' : `${appliedCoupon.value}% off`],
      ['Amount Paid', paidAmount === 0 ? 'Free (Coupon Applied)' : `₦${paidAmount.toLocaleString()}`],
      ['Payment Reference', reference],
    ].filter(Boolean);

    const detailsHtml = detailsRows.map(([label, value]) => `
      <tr>
        <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;
                   font-size:13px;color:#6b7280;font-weight:600;width:38%;vertical-align:top;">${label}</td>
        <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;
                   font-size:13px;color:#111827;vertical-align:top;">${value}</td>
      </tr>`).join('');

    const accountSection = isNewUser && setPasswordLink ? `
        <tr>
          <td style="padding:0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
              <tr>
                <td style="padding:24px;">
                  <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#166534;">
                    🎉 We created an account for you
                  </p>
                  <p style="margin:0 0 18px;font-size:13px;color:#15803d;line-height:1.6;">
                    Click the button below to set your password and access your study abroad dashboard.
                    This link expires in <strong>7 days</strong>.
                  </p>
                  <a href="${setPasswordLink}"
                     style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;
                            font-size:14px;padding:13px 32px;border-radius:8px;text-decoration:none;">
                    Set My Password &rarr;
                  </a>
                  <p style="margin:14px 0 0;font-size:11px;color:#6b7280;">
                    Or copy this link: <a href="${setPasswordLink}" style="color:#16a34a;word-break:break-all;">${setPasswordLink}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>` : '';

    const userEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#14532d;padding:32px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-.3px;">
              Education Naija &amp; Overseas
            </p>
            <p style="margin:4px 0 0;font-size:12px;color:#86efac;letter-spacing:.05em;">
              INTERNATIONAL EDUCATIONAL CONSULTANCY
            </p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:32px 40px 20px;text-align:center;border-bottom:1px solid #f0fdf4;">
            <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;
                        display:flex;align-items:center;justify-content:center;font-size:26px;">✅</div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">
              Consultation Booked!
            </h1>
            <p style="margin:0;font-size:14px;color:#6b7280;">
              Hi <strong>${fullName}</strong>, your payment was successful and your consultation
              slot has been reserved.
            </p>
          </td>
        </tr>

        <!-- Booking details -->
        <tr>
          <td style="padding:24px 40px;">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6b7280;
                      text-transform:uppercase;letter-spacing:.08em;">Booking Details</p>
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
              ${detailsHtml}
            </table>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:0 40px 24px;">
            <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#6b7280;
                      text-transform:uppercase;letter-spacing:.08em;">What Happens Next</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['📋', 'Profile Review', 'Our senior counsellor will review your study abroad goals before your session.'],
                ['🔗', 'Consultation Link', 'You will receive a secure video call link on this email address at least 24 hours before your scheduled session.'],
                ['🎓', 'Your Session', `Join your consultation on <strong>${formattedDate} at ${consultTime}</strong> and get a personalised university shortlist and roadmap.`],
              ].map(([icon, title, desc]) => `
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:36px;font-size:20px;">${icon}</td>
                <td style="padding:10px 0 10px 8px;vertical-align:top;">
                  <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#111827;">${title}</p>
                  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">${desc}</p>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        ${accountSection}

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
              Have a question before your session?
            </p>
            <a href="mailto:info@visiteno.com"
               style="font-size:13px;color:#16a34a;font-weight:600;text-decoration:none;">
              info@visiteno.com
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;text-align:center;
                     border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
              &copy; ${new Date().getFullYear()} Education Education Naija & Overseas &bull; Lagos, Nigeria<br>
              You are receiving this because you booked a consultation with us.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── 4. Admin notification email ───────────────────────────────
    const adminEmailHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
  <h2 style="color:#14532d;">New Consultation Booking</h2>
  <table style="width:100%;border-collapse:collapse;">
    ${detailsRows.concat([['Phone', phone], ['New Account Created', isNewUser ? 'Yes' : 'No']])
      .map(([l, v]) => `<tr><td style="padding:8px;background:#f9fafb;border:1px solid #e5e7eb;font-size:13px;color:#6b7280;width:40%;">${l}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;font-size:13px;">${v}</td></tr>`).join('')}
  </table>
  <p style="margin-top:16px;font-size:13px;color:#6b7280;">Booking ID: ${booking._id}</p>
</div>`;

    // ── 5. Respond immediately — send emails/WhatsApp in background ─
    res.status(201).json({
      message: 'Consultation booked successfully.',
      bookingId: booking._id,
      isNewUser,
    });

    sendEmail({
      to: email,
      subject: `Consultation Confirmed — ${formattedDate} at ${consultTime} | Education Naija & Overseas`,
      html: userEmailHtml,
    }).catch((err) => {
      console.error('📧 User confirmation email failed:', err.message);
      console.error('   Recipient:', email);
      console.error('   EMAIL_USER:', process.env.EMAIL_USER || '(not set)');
    });

    sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Consultation Booking — ${fullName} (${formattedDate} ${consultTime})`,
      html: adminEmailHtml,
    }).catch((err) => console.error('📧 Admin notification email failed:', err.message));

    // Booking confirmation WhatsApp (all users)
    sendWhatsApp({
      to: phone,
      message: `Hi ${fullName},\n\nYour study abroad consultation has been booked! ✅\n\n📅 *Date:* ${formattedDate}\n⏰ *Time:* ${consultTime}${destinationCountry ? `\n🌍 *Destination:* ${destinationCountry}` : ''}\n\nOur team will send you a meeting link before your session.\n\n— Education Naija & Overseas Team`,
    }).catch(() => {});

    // Set-password WhatsApp for new users (separate message so it stands out)
    if (isNewUser && setPasswordLink) {
      sendWhatsApp({
        to: phone,
        message: `Hi ${fullName},\n\nWe've created a Education Naija & Overseas account for you so you can track your consultation and application. 🎉\n\n🔐 *Set your password here:*\n${setPasswordLink}\n\n⚠️ This link expires in *7 days*. Keep it safe.\n\nOnce you set your password you can log in at any time to follow up on your application.\n\n— Education Naija & Overseas Team`,
      }).catch(() => {});
    }
  } catch (err) {
    console.error('Consultation booking error:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/study-abroad
router.post('/', optionalAuth, async (req, res) => {
  try {
    const application = await StudyAbroadApplication.create({
      ...req.body,
      user: req.user?._id,
    });

    await sendEmail({
      to: req.body.email,
      subject: 'Study Abroad Application Received — Education Education Naija & Overseas',
      html: `<p>Hi ${req.body.fullName}, we have received your application to study in <strong>${req.body.destinationCountry}</strong>. Our team will review it and contact you within 48 hours.</p>`,
    });
    sendWhatsApp({
      to: req.body.phone,
      message: `Hi ${req.body.fullName},\n\nWe have received your application to study in *${req.body.destinationCountry}*. 🎓\n\nOur team will review it and contact you within 48 hours.\n\n— Education Naija & Overseas Team`,
    }).catch(() => {});

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
