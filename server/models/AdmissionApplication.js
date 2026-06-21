const mongoose = require('mongoose');

const admissionApplicationSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Child information
    childFirstName:        { type: String, required: true, trim: true },
    childLastName:         { type: String, required: true, trim: true },
    childDOB:              { type: Date,   required: true },
    childGender:           { type: String, enum: ['male', 'female'], required: true },
    childNationality:      { type: String, default: 'Nigerian', trim: true },
    childStateOfOrigin:    { type: String, trim: true, default: '' },
    childBloodGroup:       { type: String, trim: true, default: '' },
    childReligion:         { type: String, trim: true, default: '' },
    childMedicalConditions:{ type: String, trim: true, default: '' },
    childPreviousSchool:   { type: String, trim: true, default: '' },
    className:             { type: String, required: true },

    // Parent / guardian information
    parentName:         { type: String, required: true, trim: true },
    parentPhone:        { type: String, required: true },
    parentAltPhone:     { type: String, default: '' },
    parentEmail:        { type: String, required: true },
    parentRelationship: { type: String, enum: ['father', 'mother', 'guardian'], required: true },
    parentAddress:      { type: String, trim: true, default: '' },
    parentOccupation:   { type: String, trim: true, default: '' },

    // Emergency contact
    emergencyContactName:         { type: String, trim: true, default: '' },
    emergencyContactPhone:        { type: String, default: '' },
    emergencyContactRelationship: { type: String, default: '' },

    // Payment
    amount:        { type: Number, required: true },
    paymentRef:    { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'paid' },

    // Application lifecycle
    status:     { type: String, enum: ['pending', 'under_review', 'admitted', 'rejected'], default: 'pending' },
    schoolNote: { type: String, default: '' },
    session:    { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdmissionApplication', admissionApplicationSchema);
