const cron      = require('node-cron');
const Booking   = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

/* ── Email template ───────────────────────────────────────────────────────── */
function reminderHtml({ recipientName, label, dateStr, timeSlot, callLink, role }) {
  const emoji   = label === '24h' ? '⏰' : label === '1h' ? '🚀' : '⚡';
  const heading = label === '24h' ? 'Your Class is Tomorrow'
                : label === '1h'  ? 'Your Class Starts in 1 Hour'
                :                   'Class Starting in 10 Minutes!';
  const subtext = label === '24h' ? 'Get ready — your tutoring session is tomorrow.'
                : label === '1h'  ? "Log in and get ready — your session starts very soon."
                :                   "Open your link now and join the class!";
  const btnText = role === 'tutor' ? 'Start Class →' : 'Join Class →';

  return `
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px;">
  <tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

      <tr><td style="background:#14532d;padding:28px 40px;text-align:center;">
        <p style="margin:0;font-size:20px;font-weight:800;color:#fff;">Education Naija &amp; Overseas</p>
        <p style="margin:4px 0 0;font-size:11px;color:#86efac;letter-spacing:.05em;">TUTORING PLATFORM</p>
      </td></tr>

      <tr><td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #f0fdf4;">
        <div style="width:56px;height:56px;background:#dcfce7;border-radius:50%;margin:0 auto 14px;font-size:28px;line-height:56px;">${emoji}</div>
        <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:#111827;">${heading}</h1>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">Hi <strong>${recipientName}</strong>, ${subtext}</p>
      </td></tr>

      <tr><td style="padding:24px 40px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;">Session Details</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:600;width:38%;">Date</td>
            <td style="padding:10px 16px;background:#fff;border-bottom:1px solid #e5e7eb;font-size:13px;color:#111827;font-weight:600;">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:10px 16px;background:#f9fafb;font-size:13px;color:#6b7280;font-weight:600;">Time</td>
            <td style="padding:10px 16px;background:#fff;font-size:13px;color:#111827;font-weight:600;">${timeSlot}</td>
          </tr>
        </table>
      </td></tr>

      ${callLink ? `
      <tr><td style="padding:0 40px 32px;text-align:center;">
        <a href="${callLink}" style="display:inline-block;background:#16a34a;color:#fff;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;text-decoration:none;box-shadow:0 4px 12px rgba(22,163,74,.3);">
          ${btnText}
        </a>
        <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">
          Or copy this link:<br><a href="${callLink}" style="color:#16a34a;word-break:break-all;font-size:11px;">${callLink}</a>
        </p>
      </td></tr>` : `
      <tr><td style="padding:0 40px 32px;text-align:center;">
        <div style="background:#fef9c3;border:1px solid #fde047;border-radius:10px;padding:14px 20px;font-size:13px;color:#854d0e;">
          ⚠️ No meeting link has been set yet. Please contact your tutor or check your dashboard.
        </div>
      </td></tr>`}

      <tr><td style="padding:16px 40px 24px;text-align:center;border-top:1px solid #f3f4f6;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">— Education Naija &amp; Overseas Team<br>
        <a href="https://naijaandoverseas.com" style="color:#16a34a;text-decoration:none;">naijaandoverseas.com</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

/* ── Send to both student and tutor ──────────────────────────────────────── */
async function notifyBoth(b, label) {
  const dateStr = new Date(b.date).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const subjects = {
    '24h': `⏰ Reminder: Class Tomorrow — ${dateStr}`,
    '1h':  `🚀 Starting in 1 Hour — ${dateStr} at ${b.timeSlot}`,
    '10m': `⚡ Class in 10 Minutes! — ${b.timeSlot}`,
  };

  const subject = subjects[label];

  // Student
  await sendEmail({
    to: b.email,
    subject,
    html: reminderHtml({ recipientName: b.name, label, dateStr, timeSlot: b.timeSlot, callLink: b.callLink, role: 'student' }),
  }).catch(err => console.error(`[reminder ${label}] student email error:`, err.message));

  sendWhatsApp({
    to: b.phone,
    message: label === '24h'
      ? `Hi ${b.name},\n\n⏰ Reminder: Your tutoring class is *tomorrow, ${dateStr}* at *${b.timeSlot}*.${b.callLink ? `\n\n🔗 Class link:\n${b.callLink}` : '\n\n⚠️ No link set yet — please check your dashboard.'}\n\n— Education Naija & Overseas`
      : label === '1h'
      ? `Hi ${b.name},\n\n🚀 Your class starts in *1 hour* — ${b.timeSlot}.${b.callLink ? `\n\n🔗 Join now:\n${b.callLink}` : ''}\n\n— Education Naija & Overseas`
      : `Hi ${b.name},\n\n⚡ *Class starting in 10 minutes!* — ${b.timeSlot}.${b.callLink ? `\n\n🔗 Join now:\n${b.callLink}` : ''}\n\n— Education Naija & Overseas`,
  }).catch(() => {});

  // Tutor
  const tutor = b.tutorId;
  if (tutor?.user?.email) {
    await sendEmail({
      to: tutor.user.email,
      subject,
      html: reminderHtml({ recipientName: tutor.user.name || 'Tutor', label, dateStr, timeSlot: b.timeSlot, callLink: b.callLink, role: 'tutor' }),
    }).catch(err => console.error(`[reminder ${label}] tutor email error:`, err.message));

    if (tutor.user.phone) {
      sendWhatsApp({
        to: tutor.user.phone,
        message: label === '10m'
          ? `Hi ${tutor.user.name || 'Tutor'},\n\n⚡ Your student's class starts in *10 minutes* — ${b.timeSlot}.${b.callLink ? `\n\n🔗 ${b.callLink}` : ''}\n\n— Education Naija & Overseas`
          : label === '1h'
          ? `Hi ${tutor.user.name || 'Tutor'},\n\n🚀 Class in *1 hour* — ${b.timeSlot}.\n\n— Education Naija & Overseas`
          : `Hi ${tutor.user.name || 'Tutor'},\n\n⏰ Reminder: You have a tutoring class *tomorrow, ${dateStr}* at *${b.timeSlot}*.\n\n— Education Naija & Overseas`,
      }).catch(() => {});
    }
  }
}

/* ── Main cron ───────────────────────────────────────────────────────────── */
function initReminders() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    const now = new Date();

    // Time windows (with ±2.5 min tolerance so no reminder is missed between ticks)
    const windows = {
      '24h': { low: new Date(now.getTime() + (24 * 60 - 2.5) * 60000), high: new Date(now.getTime() + (24 * 60 + 2.5) * 60000), field: 'reminderSent24h' },
      '1h':  { low: new Date(now.getTime() + (60 - 2.5) * 60000),      high: new Date(now.getTime() + (60 + 2.5) * 60000),      field: 'reminderSent1h'  },
      '10m': { low: new Date(now.getTime() + (10 - 2.5) * 60000),      high: new Date(now.getTime() + (10 + 2.5) * 60000),      field: 'reminderSent10m' },
    };

    try {
      for (const [label, { low, high, field }] of Object.entries(windows)) {
        const bookings = await Booking.find({
          service: 'tutoring-session',
          status:  'confirmed',
          date:    { $gte: low, $lte: high },
          [field]: { $ne: true },
        }).populate({
          path: 'tutorId',
          select: 'user',
          populate: { path: 'user', select: 'name email phone' },
        });

        for (const b of bookings) {
          await notifyBoth(b, label);
          await Booking.findByIdAndUpdate(b._id, { [field]: true }).catch(() => {});
          console.log(`[reminder ${label}] sent → student:${b.email} tutor:${b.tutorId?.user?.email || '—'}`);
        }
      }
    } catch (err) {
      console.error('[reminders cron]', err.message);
    }
  });

  console.log('✅ Reminder cron initialised (every 5 min — 24h / 1h / 10min to student + tutor)');
}

module.exports = { initReminders };
