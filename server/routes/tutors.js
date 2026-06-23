const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const TutorProfile = require('../models/TutorProfile');
const TutorReview = require('../models/TutorReview');
const TutorPayroll = require('../models/TutorPayroll');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

const uploadMedia = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB — needed for videos
});

// Maps student classLevel (onboarding value) → tutor levels[] values
const LEVEL_MAP = {
  'Primary 1-3': ['primary'],
  'Primary 4-6': ['primary'],
  'JSS 1': ['jss', 'primary'],
  'JSS 2': ['jss'],
  'JSS 3': ['jss'],
  'SS 1': ['sss'],
  'SS 2': ['sss', 'waec', 'neco'],
  'SS 3': ['sss', 'waec', 'neco', 'jamb'],
  'University': ['university', 'a-level', 'ib', 'sat'],
  'Post-Graduate': ['university', 'adult'],
  'Adult Learning': ['adult'],
};

// Max possible raw score across all dimensions
const MAX_SCORE = 80 + 20 + 30 + 15 + 10 + 10 + 13; // 178

function scoreMatch(tutor, student) {
  let score = 0;
  const reasons = [];

  // 1. Subject match — 40 pts per overlap, cap at 80
  const subjectMatches = (student.subjects || []).filter(s =>
    (tutor.subjects || []).some(ts =>
      ts.toLowerCase().includes(s.toLowerCase()) ||
      s.toLowerCase().includes(ts.toLowerCase())
    )
  );
  if (subjectMatches.length > 0) {
    score += Math.min(subjectMatches.length * 40, 80);
    reasons.push(`Teaches ${subjectMatches.slice(0, 2).join(' & ')}`);
  }

  // 2. Level / experience match — 20 pts
  if (student.classLevel && (tutor.levels || []).length > 0) {
    const mapped = LEVEL_MAP[student.classLevel] || [];
    if ((tutor.levels || []).some(tl => mapped.includes(tl.toLowerCase()))) {
      score += 20;
      reasons.push('Right experience level');
    }
  }

  // 3. Schedule / availability match — 15 pts per overlap, cap at 30
  const tutorAvail = tutor.availability || [];
  const scheduleMatches = (student.preferredSchedule || []).filter(
    s => tutorAvail.includes(s) || tutorAvail.includes('Flexible')
  );
  if (scheduleMatches.length > 0) {
    score += Math.min(scheduleMatches.length * 15, 30);
    reasons.push(`Available ${scheduleMatches[0]}`);
  }

  // 4. Language match — 15 pts
  const tutorLangs = (tutor.languages || []).map(l => l.toLowerCase());
  if (student.preferredLanguage) {
    if (tutorLangs.includes(student.preferredLanguage.toLowerCase())) {
      score += 15;
      reasons.push(`Teaches in ${student.preferredLanguage}`);
    }
  } else if (tutorLangs.includes('english')) {
    score += 8; // default English credit
  }

  // 5. Personality / teaching style match — 10 pts
  if (student.learningStyle && (tutor.teachingStyle || []).includes(student.learningStyle)) {
    score += 10;
    reasons.push('Matches your learning style');
  }

  // 6. Location match — 10 pts
  if (student.country && tutor.country &&
      tutor.country.toLowerCase() === student.country.toLowerCase()) {
    score += 10;
    reasons.push(`Based in ${tutor.country}`);
  }

  // 7. Quality bonuses — max 13
  if (tutor.isVerified) { score += 5; reasons.push('Verified tutor'); }
  if (tutor.rating >= 4.5) score += 5;
  if (tutor.trialAvailable) score += 3;

  const percentage = score === 0 ? 0 : Math.min(Math.round((score / MAX_SCORE) * 100), 99);
  return { score, percentage, reasons: [...new Set(reasons)] };
}

// GET /api/tutors — public search/list
router.get('/', async (req, res) => {
  try {
    const { subject, level, mode, state, minRate, maxRate, search, sort = 'featured', page = 1, limit = 12 } = req.query;

    const filter = { isActive: true };

    if (subject) filter.subjects = { $in: [new RegExp(subject, 'i')] };
    if (level) filter.levels = { $in: [level] };
    if (mode) filter.teachingMode = { $in: [mode] };
    if (state) filter.state = state;
    if (req.query.country) filter.country = req.query.country;
    if (minRate) filter.hourlyRateNaira = { ...filter.hourlyRateNaira, $gte: Number(minRate) };
    if (maxRate) filter.hourlyRateNaira = { ...filter.hourlyRateNaira, $lte: Number(maxRate) };
    if (search) {
      filter.$or = [
        { displayName: new RegExp(search, 'i') },
        { headline: new RegExp(search, 'i') },
        { subjects: { $in: [new RegExp(search, 'i')] } },
        { specializations: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortMap = {
      featured: { isVerified: -1, rating: -1, reviewCount: -1 },
      rating: { rating: -1, reviewCount: -1 },
      price_asc: { hourlyRateNaira: 1 },
      price_desc: { hourlyRateNaira: -1 },
      newest: { createdAt: -1 },
    };
    const sortObj = sortMap[sort] || sortMap.featured;

    const skip = (Number(page) - 1) * Number(limit);
    const [tutors, total] = await Promise.all([
      TutorProfile.find(filter)
        .populate('user', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      TutorProfile.countDocuments(filter),
    ]);

    res.json({ tutors, total, pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/me — logged-in tutor's own profile
router.get('/me', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id }).populate('user', 'name email');
    if (!profile) return res.status(404).json({ message: 'No tutor profile found' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/me/bookings — tutor's own bookings
router.get('/me/bookings', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'No tutor profile found' });
    const bookings = await Booking.find({ tutorId: profile._id, service: 'tutoring-session' })
      .populate('user', 'name email')
      .populate('subscriptionId', 'monthlyRate timesPerWeek status')
      .sort({ date: 1 })
      .limit(200);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/admin/all — admin: all profiles including inactive
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const tutors = await TutorProfile.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ tutors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/match — personalised matches for the logged-in student
router.get('/match', protect, async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    if (!student) return res.status(404).json({ message: 'User not found' });

    const tutors = await TutorProfile.find({ isActive: true })
      .populate('user', 'name email')
      .lean();

    const scored = tutors
      .map(tutor => ({ tutor, ...scoreMatch(tutor, student) }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ tutor, percentage, reasons }) => ({ ...tutor, percentage, matchReasons: reasons }));

    res.json({ matches: scored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/:id — public tutor detail
router.get('/:id', async (req, res) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id).populate('user', 'name email createdAt');
    if (!tutor || !tutor.isActive) return res.status(404).json({ message: 'Tutor not found' });

    const reviews = await TutorReview.find({ tutor: tutor._id })
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ tutor, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tutors/upload-media — pre-registration media upload (photo / document / video)
// Returns { url, publicId } — caller stores these and sends them in /register payload
router.post('/upload-media', protect, uploadMedia.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const { type } = req.body; // 'photo' | 'document' | 'video'

    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    let opts = { folder: `naija-overseas/tutor-verification/${req.user._id}`, resource_type: 'auto' };

    if (type === 'photo') {
      opts = {
        folder:         'naija-overseas/tutor-photos',
        public_id:      `tutor-applicant-${req.user._id}`,
        overwrite:      true,
        resource_type:  'image',
        transformation: [{ width: 600, height: 600, crop: 'fill', gravity: 'face' }],
      };
    } else if (type === 'video') {
      opts.folder        = 'naija-overseas/tutor-intros';
      opts.resource_type = 'video';
    }

    const result = await cloudinary.uploader.upload(dataUri, opts);
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tutors/register — become a tutor
router.post('/register', protect, async (req, res) => {
  try {
    const existing = await TutorProfile.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already have a tutor profile' });

    const {
      headline, bio, subjects, levels, teachingMode, country, state, city,
      currency, hourlyRateNaira, groupRateNaira, trialAvailable, trialDurationMins, trialDiscountPercent,
      languages, qualifications, yearsExperience, specializations,
      profilePhoto, introVideo, introVideoPublicId, verificationDocs,
    } = req.body;

    const profile = await TutorProfile.create({
      user: req.user._id,
      displayName: req.user.name,
      headline,
      bio,
      subjects: subjects || [],
      levels: levels || [],
      teachingMode: teachingMode || [],
      country: country || 'Nigeria',
      state,
      city,
      currency: currency || 'NGN',
      hourlyRateNaira,
      groupRateNaira,
      trialAvailable: trialAvailable !== false,
      trialDurationMins: trialDurationMins || 30,
      trialDiscountPercent: trialDiscountPercent !== undefined ? Number(trialDiscountPercent) : 50,
      languages: languages || [],
      qualifications: qualifications || [],
      yearsExperience: yearsExperience || 0,
      specializations: specializations || [],
      profilePhoto:        profilePhoto || undefined,
      introVideo:          introVideo || undefined,
      introVideoPublicId:  introVideoPublicId || undefined,
      verificationDocs:    verificationDocs || [],
    });

    // Keep User.profilePhoto in sync if photo was uploaded
    if (profilePhoto) {
      await User.findByIdAndUpdate(req.user._id, { profilePhoto }).catch(() => {});
    }

    const appMsg = `Hi ${req.user.name},\n\nThank you for applying to become a tutor on Education Naija & Overseas! We have received your application and will review it within 24–48 hours.\n\nOnce approved, your profile will go live and students will be able to book sessions with you.\n\nBest regards,\nThe Education Naija & Overseas Team`;
    sendEmail({
      to: req.user.email,
      subject: 'Tutor Application Received — Education Naija & Overseas',
      html: `<p>Hi ${req.user.name},</p><p>Thank you for applying to become a tutor on Education Naija & Overseas! We have received your application and will review it within <strong>24–48 hours</strong>.</p><p>Once approved, your profile will go live and students will be able to book sessions with you.</p><p>Best regards,<br/>The Education Naija & Overseas Team</p>`,
    }).catch((err) => console.error('📧 Tutor application email failed:', err.message));
    sendWhatsApp({ to: req.user.phone, message: appMsg }).catch(() => {});

    res.status(201).json({ profile, message: 'Application submitted! We will review and activate your profile within 24–48 hours.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tutors/me — tutor updates own profile
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = [
      'headline', 'bio', 'subjects', 'levels', 'teachingMode', 'country', 'state', 'city',
      'currency', 'hourlyRateNaira', 'groupRateNaira', 'trialAvailable', 'trialDurationMins', 'trialDiscountPercent',
      'languages', 'qualifications', 'yearsExperience', 'specializations', 'profilePhoto',
      'availability', 'teachingStyle', 'timezone',
      'introVideo', 'introVideoPublicId', 'verificationDocs',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const profile = await TutorProfile.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'No tutor profile found' });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tutors/:id/book — book a session / free trial
router.post('/:id/book', optionalAuth, async (req, res) => {
  try {
    const tutor = await TutorProfile.findById(req.params.id).populate('user', 'name email');
    if (!tutor || !tutor.isActive) return res.status(404).json({ message: 'Tutor not found' });

    const { name, email, phone, date, timeSlot, sessionType, subject, message } = req.body;

    // Enforce: one trial per tutor per student
    if (req.user && sessionType !== 'paid') {
      const existingTrial = await Booking.findOne({
        user:    req.user._id,
        tutorId: tutor._id,
        isTrial: true,
        status:  { $ne: 'cancelled' },
      });
      if (existingTrial) {
        return res.status(400).json({
          message: 'You have already booked a free trial with this tutor.',
          alreadyTrialled: true,
        });
      }
    }

    const booking = await Booking.create({
      user: req.user?._id,
      name,
      email,
      phone,
      service: 'tutoring-session',
      date,
      timeSlot,
      notes: `Tutor: ${tutor.displayName || tutor.user?.name} | Subject: ${subject || 'N/A'} | Type: ${sessionType || 'trial'} | Message: ${message || ''}`,
      tutorId: tutor._id,
    });

    const bookMsg = `Hi ${name},\n\nYour ${sessionType === 'trial' ? 'free trial lesson' : 'tutoring session'} with *${tutor.displayName || tutor.user?.name}* for *${subject || 'your chosen subject'}* on *${new Date(date).toDateString()}* at *${timeSlot}* has been received.\n\nWe will confirm your session shortly.\n\n— Education Naija & Overseas`;
    sendEmail({
      to: email,
      subject: `${sessionType === 'trial' ? 'Free Trial' : 'Session'} Booking Confirmed — Education Naija & Overseas`,
      html: `<p>Hi ${name},</p><p>Your <strong>${sessionType === 'trial' ? 'free trial lesson' : 'tutoring session'}</strong> with <strong>${tutor.displayName || tutor.user?.name}</strong> for <strong>${subject || 'your chosen subject'}</strong> on <strong>${new Date(date).toDateString()}</strong> at <strong>${timeSlot}</strong> has been received.</p><p>We will confirm your session shortly.</p>`,
    }).catch((err) => console.error('📧 Session booking email failed:', err.message));
    sendWhatsApp({ to: phone, message: bookMsg }).catch(() => {});

    res.status(201).json({ booking, message: 'Booking received! Check your email for confirmation.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tutors/:id/review — student reviews a tutor
router.post('/:id/review', protect, async (req, res) => {
  try {
    const { rating, comment, subject } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const review = await TutorReview.create({
      tutor: req.params.id,
      student: req.user._id,
      rating: Number(rating),
      comment,
      subject,
    });

    const allReviews = await TutorReview.find({ tutor: req.params.id });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await TutorProfile.findByIdAndUpdate(req.params.id, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: allReviews.length,
    });

    await review.populate('student', 'name');
    res.status(201).json({ review });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'You have already reviewed this tutor' });
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tutors/:id/activate — admin activates/deactivates a tutor
router.patch('/:id/activate', protect, isAdmin, async (req, res) => {
  try {
    const tutor = await TutorProfile.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive !== false, isVerified: req.body.isVerified || false },
      { new: true }
    ).populate('user', 'name email');
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    if (req.body.isActive) {
      const liveMsg = `Hi ${tutor.user.name},\n\n🎉 Great news! Your tutor profile has been reviewed and is now *live* on Education Naija & Overseas. Students can now find and book sessions with you.\n\nLog in to your dashboard to manage your profile and bookings.\n\n— Education Naija & Overseas Team`;
      sendEmail({
        to: tutor.user.email,
        subject: 'Your Tutor Profile is Now Live! — Education Naija & Overseas',
        html: `<p>Hi ${tutor.user.name},</p><p>Great news! Your tutor profile has been reviewed and is now <strong>live</strong> on Education Naija & Overseas. Students can now find and book sessions with you.</p><p>Log in to your dashboard to manage your profile and bookings.</p>`,
      }).catch((err) => console.error('📧 Tutor activation email failed:', err.message));
      const tutorUser = await User.findById(tutor.user._id).select('phone').lean().catch(() => null);
      sendWhatsApp({ to: tutorUser?.phone, message: liveMsg }).catch(() => {});
    }

    res.json({ tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tutors/my-profile — current tutor's own profile
router.get('/my-profile', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Bank Details ─────────────────────────────────────────────────────────────

// PATCH /api/tutors/me/bank-details — tutor saves payout account
router.patch('/me/bank-details', protect, async (req, res) => {
  try {
    const { accountName, accountNumber, bankName, bankCode, accountType } = req.body;
    if (!accountName || !accountNumber || !bankName) {
      return res.status(400).json({ message: 'Account name, account number and bank name are required' });
    }
    const profile = await TutorProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        bankDetails: {
          accountName:   accountName.trim(),
          accountNumber: accountNumber.trim(),
          bankName:      bankName.trim(),
          bankCode:      (bankCode || '').trim(),
          accountType:   accountType || 'savings',
          isVerified:    false, // reset on re-submit; admin must re-verify
          submittedAt:   new Date(),
        },
      },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });

    // Notify admin
    sendEmail({
      to: process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com',
      subject: `Bank Details Submitted — ${profile.displayName || req.user.name}`,
      html: `<p><strong>${profile.displayName || req.user.name}</strong> has submitted bank details for payout.</p>
<ul>
  <li><strong>Bank:</strong> ${bankName}</li>
  <li><strong>Account Name:</strong> ${accountName}</li>
  <li><strong>Account Number:</strong> ${accountNumber}</li>
  <li><strong>Type:</strong> ${accountType || 'savings'}</li>
</ul>
<p>Please verify on the <a href="${process.env.CLIENT_URL}/admin/payroll">Admin Payroll</a> page.</p>`,
    }).catch(() => {});

    res.json({ profile, message: 'Bank details saved. Admin will verify shortly.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Tutor Earnings (own) ─────────────────────────────────────────────────────

// GET /api/tutors/me/earnings — tutor sees their payroll history
router.get('/me/earnings', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id }).select('_id').lean();
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });

    const { page = 1, limit = 20, status } = req.query;
    const filter = { tutor: profile._id };
    if (status) filter.status = status;

    const [records, total] = await Promise.all([
      TutorPayroll.find(filter)
        .populate('student', 'name email')
        .populate('booking', 'date timeSlot notes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      TutorPayroll.countDocuments(filter),
    ]);

    // Aggregate totals
    const totals = await TutorPayroll.aggregate([
      { $match: { tutor: profile._id } },
      { $group: {
        _id: '$status',
        total: { $sum: '$netAmount' },
        count: { $sum: 1 },
      }},
    ]);

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit), totals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Student Review (for a payroll entry) ────────────────────────────────────

// GET /api/tutors/me/pending-reviews — student gets payroll records needing review
router.get('/me/pending-reviews', protect, async (req, res) => {
  try {
    const records = await TutorPayroll.find({
      student: req.user._id,
      'studentReview.rating': { $exists: false },
      status: { $in: ['pending_review', 'review_submitted'] },
    })
      .populate({ path: 'tutor', select: 'displayName profilePhoto' })
      .populate('booking', 'date timeSlot notes')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ records });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tutors/payroll/:payrollId/review — student submits session review
router.post('/payroll/:payrollId/review', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const record = await TutorPayroll.findById(req.params.payrollId)
      .populate({ path: 'tutor', populate: { path: 'user', select: 'name email' } });
    if (!record) return res.status(404).json({ message: 'Payroll record not found' });
    if (record.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (record.studentReview?.rating) {
      return res.status(400).json({ message: 'You have already reviewed this session' });
    }

    record.studentReview = { rating: Number(rating), comment: comment || '', submittedAt: new Date() };
    record.status = 'review_submitted';
    await record.save();

    const tutorEmail = record.tutor?.user?.email;
    const tutorName  = record.tutor?.displayName || record.tutor?.user?.name || 'Tutor';
    const adminEmail = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';
    const stars      = '★'.repeat(Number(rating)) + '☆'.repeat(5 - Number(rating));

    const reviewHtml = (recipient) => `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
  <div style="background:#15803d;padding:20px 24px">
    <h2 style="color:#fff;margin:0;font-size:18px">New Session Review</h2>
    <p style="color:#bbf7d0;margin:4px 0 0;font-size:13px">Education Naija &amp; Overseas</p>
  </div>
  <div style="padding:24px">
    <p style="color:#374151;margin:0 0 16px">A student has submitted a review for a completed session with <strong>${tutorName}</strong>.</p>
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 8px;font-size:22px;color:#f59e0b">${stars}</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#111827">${Number(rating)}/5 stars</p>
      ${comment ? `<p style="margin:8px 0 0;font-size:14px;color:#6b7280;line-height:1.6">"${comment}"</p>` : ''}
    </div>
    <p style="color:#6b7280;font-size:13px;margin:0">
      <strong>Description:</strong> ${record.description}<br/>
      <strong>Net Amount:</strong> ${record.currency} ${record.netAmount?.toLocaleString()}<br/>
      <strong>Status:</strong> Review submitted — awaiting admin approval
    </p>
    ${recipient === 'admin' ? `<p style="margin:16px 0 0"><a href="${process.env.CLIENT_URL}/admin/payroll" style="background:#15803d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px">Review &amp; Approve Payment →</a></p>` : ''}
  </div>
</div>`;

    if (tutorEmail) sendEmail({ to: tutorEmail, subject: `Student review received for your session — Education Naija & Overseas`, html: reviewHtml('tutor') }).catch(() => {});
    sendEmail({ to: adminEmail, subject: `Session Review Submitted — ${tutorName} (Action Required)`, html: reviewHtml('admin') }).catch(() => {});

    // Also update the TutorReview aggregate rating
    await TutorReview.create({
      tutor: record.tutor._id,
      student: req.user._id,
      rating: Number(rating),
      comment: comment || '',
    }).catch(() => {}); // ignore duplicate
    const allReviews = await TutorReview.find({ tutor: record.tutor._id });
    if (allReviews.length) {
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      await TutorProfile.findByIdAndUpdate(record.tutor._id, {
        rating: Math.round(avg * 10) / 10,
        reviewCount: allReviews.length,
      });
    }

    res.json({ record, message: 'Review submitted! Thank you.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Admin Payroll Management ─────────────────────────────────────────────────

// GET /api/tutors/admin/payroll — admin gets all payroll records
router.get('/admin/payroll', protect, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 25, tutorId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (tutorId) filter.tutor = tutorId;

    const [records, total, aggregates] = await Promise.all([
      TutorPayroll.find(filter)
        .populate({ path: 'tutor', select: 'displayName profilePhoto bankDetails currency', populate: { path: 'user', select: 'name email' } })
        .populate('student', 'name email')
        .populate('booking', 'date timeSlot notes')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      TutorPayroll.countDocuments(filter),
      TutorPayroll.aggregate([
        { $group: {
          _id: '$status',
          total: { $sum: '$netAmount' },
          count: { $sum: 1 },
        }},
      ]),
    ]);

    res.json({ records, total, page: Number(page), pages: Math.ceil(total / limit), aggregates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tutors/admin/payroll/:payrollId — admin approve / disburse / hold / add note / override fee
router.patch('/admin/payroll/:payrollId', protect, isAdmin, async (req, res) => {
  try {
    const { status, adminNote, disbursementRef, platformFeePercent } = req.body;
    const valid = ['pending_review', 'review_submitted', 'approved', 'disbursed', 'on_hold'];
    if (status && !valid.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const update = {};
    if (status)         update.status = status;
    if (adminNote !== undefined) update.adminNote = adminNote;
    if (disbursementRef !== undefined) update.disbursementRef = disbursementRef;
    if (status === 'approved')  update.approvedAt  = new Date();
    if (status === 'disbursed') update.disbursedAt = new Date();

    // Recalculate net if admin overrides the fee percentage
    if (platformFeePercent !== undefined) {
      const pct = Number(platformFeePercent);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ message: 'platformFeePercent must be 0–100' });
      }
      const existing = await TutorPayroll.findById(req.params.payrollId).select('grossAmount').lean();
      if (existing) {
        update.platformFeePercent = pct;
        update.platformFee = Math.round(existing.grossAmount * pct / 100);
        update.netAmount   = existing.grossAmount - update.platformFee;
      }
    }

    const record = await TutorPayroll.findByIdAndUpdate(req.params.payrollId, update, { new: true })
      .populate({ path: 'tutor', select: 'displayName', populate: { path: 'user', select: 'name email' } })
      .populate('student', 'name email');
    if (!record) return res.status(404).json({ message: 'Record not found' });

    // Email tutor when approved or disbursed
    const tutorEmail = record.tutor?.user?.email;
    const tutorName  = record.tutor?.displayName || record.tutor?.user?.name || 'Tutor';
    if (tutorEmail && status === 'approved') {
      sendEmail({
        to: tutorEmail,
        subject: 'Payment Approved — Education Naija & Overseas',
        html: `<p>Hi ${tutorName},</p><p>Your payment of <strong>${record.currency} ${record.netAmount?.toLocaleString()}</strong> for session "${record.description}" has been <strong>approved</strong> and will be disbursed to your registered bank account shortly.</p>${adminNote ? `<p><strong>Note from admin:</strong> ${adminNote}</p>` : ''}<p>— Education Naija &amp; Overseas Team</p>`,
      }).catch(() => {});
    }
    if (tutorEmail && status === 'disbursed') {
      sendEmail({
        to: tutorEmail,
        subject: 'Payment Disbursed — Education Naija & Overseas',
        html: `<p>Hi ${tutorName},</p><p>Your payment of <strong>${record.currency} ${record.netAmount?.toLocaleString()}</strong> for session "${record.description}" has been <strong>disbursed</strong> to your registered bank account.${disbursementRef ? ` Reference: <strong>${disbursementRef}</strong>` : ''}</p><p>— Education Naija &amp; Overseas Team</p>`,
      }).catch(() => {});
    }

    res.json({ record, message: 'Payroll record updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/tutors/admin/bank-details/:profileId/verify — admin verifies tutor bank details
router.patch('/admin/bank-details/:profileId/verify', protect, isAdmin, async (req, res) => {
  try {
    const profile = await TutorProfile.findByIdAndUpdate(
      req.params.profileId,
      { 'bankDetails.isVerified': req.body.verified !== false },
      { new: true }
    ).populate('user', 'name email');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (req.body.verified !== false && profile.user?.email) {
      sendEmail({
        to: profile.user.email,
        subject: 'Bank Details Verified — Education Naija & Overseas',
        html: `<p>Hi ${profile.displayName || profile.user.name},</p><p>Your bank account details have been <strong>verified</strong>. Approved payments will now be disbursed to your registered account.</p><p>— Education Naija &amp; Overseas Team</p>`,
      }).catch(() => {});
    }

    res.json({ profile, message: 'Bank details verification updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
