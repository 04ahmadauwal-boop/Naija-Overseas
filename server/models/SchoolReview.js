const mongoose = require('mongoose');

const schoolReviewSchema = new mongoose.Schema(
  {
    school:      { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User',   required: true },
    rating:      { type: Number, required: true, min: 1, max: 5 },
    title:       { type: String, maxlength: 100, trim: true },
    text:        { type: String, required: true, maxlength: 1000, trim: true },
    category:    {
      type: String,
      enum: ['Teaching Quality', 'Communication', 'Fee Structure', 'Infrastructure',
             'Extracurricular Activities', 'Discipline', 'Transport Facilities',
             'Student-Teacher Ratio', 'Environment', 'Academic Results', 'General'],
      default: 'General',
    },
    isAnonymous: { type: Boolean, default: false },
    authorName:  { type: String, trim: true }, // used for seeded/demo reviews where user is a placeholder
  },
  { timestamps: true }
);

// One review per user per school
schoolReviewSchema.index({ school: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('SchoolReview', schoolReviewSchema);
