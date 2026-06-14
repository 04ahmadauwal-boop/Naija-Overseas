const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  institution: { type: String },
  year: { type: String },
});

const tutorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String, trim: true },
    headline: { type: String, trim: true, maxlength: 120 },
    bio: { type: String, maxlength: 2000 },
    subjects: [{ type: String, trim: true }],
    levels: [{ type: String }],
    teachingMode: [{ type: String, enum: ['online', 'in-person'] }],
    country: { type: String, default: 'Nigeria' },
    state: { type: String },
    city: { type: String },
    currency: { type: String, enum: ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR', 'CAD', 'AUD', 'INR', 'ZMW'], default: 'NGN' },
    hourlyRateNaira: { type: Number, min: 0 },
    groupRateNaira: { type: Number, min: 0 },
    trialAvailable: { type: Boolean, default: true },
    trialDurationMins: { type: Number, default: 30 },
    trialDiscountPercent: { type: Number, default: 50, min: 0, max: 100 },
    languages: [{ type: String }],
    qualifications: [qualificationSchema],
    yearsExperience: { type: Number, default: 0, min: 0 },
    specializations: [{ type: String }],
    profilePhoto: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    responseTime: { type: String, default: 'Within 24 hours' },
    availability: [{ type: String }],
    teachingStyle: [{ type: String }],
    timezone: { type: String },
  },
  { timestamps: true }
);

tutorProfileSchema.index({ subjects: 1 });
tutorProfileSchema.index({ levels: 1 });
tutorProfileSchema.index({ state: 1 });
tutorProfileSchema.index({ country: 1 });
tutorProfileSchema.index({ isActive: 1, rating: -1 });

module.exports = mongoose.model('TutorProfile', tutorProfileSchema);
