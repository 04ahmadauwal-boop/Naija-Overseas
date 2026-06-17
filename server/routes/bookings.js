const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Booking = require('../models/Booking');
const School = require('../models/School');
const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';

// POST /api/bookings
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { name, email, phone, service, date, timeSlot, notes, paymentRef, schoolId } = req.body;

    // Prevent duplicate consultation bookings per email
    if (service === 'study-abroad-consultation') {
      const duplicate = await Booking.findOne({
        email: email.toLowerCase(),
        service: 'study-abroad-consultation',
      });
      if (duplicate) {
        return res.status(400).json({
          message: 'You have already submitted a consultation request. Our team will be in touch with you shortly. Please check your email.',
        });
      }
    }

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

    // Email + WhatsApp the parent/requester
    await sendEmail({
      to: email,
      subject: 'Booking Received — Education Education Naija & Overseas',
      html: `<p>Hi ${name},</p>
<p>Your <strong>${service.replace(/-/g, ' ')}</strong> request for <strong>${dateStr}</strong> at <strong>${timeSlot}</strong> has been received. We'll confirm shortly.</p>
<p>— Education Naija &amp; Overseas Team</p>`,
    }).catch((err) => console.error('📧 Booking confirmation email failed:', err.message));
    sendWhatsApp({
      to: phone,
      message: `Hi ${name},\n\nYour *${service.replace(/-/g, ' ')}* request for *${dateStr}* at *${timeSlot}* has been received. We'll confirm shortly.\n\n— Education Naija & Overseas Team`,
    }).catch(() => {});

    // Auto-create a student account for study-abroad consultations if one doesn't exist
    if (service === 'study-abroad-consultation') {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (!existingUser) {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        await User.create({
          name,
          email: email.toLowerCase(),
          password: crypto.randomBytes(20).toString('hex'), // placeholder — replaced when they set password
          role: 'student',
          goal: 'study-abroad',
          phone,
          isVerified: false,
          resetPasswordToken: hashedToken,
          resetPasswordExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        const setPasswordUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/set-password/${rawToken}`;

        sendEmail({
          to: email,
          subject: 'Your Education Naija & Overseas Account is Ready — Choose a Password',
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#14532d;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">Education Naija &amp; Overseas</p>
            <p style="margin:4px 0 0;font-size:11px;color:#86efac;letter-spacing:.05em;">INTERNATIONAL EDUCATIONAL CONSULTANCY</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;text-align:center;">
            <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;font-size:26px;line-height:56px;">🎉</div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Your account is ready!</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              Hi <strong>${name}</strong>, your consultation has been booked.<br/>
              We've created an account for you so you can track your application and communicate with our team.<br/><br/>
              Click the button below to choose your password and access your dashboard.<br/>
              This link expires in <strong>7 days</strong>.
            </p>
            <a href="${setPasswordUrl}"
               style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;
                      font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">
              Choose My Password &rarr;
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${setPasswordUrl}" style="color:#16a34a;word-break:break-all;">${setPasswordUrl}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} Education Education Naija & Overseas &bull; Lagos, Nigeria
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        }).catch((err) => console.error('📧 Set-password email failed:', err.message));

        sendWhatsApp({
          to: phone,
          message: `Hi ${name}! 🎉\n\nYour consultation is booked and your Education Naija & Overseas account is ready.\n\n🔐 Click the link below to choose your password and access your dashboard:\n${setPasswordUrl}\n\n⏳ This link expires in 7 days.\n\n— Education Naija & Overseas Team`,
        }).catch(() => {});
      }
    }

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
            subject: `New Visit Request for ${school.name} — Education Naija & Overseas`,
            html: `<p>Hi ${school.owner.name},</p>
<p>A parent has requested a visit to <strong>${school.name}</strong>.</p>
<ul>
  <li><strong>Parent:</strong> ${name}</li>
  <li><strong>Date:</strong> ${dateStr}</li>
  <li><strong>Time:</strong> ${timeSlot}</li>
  ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
</ul>
<p>Log in to your <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard/school-owner">School Dashboard</a> to confirm or manage this visit.</p>
<p>— Education Naija &amp; Overseas Team</p>`,
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
      ? 'Your School Visit is Confirmed — Education Naija & Overseas'
      : 'School Visit Update — Education Naija & Overseas';
    const html = action === 'confirm'
      ? `<p>Hi ${booking.name},</p><p>Your visit on <strong>${new Date(booking.date).toDateString()}</strong> at <strong>${booking.timeSlot}</strong> has been <strong>confirmed</strong> by the school. See you there!</p>`
      : `<p>Hi ${booking.name},</p><p>Unfortunately your visit on <strong>${new Date(booking.date).toDateString()}</strong> could not be accommodated. Please try another date or contact the school directly.</p>`;
    await sendEmail({ to: booking.email, subject, html }).catch(() => {});
    sendWhatsApp({
      to: booking.phone,
      message: action === 'confirm'
        ? `Hi ${booking.name},\n\nYour school visit on *${new Date(booking.date).toDateString()}* at *${booking.timeSlot}* has been *confirmed*. See you there!\n\n— Education Naija & Overseas`
        : `Hi ${booking.name},\n\nUnfortunately your school visit on *${new Date(booking.date).toDateString()}* could not be accommodated. Please try another date or contact the school directly.\n\n— Education Naija & Overseas`,
    }).catch(() => {});

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

// PATCH /api/bookings/:id/tutor-action — tutor confirms, declines, or completes their own booking
router.patch('/:id/tutor-action', protect, async (req, res) => {
  try {
    const { action } = req.body;
    if (!['confirm', 'decline', 'complete'].includes(action)) {
      return res.status(400).json({ message: 'action must be confirm, decline, or complete' });
    }
    const tutorProfile = await TutorProfile.findOne({ user: req.user._id });
    if (!tutorProfile) return res.status(403).json({ message: 'Only tutors can perform this action' });

    const booking = await Booking.findOne({ _id: req.params.id, tutorId: tutorProfile._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found or does not belong to you' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    if (action === 'complete') {
      booking.status = 'completed';
      await booking.save();
      return res.json({ booking, message: 'Session marked as completed' });
    }

    booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';

    if (action === 'confirm' && !booking.callLink) {
      const roomId = `${booking._id.toString().slice(-6)}-${Date.now().toString(36)}`;
      booking.callLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/classroom/${roomId}`;
    }
    await booking.save();

    if (action === 'confirm') {
      await sendEmail({
        to: booking.email,
        subject: 'Your Tutoring Session is Confirmed! — Education Naija & Overseas',
        html: `<p>Hi ${booking.name},</p>
<p>Your tutoring session on <strong>${new Date(booking.date).toDateString()}</strong> at <strong>${booking.timeSlot}</strong> has been <strong>confirmed</strong>.</p>
${booking.callLink ? `<p>Join your class here: <a href="${booking.callLink}">${booking.callLink}</a></p>` : ''}`,
      }).catch(() => {});
      sendWhatsApp({
        to: booking.phone,
        message: `Hi ${booking.name},\n\nYour tutoring session on *${new Date(booking.date).toDateString()}* at *${booking.timeSlot}* has been *confirmed*! ✅${booking.callLink ? `\n\n🔗 Join your class here: ${booking.callLink}` : ''}\n\n— Education Naija & Overseas`,
      }).catch(() => {});
    } else {
      await sendEmail({
        to: booking.email,
        subject: 'Tutoring Session Update — Education Naija & Overseas',
        html: `<p>Hi ${booking.name},</p><p>Your tutoring session on <strong>${new Date(booking.date).toDateString()}</strong> could not be confirmed. Please book with another tutor.</p>`,
      }).catch(() => {});
      sendWhatsApp({
        to: booking.phone,
        message: `Hi ${booking.name},\n\nYour tutoring session on *${new Date(booking.date).toDateString()}* could not be confirmed. Please book with another tutor.\n\n— Education Naija & Overseas`,
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
    const existing = await Booking.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Booking not found' });

    const updates = {};
    if (req.body.status   !== undefined) updates.status   = req.body.status;
    if (req.body.callLink !== undefined) updates.callLink = req.body.callLink;

    const booking = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });

    // Send email when a call link is set or changed on a consultation
    const newLink = req.body.callLink;
    const linkChanged = newLink && newLink !== existing.callLink;

    if (linkChanged && booking.service === 'study-abroad-consultation') {
      const formattedDate = new Date(booking.date).toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#14532d;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">Education Naija &amp; Overseas</p>
            <p style="margin:4px 0 0;font-size:11px;color:#86efac;letter-spacing:.05em;">INTERNATIONAL EDUCATIONAL CONSULTANCY</p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #f0fdf4;">
            <div style="width:52px;height:52px;background:#dcfce7;border-radius:50%;margin:0 auto 14px;font-size:24px;line-height:52px;">🔗</div>
            <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#111827;">Your Consultation Link is Ready</h1>
            <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
              Hi <strong>${booking.name}</strong>, your consultation link has been set.
              You can now join your session at the scheduled time.
            </p>
          </td>
        </tr>

        <!-- Session details -->
        <tr>
          <td style="padding:24px 40px;">
            <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Session Details</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:600;width:38%;">Date</td>
                <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;font-weight:600;">Time</td>
                <td style="padding:10px 16px;background:#fff;font-size:13px;color:#111827;">${booking.timeSlot}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="${newLink}"
               style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;
                      font-size:15px;padding:16px 40px;border-radius:12px;text-decoration:none;
                      box-shadow:0 4px 12px rgba(22,163,74,.3);">
              Join Consultation &rarr;
            </a>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
              If the button doesn&apos;t work, copy and paste this link into your browser:<br>
              <a href="${newLink}" style="color:#16a34a;word-break:break-all;font-size:11px;">${newLink}</a>
            </p>
          </td>
        </tr>

        <!-- Tips -->
        <tr>
          <td style="padding:0 40px 28px;">
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px 20px;">
              <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:.05em;">Before You Join</p>
              <ul style="margin:0;padding-left:18px;font-size:13px;color:#15803d;line-height:1.8;">
                <li>Test your camera and microphone beforehand</li>
                <li>Join from a quiet location with a stable internet connection</li>
                <li>Have your documents and questions ready</li>
                <li>Join a few minutes early to avoid delays</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- Contact -->
        <tr>
          <td style="padding:0 40px 20px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#6b7280;">
              Questions? Email us at
              <a href="mailto:info@visiteno.com" style="color:#16a34a;font-weight:600;text-decoration:none;">info@visiteno.com</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} Education Education Naija & Overseas &bull; Lagos, Nigeria
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

      sendEmail({
        to: booking.email,
        subject: `Your Consultation Link — ${formattedDate} at ${booking.timeSlot} | Education Naija & Overseas`,
        html: emailHtml,
      }).catch((err) => console.error('📧 Call-link email failed:', err.message));
      sendWhatsApp({
        to: booking.phone,
        message: `Hi ${booking.name},\n\nYour study abroad consultation is confirmed for *${formattedDate}* at *${booking.timeSlot}*.\n\n🔗 Join your consultation here:\n${newLink}\n\nPlease join a few minutes early with a stable internet connection.\n\n— Education Naija & Overseas Team`,
      }).catch(() => {});
    }

    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
