const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { type: Number, min: 0, max: 6, required: true }, // 0=Sun, 1=Mon … 6=Sat
  startTime: { type: String, required: true }, // "09:00"
  endTime:   { type: String, required: true }, // "17:00"
}, { _id: false });

const schema = new mongoose.Schema({
  tutor:           { type: mongoose.Schema.Types.ObjectId, ref: 'TutorProfile', required: true, unique: true },
  timezone:        { type: String, default: 'Africa/Lagos' },
  sessionDuration: { type: Number, default: 60 },  // minutes
  bufferMinutes:   { type: Number, default: 15 },
  maxDaysAhead:    { type: Number, default: 30 },
  weeklySlots:     [slotSchema],
  blockedDates:    [{ type: String }],              // "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('TutorAvailability', schema);
