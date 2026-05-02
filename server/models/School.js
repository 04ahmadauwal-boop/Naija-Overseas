const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    type: { type: String, enum: ['private', 'public', 'federal'], required: true },
    level: { type: String, enum: ['primary', 'secondary', 'both'], default: 'secondary' },
    country: { type: String, default: 'Nigeria' },
    state: { type: String, required: true },
    city: { type: String },
    address: { type: String },
    fees: {
      tuition: { type: Number, default: 0 },
      boarding: { type: Number, default: 0 },
    },
    curriculum: {
      type: [String],
      enum: ['WAEC', 'NECO', 'IGCSE', 'IB', 'Cambridge', 'BECE', 'WASSCE'],
      default: ['WAEC'],
    },
    facilities: [{ type: String }],
    images: [{ type: String }],
    description: { type: String },
    contact: {
      phone: { type: String },
      email: { type: String },
      website: { type: String },
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    listingPaymentRef: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('School', schoolSchema);
