const mongoose = require('mongoose');

const suggestedSchoolSchema = new mongoose.Schema(
  {
    schoolName: { type: String, required: true },
    state: { type: String },
    type: { type: String },
    website: { type: String },
    reason: { type: String },
    submittedBy: { type: String },
    submittedEmail: { type: String },
    isReviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SuggestedSchool', suggestedSchoolSchema);
