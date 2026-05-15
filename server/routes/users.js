const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const TutorProfile = require('../models/TutorProfile');
const StudyAbroadApplication = require('../models/StudyAbroadApplication');
const cloudinary = require('../utils/cloudinary');
const { protect } = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/users/me — logged-in user's own profile (with documents)
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -resetPasswordToken -resetPasswordExpires');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/me/profile — student updates their own bio data
router.patch('/me/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'dateOfBirth', 'gender', 'stateOfOrigin', 'lga', 'address', 'nextOfKin', 'subjects', 'classLevel', 'preferredSchedule', 'tutoringGoal', 'onboardingComplete', 'preferredLanguage', 'learningStyle'];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password -resetPasswordToken -resetPasswordExpires');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/me/avatar — upload / replace profile picture
router.post('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const user = await User.findById(req.user._id);

    if (user.profilePhotoPublicId) {
      await cloudinary.uploader.destroy(user.profilePhotoPublicId).catch(() => {});
    }

    const b64     = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder:         'naija-overseas/avatars',
      public_id:      `user-${req.user._id}`,
      overwrite:      true,
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    user.profilePhoto         = result.secure_url;
    user.profilePhotoPublicId = result.public_id;
    await user.save();

    // Keep TutorProfile in sync so the photo shows on the public listing
    if (req.user.role === 'tutor') {
      await TutorProfile.findOneAndUpdate(
        { user: req.user._id },
        { profilePhoto: result.secure_url }
      ).catch(() => {});
    }

    res.json({ profilePhoto: result.secure_url, message: 'Profile photo updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/documents/upload — student uploads a document
router.post('/documents/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Document name is required' });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `naija-overseas/documents/${req.user._id}`,
      resource_type: 'auto',
      public_id: `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}`,
    });

    const user = await User.findById(req.user._id);
    // Replace existing doc with same name, or add new
    const existingIdx = user.documents.findIndex((d) => d.name === name);
    const docEntry = { name, fileUrl: result.secure_url, publicId: result.public_id, uploadedAt: new Date() };
    if (existingIdx >= 0) {
      // Delete old Cloudinary file
      if (user.documents[existingIdx].publicId) {
        await cloudinary.uploader.destroy(user.documents[existingIdx].publicId).catch(() => {});
      }
      user.documents[existingIdx] = docEntry;
    } else {
      user.documents.push(docEntry);
    }
    await user.save();

    res.json({ document: docEntry, message: 'Document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/documents/:publicId — student removes their own document
router.delete('/documents/:publicId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const publicId = decodeURIComponent(req.params.publicId);
    const doc = user.documents.find((d) => d.publicId === publicId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    await cloudinary.uploader.destroy(publicId).catch(() => {});
    user.documents = user.documents.filter((d) => d.publicId !== publicId);
    await user.save();

    res.json({ message: 'Document removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users — admin: list all users
router.get('/', protect, isAdmin, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id/student-profile — tutor views a student's tutoring profile
router.get('/:id/student-profile', protect, async (req, res) => {
  try {
    const student = await User.findById(req.params.id)
      .select('name email phone country subjects classLevel preferredSchedule preferredLanguage learningStyle tutoringGoal goal createdAt');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id — admin: full user profile with their applications
router.get('/:id', protect, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const applications = await StudyAbroadApplication.find({ user: req.params.id })
      .sort({ createdAt: -1 });

    res.json({ user, applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/users/:id/role — admin changes user role
router.patch('/:id/role', protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/users/:id — admin removes user
router.delete('/:id', protect, isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
