const mongoose = require('mongoose');

const tutorQuestionSchema = new mongoose.Schema(
  {
    tutor:        { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile', required: true },
    subject:      { type: String, required: true, trim: true },
    topic:        { type: String, trim: true, default: '' },
    question:     { type: String, required: true, trim: true },
    options:      {
      type: [String],
      required: true,
      validate: [arr => arr.length >= 2 && arr.length <= 5, 'Must have 2–5 options'],
    },
    correctIndex: { type: Number, required: true, min: 0, max: 4 },
  },
  { timestamps: true }
);

tutorQuestionSchema.index({ tutor: 1, subject: 1 });

module.exports = mongoose.model('TutorQuestion', tutorQuestionSchema);
