const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  tutor:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:    { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', schema);
