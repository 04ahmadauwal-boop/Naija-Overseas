const mongoose = require('mongoose');

const studyAbroadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    destinationCountry: { type: String, required: true },
    university: { type: String },
    program: { type: String },
    intake: { type: String },
    currentQualification: { type: String },
    requiresVisa: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['submitted', 'in-review', 'documents-requested', 'admitted', 'rejected'],
      default: 'submitted',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudyAbroadApplication', studyAbroadSchema);
