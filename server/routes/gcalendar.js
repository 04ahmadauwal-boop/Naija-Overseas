const express = require('express');
const router  = express.Router();
const { google } = require('googleapis');
const User   = require('../models/User');
const { protect } = require('../middleware/auth');

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/gcalendar/callback'
  );
}

// GET /api/gcalendar/auth — return the Google consent-page URL
router.get('/auth', protect, (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google Calendar is not configured on this server.' });
  }
  const client = getOAuth2Client();
  const state  = Buffer.from(req.user._id.toString()).toString('base64');
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt:      'consent',
    scope:       ['https://www.googleapis.com/auth/calendar.events'],
    state,
  });
  res.json({ url });
});

// GET /api/gcalendar/callback — Google redirects here after consent
router.get('/callback', async (req, res) => {
  const frontendBase = process.env.CLIENT_URL || 'http://localhost:5173';
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.redirect(`${frontendBase}/schedule?gcal=error`);

    const userId = Buffer.from(state, 'base64').toString();
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);

    const update = { 'googleTokens.accessToken': tokens.access_token };
    if (tokens.refresh_token) update['googleTokens.refreshToken'] = tokens.refresh_token;
    if (tokens.expiry_date)   update['googleTokens.expiresAt']    = new Date(tokens.expiry_date);

    await User.findByIdAndUpdate(userId, { $set: update });

    res.redirect(`${frontendBase}/schedule?gcal=connected`);
  } catch {
    res.redirect(`${frontendBase}/schedule?gcal=error`);
  }
});

// GET /api/gcalendar/status — is the current user connected?
router.get('/status', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('googleTokens');
  res.json({ connected: !!(user?.googleTokens?.accessToken) });
});

// DELETE /api/gcalendar/disconnect — remove stored tokens
router.delete('/disconnect', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { googleTokens: 1 } });
  res.json({ message: 'Google Calendar disconnected' });
});

/**
 * Helper used by schedule.js to create a calendar event.
 * @param {object} user  - Mongoose User doc with googleTokens
 * @param {object} opts  - { summary, description, startISO, endISO, timezone, attendees }
 * @returns {string|null} Google event ID, or null on failure
 */
async function createCalendarEvent(user, { summary, description, startISO, endISO, timezone, attendees = [] }) {
  const client = getOAuth2Client();
  client.setCredentials({
    access_token:  user.googleTokens.accessToken,
    refresh_token: user.googleTokens.refreshToken,
  });

  // Persist a refreshed access token automatically
  client.on('tokens', async (tokens) => {
    const upd = {};
    if (tokens.access_token) upd['googleTokens.accessToken']  = tokens.access_token;
    if (tokens.expiry_date)  upd['googleTokens.expiresAt']    = new Date(tokens.expiry_date);
    if (Object.keys(upd).length) await User.findByIdAndUpdate(user._id, { $set: upd }).catch(() => {});
  });

  const calendar = google.calendar({ version: 'v3', auth: client });
  const event = await calendar.events.insert({
    calendarId:  'primary',
    sendUpdates: 'all',
    resource: {
      summary,
      description,
      start: { dateTime: startISO, timeZone: timezone },
      end:   { dateTime: endISO,   timeZone: timezone },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email',  minutes: 24 * 60 },
          { method: 'popup',  minutes: 30 },
        ],
      },
    },
  });

  return event.data.id || null;
}

module.exports = router;
module.exports.createCalendarEvent = createCalendarEvent;
