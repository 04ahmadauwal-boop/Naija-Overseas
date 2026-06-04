const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    school:      { type: String, trim: true },
    category:    { type: String, enum: ['Parent Review', 'Principal Interview', 'School Review', 'Study Abroad', 'General'], default: 'General' },
    videoUrl:    { type: String, required: true, trim: true }, // YouTube embed URL or direct mp4
    thumbnail:   { type: String, trim: true },                 // optional override; auto-derived from YouTube if blank
    duration:    { type: String, trim: true },                 // e.g. "6:42"
    description: { type: String, trim: true },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', videoSchema);
