const express = require('express');
const router = express.Router();
const multer = require('multer');
const Classroom = require('../models/Classroom');
const { protect } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/classroom — create a new room (tutor or admin)
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, subject } = req.body;
    if (!roomId) return res.status(400).json({ message: 'roomId is required' });

    let room = await Classroom.findOne({ roomId });
    if (!room) room = await Classroom.create({ roomId, subject, createdBy: req.user._id });
    res.status(201).json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/classroom/:roomId — get room details + files
router.get('/:roomId', protect, async (req, res) => {
  try {
    let room = await Classroom.findOne({ roomId: req.params.roomId });
    if (!room) room = await Classroom.create({ roomId: req.params.roomId, createdBy: req.user._id });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/classroom/:roomId/status
router.patch('/:roomId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const updates = { status };
    if (status === 'active' && !updates.startedAt) updates.startedAt = new Date();
    if (status === 'ended') updates.endedAt = new Date();
    const room = await Classroom.findOneAndUpdate({ roomId: req.params.roomId }, updates, { new: true, upsert: true });
    res.json({ room });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/classroom/:roomId/files — upload a shared file
router.post('/:roomId/files', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: `naija-overseas/classroom/${req.params.roomId}`,
      resource_type: 'auto',
      public_id: `${Date.now()}-${req.file.originalname.replace(/\s+/g, '-')}`,
    });

    const fileEntry = {
      name: req.file.originalname,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      uploadedBy: req.user.name,
      uploadedAt: new Date(),
    };

    const room = await Classroom.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $push: { sharedFiles: fileEntry } },
      { new: true, upsert: true }
    );
    res.json({ room, file: fileEntry });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
