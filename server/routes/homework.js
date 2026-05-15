const express = require('express');
const router = express.Router();
const Homework = require('../models/Homework');
const { protect } = require('../middleware/auth');

// POST /api/homework — tutor assigns homework
router.post('/', protect, async (req, res) => {
  try {
    const { roomId, subject, title, description, dueDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const hw = await Homework.create({
      roomId,
      tutor: req.user._id,
      subject,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ homework: hw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/homework?roomId=xxx — list homework for a room
router.get('/', protect, async (req, res) => {
  try {
    const { roomId } = req.query;
    const filter = roomId ? { roomId } : {};
    if (req.user.role === 'student') filter.student = req.user._id;

    const homework = await Homework.find(filter)
      .populate('tutor', 'name')
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json({ homework });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/homework/:id/submit — student submits
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const { text } = req.body;
    const hw = await Homework.findByIdAndUpdate(
      req.params.id,
      {
        'submission.text': text,
        'submission.submittedAt': new Date(),
        status: 'submitted',
        student: req.user._id,
      },
      { new: true }
    );
    if (!hw) return res.status(404).json({ message: 'Homework not found' });
    res.json({ homework: hw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/homework/:id/grade — tutor grades
router.patch('/:id/grade', protect, async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const hw = await Homework.findByIdAndUpdate(
      req.params.id,
      {
        'grade.score': Number(score),
        'grade.feedback': feedback,
        'grade.gradedAt': new Date(),
        status: 'graded',
      },
      { new: true }
    );
    if (!hw) return res.status(404).json({ message: 'Homework not found' });
    res.json({ homework: hw });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/homework/:id — tutor deletes
router.delete('/:id', protect, async (req, res) => {
  try {
    await Homework.findByIdAndDelete(req.params.id);
    res.json({ message: 'Homework deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
