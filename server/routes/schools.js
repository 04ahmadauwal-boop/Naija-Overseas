const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const mongoose = require('mongoose');
const School = require('../models/School');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// GET /api/schools — public list with filters
router.get('/', async (req, res) => {
  try {
    const { state, type, level, curriculum, minFee, maxFee, search, page = 1, limit = 12, featured } = req.query;
    const filter = { status: 'approved' };

    if (featured === 'true') filter.isFeatured = true;
    if (state) filter.state = new RegExp(state, 'i');
    if (type) filter.type = type;
    if (level) filter.level = level;
    if (curriculum) filter.curriculum = curriculum;
    if (search) filter.name = new RegExp(search, 'i');
    if (minFee || maxFee) {
      filter['fees.tuition'] = {};
      if (minFee) filter['fees.tuition'].$gte = Number(minFee);
      if (maxFee) filter['fees.tuition'].$lte = Number(maxFee);
    }

    const total = await School.countDocuments(filter);
    const schools = await School.find(filter)
      .populate('owner', 'name email')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ schools, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/schools/admin/all — admin sees all schools
router.get('/admin/all', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const schools = await School.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/schools/:identifier — find by slug or MongoDB _id
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let school;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      school = await School.findOne({ _id: identifier, status: 'approved' }).populate('owner', 'name email');
    }
    if (!school) {
      school = await School.findOne({ slug: identifier, status: 'approved' }).populate('owner', 'name email');
    }
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json({ school });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/schools — school owner submits listing
router.post('/', protect, async (req, res) => {
  try {
    const data = req.body;
    data.owner = req.user._id;
    data.slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    const school = await School.create(data);
    res.status(201).json({ school, message: 'School submitted for review' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/schools/admin/add — admin adds school directly (approved)
router.post('/admin/add', protect, isAdmin, async (req, res) => {
  try {
    const data = req.body;
    data.status = 'approved';
    data.owner = req.user._id;
    data.slug = slugify(data.name, { lower: true, strict: true }) + '-' + Date.now();
    const school = await School.create(data);
    res.status(201).json({ school });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/schools/:id — update (owner or admin)
router.put('/:id', protect, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    if (school.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ school: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/schools/:id/approve — admin approves/rejects
router.patch('/:id/approve', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' | 'rejected'
    const school = await School.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!school) return res.status(404).json({ message: 'School not found' });
    res.json({ school, message: `School ${status}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/schools/:id/feature — admin toggles featured
router.patch('/:id/feature', protect, isAdmin, async (req, res) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    school.isFeatured = !school.isFeatured;
    await school.save();
    res.json({ school });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/schools/:id — admin only
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await School.findByIdAndDelete(req.params.id);
    res.json({ message: 'School deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
