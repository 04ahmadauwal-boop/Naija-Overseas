const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tutor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:     String,
  period:      String, // e.g. "May 2026"
  summary:     String,
  attendance:  { present: Number, absent: Number, total: Number },
  avgScore:    Number, // 0-100
  strengths:   [String],
  improvements:[String],
}, { timestamps: true });

module.exports = mongoose.model('ProgressReport', schema);
