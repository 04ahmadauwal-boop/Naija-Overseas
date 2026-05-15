const express = require('express');
const router = express.Router();
const LearningNote = require('../models/LearningNote');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const ChatMessage = require('../models/ChatMessage');
const ProgressReport = require('../models/ProgressReport');
const Booking = require('../models/Booking');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');
const { protect: auth } = require('../middleware/auth');

// ── Notes ────────────────────────────────────────────────────────────────────

router.get('/notes', auth, async (req, res) => {
  try {
    const id   = req.user._id;
    const role = req.user.role;
    const filter = role === 'tutor'
      ? { tutor: id }
      : { $or: [{ student: id }, { student: null }] };
    const notes = await LearningNote.find(filter)
      .populate('tutor', 'name')
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// supports single student OR array of studentIds for bulk send
router.post('/notes', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Tutors only' });
  try {
    const { studentIds, student, ...rest } = req.body;
    const targets = studentIds?.length ? studentIds : student ? [student] : [null];
    const docs = await LearningNote.insertMany(
      targets.map(sid => ({ ...rest, tutor: req.user._id, student: sid || null }))
    );
    res.status(201).json(docs.length === 1 ? docs[0] : docs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/notes/:id', auth, async (req, res) => {
  try {
    const note = await LearningNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Not found' });
    if (String(note.tutor) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    await note.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Quizzes ──────────────────────────────────────────────────────────────────

router.get('/quizzes', auth, async (req, res) => {
  try {
    const id   = req.user._id;
    const role = req.user.role;
    const filter = role === 'tutor'
      ? { tutor: id }
      : { $or: [{ student: id }, { student: null }] };
    const quizzes = await Quiz.find(filter)
      .populate('tutor', 'name')
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// supports single student OR array of studentIds for bulk send
router.post('/quizzes', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Tutors only' });
  try {
    const { studentIds, student, ...rest } = req.body;
    const targets = studentIds?.length ? studentIds : student ? [student] : [null];
    const docs = await Quiz.insertMany(
      targets.map(sid => ({ ...rest, tutor: req.user._id, student: sid || null }))
    );
    res.status(201).json(docs.length === 1 ? docs[0] : docs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/quizzes/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Not found' });
    if (String(quiz.tutor) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    await quiz.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/quizzes/:id/submit', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Students only' });
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const { answers } = req.body;
    let correct = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    const score = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0;
    const attempt = await QuizAttempt.create({ quiz: quiz._id, student: req.user._id, answers, score });
    res.status(201).json({ score, correct, total: quiz.questions.length, attempt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/quizzes/:id/attempts', auth, async (req, res) => {
  try {
    const filter = { quiz: req.params.id };
    if (req.user.role === 'student') filter.student = req.user._id;
    const attempts = await QuizAttempt.find(filter)
      .populate('student', 'name email')
      .sort({ submittedAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Chat ─────────────────────────────────────────────────────────────────────

router.get('/chat/:otherId', auth, async (req, res) => {
  try {
    const me    = req.user._id;
    const other = req.params.otherId;
    const messages = await ChatMessage.find({
      $or: [
        { tutor: me,    student: other },
        { tutor: other, student: me    },
      ],
    }).populate('sender', 'name role').sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/chat/:otherId', auth, async (req, res) => {
  try {
    const me     = req.user._id;
    const other  = req.params.otherId;
    const myRole = req.user.role;
    const tutorId   = myRole === 'tutor'   ? me : other;
    const studentId = myRole === 'student' ? me : other;
    const msg = await ChatMessage.create({
      tutor: tutorId, student: studentId, sender: me, text: req.body.text,
    });
    const populated = await msg.populate('sender', 'name role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/chat-contacts', auth, async (req, res) => {
  try {
    const me    = req.user._id;
    const field = req.user.role === 'tutor' ? 'student' : 'tutor';
    const msgs  = await ChatMessage.find({
      $or: [{ tutor: me }, { student: me }],
    }).sort({ createdAt: -1 });

    const seen = new Set();
    const contacts = [];
    for (const m of msgs) {
      const contactId = String(m[field]);
      if (!seen.has(contactId)) { seen.add(contactId); contacts.push(contactId); }
    }
    const users = await User.find({ _id: { $in: contacts } }).select('name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Progress / Reports ───────────────────────────────────────────────────────

router.get('/reports', auth, async (req, res) => {
  try {
    const id   = req.user._id;
    const role = req.user.role;
    const filter = role === 'tutor' ? { tutor: id } : { student: id };
    const reports = await ProgressReport.find(filter)
      .populate('tutor', 'name')
      .populate('student', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reports', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Tutors only' });
  try {
    const report = await ProgressReport.create({ ...req.body, tutor: req.user._id });
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/stats/:studentId', auth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const attempts  = await QuizAttempt.find({ student: studentId });
    const avgScore  = attempts.length
      ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length)
      : null;
    const notesCount = await LearningNote.countDocuments({
      $or: [{ student: studentId }, { student: null }],
    });
    const reports = await ProgressReport.find({ student: studentId });
    const attendance = reports.reduce(
      (acc, r) => {
        if (r.attendance) {
          acc.present += r.attendance.present || 0;
          acc.absent  += r.attendance.absent  || 0;
          acc.total   += r.attendance.total   || 0;
        }
        return acc;
      },
      { present: 0, absent: 0, total: 0 }
    );
    res.json({ avgScore, notesCount, quizzesAttempted: attempts.length, attendance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── My Students ──────────────────────────────────────────────────────────────

router.get('/my-students', auth, async (req, res) => {
  if (req.user.role !== 'tutor') return res.status(403).json({ message: 'Tutors only' });
  try {
    const profile = await TutorProfile.findOne({ user: req.user._id });
    if (!profile) return res.json([]);
    const bookings = await Booking.find({
      tutorId: profile._id,
      status: { $in: ['confirmed', 'pending', 'upcoming'] },
    }).populate('user', 'name email');
    const seen = new Set();
    const students = [];
    for (const b of bookings) {
      if (b.user && !seen.has(String(b.user._id))) {
        seen.add(String(b.user._id));
        students.push(b.user);
      }
    }
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
