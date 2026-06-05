const mongoose = require('mongoose');

const statSchema = new mongoose.Schema(
  { value: { type: String, default: '' }, label: { type: String, default: '' } },
  { _id: false }
);

const HomeBannerSchema = new mongoose.Schema({
  badge:    { type: String, default: 'For School Owners' },
  headline: { type: String, default: 'Reach thousands of parents actively searching for schools right now.' },
  body:     { type: String, default: "List your school on Nigeria's fastest-growing education platform. Get verified, get discovered, and fill your admission slots faster than ever before." },
  ctaLabel: { type: String, default: 'List Your School' },
  ctaLink:  { type: String, default: '/list-your-school' },
  stats: {
    type: [statSchema],
    default: [
      { value: '3x',   label: 'More enquiries on average' },
      { value: '24h',  label: 'Approval turnaround'       },
      { value: '₦15k', label: 'One-time listing fee'      },
      { value: '10k+', label: 'Monthly active parents'    },
    ],
  },
  bullets: {
    type: [String],
    default: [
      'Full school profile page',
      'Search & comparison visibility',
      'Direct enquiry routing',
      'Admin management tools',
      'Monthly performance report',
      'Featured listing option',
    ],
  },
  bgTheme: { type: String, enum: ['dark', 'green', 'blue'], default: 'dark' },
  bgImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('HomeBanner', HomeBannerSchema);
