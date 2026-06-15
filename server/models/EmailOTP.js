const mongoose = require('mongoose');

const emailOTPSchema = new mongoose.Schema({
  email:   { type: String, required: true, lowercase: true, index: true },
  otpHash: { type: String, required: true },
  expires: { type: Date,   required: true },
});

// MongoDB TTL — auto-deletes expired documents
emailOTPSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('EmailOTP', emailOTPSchema);
