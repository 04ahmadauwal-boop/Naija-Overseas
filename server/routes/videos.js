const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// GET /api/videos — public
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (search) filter.$or = [
      { title:  new RegExp(search, 'i') },
      { school: new RegExp(search, 'i') },
    ];
    const total = await Video.countDocuments(filter);
    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ videos, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/videos/admin/all — admin only
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/videos — admin only
router.post('/', protect, isAdmin, async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json({ video });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/videos/:id — admin only
router.put('/:id', protect, isAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ video });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/videos/:id — admin only
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
