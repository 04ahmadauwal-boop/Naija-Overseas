const mongoose = require('mongoose');

const slotPref = new mongoose.Schema({
  day:  { type: Number, min: 0, max: 6, required: true }, // 0=Sun … 6=Sat
  time: { type: String, required: true },                 // "HH:MM" in tutor timezone
}, { _id: false });

const schema = new mongoose.Schema({
  tutor:           { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile', required: true },
  student:         { type: mongoose.Schema.Types.ObjectId, ref: 'User',         required: true },
  trialBookingId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  timesPerWeek:    { type: Number, min: 1, max: 5, required: true },
  preferredSlots:  [slotPref],
  sessionDuration: { type: Number, required: true },       // minutes
  monthlyRate:     { type: Number, required: true },       // NGN
  currency:        { type: String, default: 'NGN' },
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'cancelled'],
    default: 'pending',
  },
  startDate:   { type: Date },
  renewalDate: { type: Date },   // startDate + 30 days
  paymentRef:  { type: String },
  // IDs of bookings created for this subscription cycle
  sessionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
}, { timestamps: true });

module.exports = mongoose.model('Subscription', schema);
