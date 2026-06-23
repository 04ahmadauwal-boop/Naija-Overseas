const mongoose = require('mongoose');

// Singleton document — always upsert with key: 'global'
const schema = new mongoose.Schema({
  key:                { type: String, default: 'global', unique: true },
  platformFeePercent: { type: Number, default: 15, min: 0, max: 100 },
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', schema);
