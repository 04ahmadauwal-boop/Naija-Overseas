const mongoose = require('mongoose');

const tutorReviewSchema = new mongoose.Schema(
  {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 1000 },
    subject: { type: String },
  },
  { timestamps: true }
);

tutorReviewSchema.index({ tutor: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('TutorReview', tutorReviewSchema);
