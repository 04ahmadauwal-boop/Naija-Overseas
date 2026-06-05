const express = require('express');
const router = express.Router();
const HomeBanner = require('../models/HomeBanner');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// GET /api/banner — public, returns the single active banner (or defaults)
router.get('/', async (req, res) => {
  try {
    const banner = await HomeBanner.findOne().sort({ updatedAt: -1 }).lean();
    res.json({ banner: banner || {} });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/banner — admin only, upsert the single banner document
router.put('/', protect, isAdmin, async (req, res) => {
  try {
    const banner = await HomeBanner.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ banner });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
