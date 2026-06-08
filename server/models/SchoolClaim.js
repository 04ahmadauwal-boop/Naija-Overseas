const mongoose = require('mongoose');

const schoolClaimSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    claimantName: { type: String, trim: true },
    claimantEmail: { type: String, required: true, trim: true },
    claimantPhone: { type: String, trim: true },
    updatedData: { type: Object },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchoolClaim', schoolClaimSchema);
