const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  tutor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subject:  String,
  title:    { type: String, required: true },
  body:     String,
  fileUrl:  String,
  fileName: String,
}, { timestamps: true });
module.exports = mongoose.model('LearningNote', schema);
