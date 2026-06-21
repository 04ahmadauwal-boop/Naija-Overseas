const express = require('express');
const router  = express.Router();
const https   = require('https');
const School  = require('../models/School');
const User    = require('../models/User');
const AdmissionApplication = require('../models/AdmissionApplication');
const { protect } = require('../middleware/auth');
const sendEmail   = require('../utils/sendEmail');

// ── Email templates ────────────────────────────────────────────────────────────

function parentConfirmEmail(app, schoolName) {
  const dob = app.childDOB ? new Date(app.childDOB).toLocaleDateString('en-NG', { day:'numeric',month:'long',year:'numeric' }) : '—';
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
    <div style="background:linear-gradient(135deg,#0d2918,#166534);padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:22px">Application Received ✓</h1>
      <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px">Education Naija & Overseas</p>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none">
      <p style="font-size:15px">Dear <strong>${app.parentName}</strong>,</p>
      <p style="font-size:14px;color:#4b5563">Your admission application for <strong>${app.childFirstName} ${app.childLastName}</strong> to <strong>${schoolName}</strong> has been received and is under review.</p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:18px;margin:20px 0">
        <h3 style="margin:0 0 14px;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Application Details</h3>
        ${row('Reference',     app.paymentRef)}
        ${row('School',        schoolName)}
        ${row('Class',         app.className)}
        ${row('Session',       app.session || '—')}
        ${row('Child\'s Name', `${app.childFirstName} ${app.childLastName}`)}
        ${row('Date of Birth', dob)}
        ${row('Gender',        app.childGender)}
        ${app.childStateOfOrigin ? row('State of Origin', app.childStateOfOrigin) : ''}
        ${app.childBloodGroup ? row('Blood Group', app.childBloodGroup) : ''}
        ${row('Amount Paid',   `₦${app.amount.toLocaleString()}`)}
        ${row('Status',        'Pending Review')}
      </div>

      <p style="font-size:14px;color:#4b5563">You can track your application status from your <strong>Parent Dashboard</strong> at any time.</p>
      <p style="font-size:14px;color:#4b5563">The school will review your application and update the status. You will be notified of any changes.</p>

      <div style="background:#ecfdf5;border:1px solid #6ee7b7;border-radius:8px;padding:14px;margin-top:20px">
        <p style="margin:0;font-size:13px;color:#065f46"><strong>What happens next?</strong><br/>The admissions team at ${schoolName} will review your application within their stated timeframe. Check your dashboard for status updates.</p>
      </div>
    </div>
    <div style="background:#f3f4f6;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:12px;color:#9ca3af">Education Naija & Overseas · naijaandoverseas.com</p>
    </div>
  </div>`;
}

function schoolNotifyEmail(app, schoolName) {
  const dob = app.childDOB ? new Date(app.childDOB).toLocaleDateString('en-NG', { day:'numeric',month:'long',year:'numeric' }) : '—';
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
    <div style="background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:28px 32px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:22px">New Admission Application</h1>
      <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px">${schoolName}</p>
    </div>
    <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none">
      <p style="font-size:15px">A new admission application has been submitted.</p>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px;margin:18px 0">
        <h3 style="margin:0 0 12px;font-size:13px;color:#1e40af;text-transform:uppercase;letter-spacing:0.05em">Child Information</h3>
        ${row('Name',          `${app.childFirstName} ${app.childLastName}`)}
        ${row('Class Applied', app.className)}
        ${row('Session',       app.session || '—')}
        ${row('Date of Birth', dob)}
        ${row('Gender',        app.childGender)}
        ${app.childNationality ? row('Nationality', app.childNationality) : ''}
        ${app.childStateOfOrigin ? row('State of Origin', app.childStateOfOrigin) : ''}
        ${app.childBloodGroup ? row('Blood Group', app.childBloodGroup) : ''}
        ${app.childReligion ? row('Religion', app.childReligion) : ''}
        ${app.childMedicalConditions ? row('Medical Notes', app.childMedicalConditions) : ''}
        ${app.childPreviousSchool ? row('Previous School', app.childPreviousSchool) : ''}
      </div>

      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:18px;margin:18px 0">
        <h3 style="margin:0 0 12px;font-size:13px;color:#166534;text-transform:uppercase;letter-spacing:0.05em">Parent / Guardian</h3>
        ${row('Name',         app.parentName)}
        ${row('Relationship', app.parentRelationship)}
        ${row('Phone',        app.parentPhone)}
        ${app.parentAltPhone ? row('Alt Phone', app.parentAltPhone) : ''}
        ${row('Email',        app.parentEmail)}
        ${app.parentAddress ? row('Address', app.parentAddress) : ''}
        ${app.parentOccupation ? row('Occupation', app.parentOccupation) : ''}
      </div>

      ${(app.emergencyContactName || app.emergencyContactPhone) ? `
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:18px;margin:18px 0">
        <h3 style="margin:0 0 12px;font-size:13px;color:#c2410c;text-transform:uppercase;letter-spacing:0.05em">Emergency Contact</h3>
        ${app.emergencyContactName ? row('Name', app.emergencyContactName) : ''}
        ${app.emergencyContactPhone ? row('Phone', app.emergencyContactPhone) : ''}
        ${app.emergencyContactRelationship ? row('Relationship', app.emergencyContactRelationship) : ''}
      </div>` : ''}

      <div style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px;margin:18px 0">
        <p style="margin:0;font-size:13px;color:#92400e"><strong>Payment:</strong> ₦${app.amount.toLocaleString()} confirmed · Ref: ${app.paymentRef}</p>
      </div>

      <p style="font-size:14px;color:#4b5563">Log in to your <strong>School Dashboard</strong> to review this application and update its status.</p>
    </div>
    <div style="background:#f3f4f6;padding:16px 32px;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:12px;color:#9ca3af">Education Naija & Overseas · naijaandoverseas.com</p>
    </div>
  </div>`;
}

function adminNotifyEmail(app, schoolName) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
    <div style="background:#1f2937;padding:20px 28px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:18px">[Admin] New Admission Application</h1>
    </div>
    <div style="background:#fff;padding:24px 28px;border:1px solid #e5e7eb;border-top:none">
      ${row('School',   schoolName)}
      ${row('Student',  `${app.childFirstName} ${app.childLastName}`)}
      ${row('Class',    app.className)}
      ${row('Parent',   `${app.parentName} (${app.parentPhone})`)}
      ${row('Email',    app.parentEmail)}
      ${row('Amount',   `₦${app.amount.toLocaleString()}`)}
      ${row('Ref',      app.paymentRef)}
      ${row('Time',     new Date().toLocaleString('en-NG'))}
    </div>
    <div style="background:#f3f4f6;padding:12px 28px;border-radius:0 0 12px 12px;text-align:center">
      <p style="margin:0;font-size:11px;color:#9ca3af">Education Naija & Overseas Admin Alert</p>
    </div>
  </div>`;
}

function row(label, value) {
  if (!value) return '';
  return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;font-size:13px">
    <span style="color:#6b7280;white-space:nowrap;min-width:130px">${label}</span>
    <span style="font-weight:600;color:#111827;text-align:right;word-break:break-word">${value}</span>
  </div>`;
}

// ── GET /api/admission/:schoolId/settings — public ─────────────────────────────
router.get('/:schoolId/settings', async (req, res) => {
  try {
    const school = await School.findById(req.params.schoolId).select('name admission');
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json({ admission: school.admission || {}, schoolName: school.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admission/:schoolId/settings — school owner ─────────────────────
router.patch('/:schoolId/settings', protect, async (req, res) => {
  try {
    const school = await School.findOne({ _id: req.params.schoolId, owner: req.user._id });
    if (!school) return res.status(403).json({ message: 'Not authorised' });

    const { isOpen, type, session, generalPrice, classes, description, deadline } = req.body;
    school.admission = {
      isOpen:       isOpen ?? school.admission?.isOpen ?? false,
      type:         type || school.admission?.type || 'general',
      session:      session ?? school.admission?.session ?? '',
      generalPrice: generalPrice ?? school.admission?.generalPrice ?? 0,
      classes:      classes ?? school.admission?.classes ?? [],
      description:  description ?? school.admission?.description ?? '',
      deadline:     deadline ?? school.admission?.deadline,
    };
    await school.save();
    res.json({ admission: school.admission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/admission/:schoolId/apply — parent submits application ───────────
router.post('/:schoolId/apply', protect, async (req, res) => {
  try {
    const school = await School.findById(req.params.schoolId).populate('owner', 'email name');
    if (!school) return res.status(404).json({ message: 'School not found' });
    if (!school.admission?.isOpen) return res.status(400).json({ message: 'Admission is currently closed' });

    const {
      childFirstName, childLastName, childDOB, childGender,
      childNationality, childStateOfOrigin, childBloodGroup, childReligion,
      childMedicalConditions, childPreviousSchool,
      className,
      parentName, parentPhone, parentAltPhone, parentEmail, parentRelationship,
      parentAddress, parentOccupation,
      emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
      paymentRef,
    } = req.body;

    // Verify payment with Paystack
    const verifyResult = await verifyPaystack(paymentRef);
    if (!verifyResult.verified) return res.status(400).json({ message: 'Payment verification failed' });

    const amount = verifyResult.data.amount / 100;

    // For class-based admission, validate the class is actually open
    if (school.admission.type === 'class-based') {
      const cls = school.admission.classes.find(c => c.name === className);
      if (!cls || !cls.isAvailable) {
        return res.status(400).json({ message: `Admission for ${className} is currently closed` });
      }
    }

    const existing = await AdmissionApplication.findOne({
      school: school._id,
      parent: req.user._id,
      session: school.admission.session,
      className,
      status: { $nin: ['rejected'] },
    });
    if (existing) return res.status(400).json({ message: 'You already have an active application for this class and session' });

    const application = await AdmissionApplication.create({
      school: school._id,
      parent: req.user._id,
      childFirstName, childLastName, childDOB, childGender,
      childNationality: childNationality || 'Nigerian',
      childStateOfOrigin: childStateOfOrigin || '',
      childBloodGroup: childBloodGroup || '',
      childReligion: childReligion || '',
      childMedicalConditions: childMedicalConditions || '',
      childPreviousSchool: childPreviousSchool || '',
      className,
      parentName, parentPhone, parentAltPhone: parentAltPhone || '',
      parentEmail, parentRelationship,
      parentAddress: parentAddress || '',
      parentOccupation: parentOccupation || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactPhone: emergencyContactPhone || '',
      emergencyContactRelationship: emergencyContactRelationship || '',
      amount, paymentRef,
      paymentStatus: 'paid',
      session: school.admission.session || '',
    });

    // ── Send emails (fire-and-forget, don't block response) ───────────────────
    const schoolName = school.name;
    const appObj = application.toObject();

    // 1. Parent confirmation
    sendEmail({
      to: parentEmail,
      subject: `Application Received – ${schoolName} · ${className}`,
      html: parentConfirmEmail(appObj, schoolName),
    }).catch(e => console.error('Parent email failed:', e.message));

    // 2. School owner notification
    const ownerEmail = school.contact?.email || school.owner?.email;
    if (ownerEmail) {
      sendEmail({
        to: ownerEmail,
        subject: `New Admission Application — ${childFirstName} ${childLastName} (${className})`,
        html: schoolNotifyEmail(appObj, schoolName),
      }).catch(e => console.error('School email failed:', e.message));
    }

    // 3. Admin notification
    const adminEmail = process.env.ADMIN_EMAIL || 'softsavvynaija@gmail.com';
    sendEmail({
      to: adminEmail,
      subject: `[Admission] ${childFirstName} ${childLastName} → ${schoolName}`,
      html: adminNotifyEmail(appObj, schoolName),
    }).catch(e => console.error('Admin email failed:', e.message));

    res.status(201).json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admission/my — parent: own applications ──────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const applications = await AdmissionApplication.find({ parent: req.user._id })
      .populate('school', 'name state city images slug')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admission/school/:schoolId — school owner: view applications ──────
router.get('/school/:schoolId', protect, async (req, res) => {
  try {
    const school = await School.findOne({ _id: req.params.schoolId, owner: req.user._id });
    if (!school) return res.status(403).json({ message: 'Not authorised' });

    const applications = await AdmissionApplication.find({ school: school._id })
      .populate('parent', 'name email')
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admission/admin/all — admin: view all applications ────────────────
router.get('/admin/all', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    const { schoolId, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (schoolId) filter.school = schoolId;
    if (status)   filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [applications, total] = await Promise.all([
      AdmissionApplication.find(filter)
        .populate('school', 'name state city')
        .populate('parent', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      AdmissionApplication.countDocuments(filter),
    ]);
    res.json({ applications, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admission/:applicationId/status — school owner / admin ──────────
router.patch('/:applicationId/status', protect, async (req, res) => {
  try {
    const application = await AdmissionApplication.findById(req.params.applicationId)
      .populate('school', 'owner name contact')
      .populate('parent', 'name email');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isOwner = String(application.school.owner) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Not authorised' });

    const { status, schoolNote } = req.body;
    if (!['pending', 'under_review', 'admitted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const prevStatus = application.status;
    application.status = status;
    if (schoolNote !== undefined) application.schoolNote = schoolNote;
    await application.save();

    // Email parent on status change (only when status actually changes)
    if (prevStatus !== status) {
      const statusMessages = {
        under_review: 'Your application is now under review by the school.',
        admitted: '🎉 Congratulations! Your child has been admitted!',
        rejected: 'Unfortunately, your application was not successful at this time.',
      };
      const msg = statusMessages[status];
      if (msg) {
        sendEmail({
          to: application.parentEmail,
          subject: `Application Update – ${application.school.name}`,
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:28px;background:#fff;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:${status === 'admitted' ? '#065f46' : status === 'rejected' ? '#991b1b' : '#1e3a8a'};margin-top:0">Admission Status Update</h2>
            <p>Dear <strong>${application.parentName}</strong>,</p>
            <p>${msg}</p>
            <p><strong>School:</strong> ${application.school.name}</p>
            <p><strong>Student:</strong> ${application.childFirstName} ${application.childLastName}</p>
            <p><strong>Class:</strong> ${application.className}</p>
            ${application.schoolNote ? `<div style="background:#f9fafb;border-left:4px solid #6b7280;padding:12px;margin-top:16px;border-radius:4px"><p style="margin:0;font-size:14px;color:#374151"><strong>Note from school:</strong><br/>${application.schoolNote}</p></div>` : ''}
            <p style="margin-top:20px;font-size:13px;color:#6b7280">Log in to your dashboard for full details.</p>
          </div>`,
        }).catch(e => console.error('Status email failed:', e.message));
      }
    }

    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/admission/:applicationId — school owner / admin / parent ──────────
router.get('/:applicationId', protect, async (req, res) => {
  try {
    const application = await AdmissionApplication.findById(req.params.applicationId)
      .populate('school', 'name state city images slug contact owner')
      .populate('parent', 'name email');
    if (!application) return res.status(404).json({ message: 'Application not found' });

    const isOwner  = String(application.school?.owner) === String(req.user._id);
    const isAdmin  = req.user.role === 'admin';
    const isParent = String(application.parent?._id) === String(req.user._id);
    if (!isOwner && !isAdmin && !isParent) return res.status(403).json({ message: 'Not authorised' });

    res.json({ application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Paystack verification helper ───────────────────────────────────────────────
function verifyPaystack(reference) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ verified: parsed.data?.status === 'success', data: parsed.data });
        } catch {
          resolve({ verified: false });
        }
      });
    });
    req.on('error', () => resolve({ verified: false }));
    req.end();
  });
}

module.exports = router;
