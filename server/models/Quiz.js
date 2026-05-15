const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  q:       { type: String, required: true },
  options: [{ type: String }],
  answer:  { type: Number, required: true }, // index into options[]
}, { _id: false });

const schema = new mongoose.Schema({
  tutor:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = all
  subject:   String,
  title:     { type: String, required: true },
  questions: [questionSchema],
  dueDate:   Date,
}, { timestamps: true });

module.exports = mongoose.model('Quiz', schema);
