const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'full'], required: true },
    value: { type: Number, default: 0 }, // percent off (0-100); ignored when type='full'
    isActive: { type: Boolean, default: true },
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null }, // null = no expiry
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
