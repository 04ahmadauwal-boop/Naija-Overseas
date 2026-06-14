const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['student', 'parent', 'school-owner', 'admin', 'tutor'],
      default: 'student',
    },
    goal: {
      type: String,
      enum: ['tutoring', 'study-abroad', 'both'],
      default: 'both',
    },
    phone: { type: String },
    country: { type: String, default: 'Nigeria' },
    isVerified: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    emailVerificationToken:   { type: String },
    emailVerificationExpires: { type: Date },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'prefer-not-to-say'] },
    stateOfOrigin: { type: String },
    lga: { type: String },
    address: { type: String },
    nextOfKin: {
      name: { type: String },
      relationship: { type: String },
      phone: { type: String },
    },
    documents: [
      {
        name: { type: String, required: true },
        fileUrl: { type: String, required: true },
        publicId: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    subjects: [{ type: String }],
    classLevel: { type: String },
    preferredSchedule: [{ type: String }],
    tutoringGoal: { type: String },
    onboardingComplete: { type: Boolean, default: false },
    preferredLanguage: { type: String },
    learningStyle: { type: String },
    profilePhoto:          { type: String },
    profilePhotoPublicId:  { type: String },
    // Google Calendar OAuth tokens (tutors only)
    googleTokens: {
      accessToken:  { type: String },
      refreshToken: { type: String },
      expiresAt:    { type: Date },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
