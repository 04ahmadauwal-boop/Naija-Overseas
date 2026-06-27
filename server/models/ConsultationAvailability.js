const mongoose = require('mongoose');

const daySchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  slots: [{ type: String }],
}, { _id: false });

const DEFAULT_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'];

const consultationAvailabilitySchema = new mongoose.Schema({
  sun: { type: daySchema, default: () => ({ enabled: false, slots: [] }) },
  mon: { type: daySchema, default: () => ({ enabled: true, slots: DEFAULT_SLOTS }) },
  tue: { type: daySchema, default: () => ({ enabled: true, slots: DEFAULT_SLOTS }) },
  wed: { type: daySchema, default: () => ({ enabled: true, slots: DEFAULT_SLOTS }) },
  thu: { type: daySchema, default: () => ({ enabled: true, slots: DEFAULT_SLOTS }) },
  fri: { type: daySchema, default: () => ({ enabled: true, slots: DEFAULT_SLOTS }) },
  sat: { type: daySchema, default: () => ({ enabled: false, slots: [] }) },
  dateOverrides: [{
    date: { type: String, required: true }, // YYYY-MM-DD
    enabled: { type: Boolean, default: true },
    slots: [{ type: String }],
    _id: false,
  }],
}, { timestamps: true });

module.exports = mongoose.model('ConsultationAvailability', consultationAvailabilitySchema);
