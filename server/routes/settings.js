const express = require('express');
const router  = express.Router();
const PlatformSettings = require('../models/PlatformSettings');
const { protect }  = require('../middleware/auth');
const isAdmin      = require('../middleware/isAdmin');

// GET /api/settings/platform — public read (frontend needs it to show fee info)
router.get('/platform', async (req, res) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { platformFeePercent: 15 } },
      { upsert: true, new: true }
    );
    res.json({ platformFeePercent: settings.platformFeePercent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/settings/platform — admin only
router.patch('/platform', protect, isAdmin, async (req, res) => {
  try {
    const { platformFeePercent } = req.body;
    if (platformFeePercent === undefined) {
      return res.status(400).json({ message: 'platformFeePercent is required' });
    }
    const pct = Number(platformFeePercent);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      return res.status(400).json({ message: 'platformFeePercent must be between 0 and 100' });
    }

    const settings = await PlatformSettings.findOneAndUpdate(
      { key: 'global' },
      { platformFeePercent: pct },
      { upsert: true, new: true }
    );
    res.json({ platformFeePercent: settings.platformFeePercent, message: 'Platform fee updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
