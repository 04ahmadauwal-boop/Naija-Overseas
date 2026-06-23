const mongoose = require('mongoose');

const tutorPayrollSchema = new mongoose.Schema(
  {
    tutor:        { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile', required: true },
    student:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
    booking:      { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    description:  { type: String, default: '' },

    grossAmount:        { type: Number, required: true, min: 0 },
    platformFeePercent: { type: Number, default: 15 },
    platformFee:        { type: Number, required: true, min: 0 },
    netAmount:          { type: Number, required: true, min: 0 },
    currency:           { type: String, default: 'NGN' },

    status: {
      type: String,
      enum: ['pending_review', 'review_submitted', 'approved', 'disbursed', 'on_hold'],
      default: 'pending_review',
    },

    studentReview: {
      rating:      { type: Number, min: 1, max: 5 },
      comment:     { type: String, maxlength: 1000 },
      submittedAt: { type: Date },
    },

    adminNote:       { type: String, default: '' },
    approvedAt:      { type: Date },
    disbursedAt:     { type: Date },
    disbursementRef: { type: String, default: '' },
  },
  { timestamps: true }
);

tutorPayrollSchema.index({ tutor: 1, status: 1 });
tutorPayrollSchema.index({ student: 1 });
tutorPayrollSchema.index({ booking: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('TutorPayroll', tutorPayrollSchema);
