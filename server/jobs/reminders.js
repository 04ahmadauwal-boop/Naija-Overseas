const cron     = require('node-cron');
const Booking  = require('../models/Booking');
const sendEmail = require('../utils/sendEmail');
const sendWhatsApp = require('../utils/sendWhatsApp');

function initReminders() {
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    const now = new Date();

    // 24-hour window: sessions 23.5 h – 24.5 h from now
    const h24Low  = new Date(now.getTime() + 23.5 * 3600000);
    const h24High = new Date(now.getTime() + 24.5 * 3600000);

    // 1-hour window: sessions 45 min – 75 min from now
    const h1Low  = new Date(now.getTime() + 45 * 60000);
    const h1High = new Date(now.getTime() + 75 * 60000);

    try {
      // ── 24-hour reminders ────────────────────────────────────────────────
      const b24 = await Booking.find({
        service: 'tutoring-session',
        status:  'confirmed',
        date:    { $gte: h24Low, $lte: h24High },
        reminderSent24h: { $ne: true },
      });

      for (const b of b24) {
        await sendEmail({
          to:      b.email,
          subject: 'Reminder: Tutoring Session Tomorrow — Education Naija & Overseas',
          html: `<p>Hi ${b.name},</p>
<p>This is a friendly reminder that your tutoring session is <strong>tomorrow, ${new Date(b.date).toDateString()}</strong> at <strong>${b.timeSlot}</strong>.</p>
${b.callLink ? `<p><a href="${b.callLink}">Join your class here</a></p>` : ''}
<p>— Education Naija &amp; Overseas Team</p>`,
        }).catch(() => {});
        sendWhatsApp({
          to: b.phone,
          message: `Hi ${b.name},\n\n⏰ Reminder: Your tutoring session is *tomorrow, ${new Date(b.date).toDateString()}* at *${b.timeSlot}*.${b.callLink ? `\n\n🔗 Join your class here:\n${b.callLink}` : ''}\n\n— Education Naija & Overseas Team`,
        }).catch(() => {});
        await Booking.findByIdAndUpdate(b._id, { reminderSent24h: true }).catch(() => {});
      }

      // ── 1-hour reminders ─────────────────────────────────────────────────
      const b1h = await Booking.find({
        service: 'tutoring-session',
        status:  'confirmed',
        date:    { $gte: h1Low, $lte: h1High },
        reminderSent1h: { $ne: true },
      });

      for (const b of b1h) {
        await sendEmail({
          to:      b.email,
          subject: 'Starting Soon: Your Tutoring Session — Education Naija & Overseas',
          html: `<p>Hi ${b.name},</p>
<p>Your tutoring session starts in about <strong>1 hour</strong> (${new Date(b.date).toDateString()} at ${b.timeSlot}).</p>
${b.callLink ? `<p><strong><a href="${b.callLink}">Join your class now</a></strong></p>` : ''}
<p>— Education Naija &amp; Overseas Team</p>`,
        }).catch(() => {});
        sendWhatsApp({
          to: b.phone,
          message: `Hi ${b.name},\n\n🚀 Your tutoring session starts in *1 hour* (${new Date(b.date).toDateString()} at ${b.timeSlot}).${b.callLink ? `\n\n🔗 Join now:\n${b.callLink}` : ''}\n\n— Education Naija & Overseas Team`,
        }).catch(() => {});
        await Booking.findByIdAndUpdate(b._id, { reminderSent1h: true }).catch(() => {});
      }
    } catch (err) {
      console.error('[reminders cron]', err.message);
    }
  });

  console.log('✅ Reminder cron initialised (every 30 min)');
}

module.exports = { initReminders };
