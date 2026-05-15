const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  quiz:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers:   [{ type: Number }], // index into options[] for each question
  score:     { type: Number, required: true }, // 0-100 percent
  submittedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', schema);
