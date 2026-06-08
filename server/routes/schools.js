const express = require('express');
const router = express.Router();
const multer = require('multer');
const slugify = require('slugify');
const mongoose = require('mongoose');
const School = require('../models/School');
const SuggestedSchool = require('../models/SuggestedSchool');
const SchoolClaim = require('../models/SchoolClaim');
const { protect, optionalAuth } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const cloudinary = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/schools — public list with filters
router.get('/', async (req, res) => {
  try {
    const { state, lga, city, type, level, curriculum, minFee, maxFee, search, page = 1, limit = 12, featured } = req.query;
    const filter = { status: 'approved' };

    if (featured === 'true') filter.isFeatured = true;
    if (state) filter.state = new RegExp(state, 'i');
    if (lga) filter.lga = new RegExp(lga, 'i');
    if (city) filter.city = new RegExp(city, 'i');
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

// GET /api/schools/my — school owner sees their own school(s)
router.get('/my', protect, async (req, res) => {
  try {
    const schools = await School.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/schools/upload-image — upload a school image (used during listing form)
router.post('/upload-image', optionalAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'naija-overseas/schools/uploads',
      resource_type: 'image',
    });
    res.json({ imageUrl: result.secure_url });
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

// GET /api/schools/search?q= — name autocomplete for claim flow (must be before /:identifier)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) return res.json({ schools: [] });
    const schools = await School.find({
      status: 'approved',
      name: new RegExp(q.trim(), 'i'),
    })
      .select('name state city type level images')
      .limit(8);
    res.json({ schools });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/schools/admin/claims — admin views all school claims (must be before /:identifier)
router.get('/admin/claims', protect, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const claims = await SchoolClaim.find(filter)
      .populate('school', 'name state city type level slug')
      .sort({ createdAt: -1 });
    res.json({ claims });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/schools/admin/claims/:claimId — admin approves or rejects a claim
router.patch('/admin/claims/:claimId', protect, isAdmin, async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'action must be approved or rejected' });
    }
    const claim = await SchoolClaim.findById(req.params.claimId);
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    claim.status = action;
    if (adminNote) claim.adminNote = adminNote;
    await claim.save();
    if (action === 'approved' && claim.updatedData) {
      const { ownerName, ownerEmail, ...schoolData } = claim.updatedData;
      await School.findByIdAndUpdate(claim.school, schoolData);
    }
    res.json({ claim, message: `Claim ${action}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/schools/suggestions — admin views submitted suggestions (must be before /:identifier)
router.get('/suggestions', protect, isAdmin, async (req, res) => {
  try {
    const suggestions = await SuggestedSchool.find().sort({ createdAt: -1 });
    res.json({ suggestions });
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

// POST /api/schools/:id/claim — public, claim an existing school listing
router.post('/:id/claim', async (req, res) => {
  try {
    const { claimantName, claimantEmail, claimantPhone, updatedData } = req.body;
    if (!claimantEmail?.trim()) return res.status(400).json({ message: 'Claimant email is required' });
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    const existing = await SchoolClaim.findOne({ school: school._id, claimantEmail: claimantEmail.trim(), status: 'pending' });
    if (existing) return res.status(409).json({ message: 'You already have a pending claim for this school' });
    const claim = await SchoolClaim.create({
      school: school._id,
      claimantName,
      claimantEmail: claimantEmail.trim(),
      claimantPhone,
      updatedData,
    });
    res.status(201).json({ claim, message: 'Claim submitted for admin review' });
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

// POST /api/schools/:id/view — increment profile views (public)
router.post('/:id/view', async (req, res) => {
  try {
    await School.findByIdAndUpdate(req.params.id, { $inc: { profileViews: 1 } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false });
  }
});

// POST /api/schools/:id/gallery/upload — owner uploads image to gallery
router.post('/:id/gallery/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    if (school.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `naija-overseas/schools/${req.params.id}`,
      resource_type: 'image',
    });
    school.images.push(result.secure_url);
    await school.save();
    res.json({ imageUrl: result.secure_url, images: school.images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/schools/:id/gallery — owner removes an image from gallery
router.delete('/:id/gallery', protect, async (req, res) => {
  try {
    const { imageUrl } = req.body;
    const school = await School.findById(req.params.id);
    if (!school) return res.status(404).json({ message: 'School not found' });
    if (school.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    school.images = school.images.filter((img) => img !== imageUrl);
    await school.save();
    res.json({ images: school.images });
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

// POST /api/schools/suggest — public, anyone can suggest a school
router.post('/suggest', async (req, res) => {
  try {
    const { schoolName, state, type, website, reason, submittedBy, submittedEmail } = req.body;
    if (!schoolName?.trim()) return res.status(400).json({ message: 'School name is required' });
    const suggestion = await SuggestedSchool.create({ schoolName, state, type, website, reason, submittedBy, submittedEmail });
    res.status(201).json({ suggestion, message: 'Thank you! Your suggestion has been received.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
