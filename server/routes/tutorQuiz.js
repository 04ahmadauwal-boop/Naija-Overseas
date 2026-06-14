const express = require('express');
const router = express.Router();
const TutorQuestion = require('../models/TutorQuestion');
const TutorProfile = require('../models/TutorProfile');
const { protect } = require('../middleware/auth');

// ── GET /api/tutor-quiz/my/questions — tutor: list own questions WITH correctIndex
router.get('/my/questions', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });
    const questions = await TutorQuestion.find({ tutor: profile._id }).sort({ subject: 1, createdAt: -1 });
    res.json({ questions, total: questions.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/tutor-quiz/my/questions — tutor: create a question
router.post('/my/questions', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });

    const { subject, topic, question, options, correctIndex } = req.body;
    if (!subject || !question || !options || correctIndex === undefined) {
      return res.status(400).json({ message: 'subject, question, options, and correctIndex are required' });
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
      return res.status(400).json({ message: 'options must be an array of 2–5 items' });
    }
    if (correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ message: 'correctIndex is out of range' });
    }

    const q = await TutorQuestion.create({
      tutor:        profile._id,
      subject:      subject.trim(),
      topic:        (topic || '').trim(),
      question:     question.trim(),
      options:      options.map(o => o.trim()),
      correctIndex: Number(correctIndex),
    });
    res.status(201).json({ question: q });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/tutor-quiz/my/questions/:id — tutor: edit a question
router.patch('/my/questions/:id', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });

    const q = await TutorQuestion.findOne({ _id: req.params.id, tutor: profile._id });
    if (!q) return res.status(404).json({ message: 'Question not found' });

    const { subject, topic, question, options, correctIndex } = req.body;
    if (subject !== undefined)  q.subject  = subject.trim();
    if (topic !== undefined)    q.topic    = topic.trim();
    if (question !== undefined) q.question = question.trim();
    if (options !== undefined) {
      if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
        return res.status(400).json({ message: 'options must be 2–5 items' });
      }
      q.options = options.map(o => o.trim());
    }
    if (correctIndex !== undefined) {
      const len = q.options?.length || 5;
      if (Number(correctIndex) < 0 || Number(correctIndex) >= len) {
        return res.status(400).json({ message: 'correctIndex out of range' });
      }
      q.correctIndex = Number(correctIndex);
    }
    await q.save();
    res.json({ question: q });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/tutor-quiz/my/questions/:id — tutor: delete a question
router.delete('/my/questions/:id', protect, async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Tutor profile not found' });

    const q = await TutorQuestion.findOneAndDelete({ _id: req.params.id, tutor: profile._id });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/tutor-quiz/:tutorProfileId — public: shuffled questions WITHOUT correctIndex
// Query: ?subject=Mathematics  (required — only return questions for that subject)
router.get('/:tutorProfileId', async (req, res) => {
  try {
    const filter = { tutor: req.params.tutorProfileId };
    if (req.query.subject) filter.subject = req.query.subject;

    const questions = await TutorQuestion.find(filter)
      .select('-correctIndex')
      .lean();

    // Fisher-Yates shuffle
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    res.json({ questions: questions.slice(0, 30) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
