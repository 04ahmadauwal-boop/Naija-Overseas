const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');
const { protect } = require('../middleware/auth');

const CLIENT_URL = process.env.CLIENT_URL || 'https://www.visiteno.com';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, goal, phone, country } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const allowedRoles = ['student', 'parent', 'school-owner', 'tutor'];
    const userRole = allowedRoles.includes(role) ? role : 'student';
    const allowedGoals = ['tutoring', 'study-abroad', 'both'];
    const userGoal = allowedGoals.includes(goal) ? goal : 'both';

    // Generate verification token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.create({
      name, email, password, role: userRole, goal: userGoal, phone, country,
      isVerified: false,
      emailVerificationToken:   hashedToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;

    sendEmail({
      to: user.email,
      subject: 'Verify Your Email — Education Naija & Overseas',
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
            <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;font-size:26px;line-height:56px;">✅</div>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">Verify your email</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              Hi <strong>${user.name}</strong>, thanks for joining Education Naija & Overseas!<br/>
              Click the button below to verify your email address and activate your account.<br/>
              This link expires in <strong>24 hours</strong>.
            </p>
            <a href="${verifyUrl}"
               style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;
                      font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">
              Verify My Email &rarr;
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${verifyUrl}" style="color:#16a34a;word-break:break-all;">${verifyUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch((err) => console.error('📧 Verification email failed:', err.message));

    res.status(201).json({ message: 'Account created! Please check your email to verify your account before logging in.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/verify-email/:token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken:   hashed,
      emailVerificationExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Verification link is invalid or has expired.' });

    user.isVerified = true;
    user.emailVerificationToken   = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, goal: user.goal },
      message: 'Email verified successfully! Welcome to Education Naija & Overseas.',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account with that email' });
    if (user.isVerified) return res.status(400).json({ message: 'This account is already verified. Please log in.' });

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken   = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${rawToken}`;

    res.json({ message: 'Verification email resent. Please check your inbox.' });

    sendEmail({
      to: user.email,
      subject: 'Verify Your Email — Education Naija & Overseas',
      html: `<p>Hi ${user.name},</p><p>Here is your new verification link (valid 24 hours):</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    }).catch((err) => console.error('📧 Resend verification failed:', err.message));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        unverified: true,
        email: user.email,
      });
    }
    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, goal: user.goal },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;

    const emailHtml = `
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
            <div style="width:52px;height:52px;background:#dcfce7;border-radius:50%;margin:0 auto 16px;font-size:24px;line-height:52px;">🔐</div>
            <h1 style="margin:0 0 8px;font-size:20px;font-weight:800;color:#111827;">Reset Your Password</h1>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6;">
              Hi <strong>${user.name}</strong>, we received a request to reset the password for your account.
              Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
            </p>
            <a href="${resetUrl}"
               style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;
                      font-size:15px;padding:14px 36px;border-radius:10px;text-decoration:none;">
              Reset My Password &rarr;
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;">
              If you didn't request this, you can safely ignore this email — your password will not change.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 40px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color:#16a34a;word-break:break-all;">${resetUrl}</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Respond immediately — don't make the user wait for SMTP
    res.json({ message: 'Reset link sent to your email' });

    // Send email in the background after responding
    sendEmail({
      to: user.email,
      subject: 'Reset Your Password — Education Naija & Overseas',
      html: emailHtml,
    }).catch((err) => console.error('📧 Forgot-password email failed:', err.message));

    sendWhatsApp({
      to: user.phone,
      message: `Hi ${user.name},\n\nWe received a request to reset your Education Naija & Overseas password.\n\nClick the link below to reset it (valid for 1 hour):\n${process.env.CLIENT_URL}/reset-password/${token}\n\nIf you did not request this, please ignore this message.\n\n— Education Naija & Overseas Team`,
    }).catch(() => {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/set-password/:token  — used after auto-account creation from consultation booking
router.post('/set-password/:token', async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'This link is invalid or has expired. Please contact support.' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;
    await user.save();

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, goal: user.goal },
      message: 'Password set! Welcome to Education Naija & Overseas.',
    });

    // Send WhatsApp welcome after responding
    if (user.phone) {
      sendWhatsApp({
        to: user.phone,
        message: `Hi ${user.name}! 🎉\n\nYour Education Naija & Overseas account is now active.\n\nYou can log in anytime at:\n${CLIENT_URL}/login\n\nOur team will be in touch about your consultation soon.\n\n— Education Naija & Overseas Team`,
      }).catch(() => {});
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
