const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    service: {
      type: String,
      enum: ['school-visit', 'study-abroad-consultation', 'tutoring-session'],
      required: true,
    },
    tutorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    notes: { type: String },
    paymentRef: { type: String },
    callLink: { type: String },
    // Scheduling fields
    timezone:         { type: String },
    recurrence:       { type: String, enum: ['none', 'weekly', 'biweekly', 'monthly'], default: 'none' },
    recurrenceCount:  { type: Number, default: 1 },
    parentBookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    googleEventId:    { type: String },
    reminderSent24h:  { type: Boolean, default: false },
    reminderSent1h:   { type: Boolean, default: false },
    isTrial:          { type: Boolean, default: false },
    subscriptionId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
