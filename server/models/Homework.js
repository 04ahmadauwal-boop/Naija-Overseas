const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema(
  {
    roomId:      { type: String, required: true },
    tutor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject:     { type: String },
    title:       { type: String, required: true },
    description: { type: String },
    dueDate:     { type: Date },
    attachments: [{ name: String, fileUrl: String, publicId: String }],
    status:      { type: String, enum: ['assigned', 'submitted', 'graded'], default: 'assigned' },
    submission: {
      text:        { type: String },
      attachments: [{ name: String, fileUrl: String }],
      submittedAt: { type: Date },
    },
    grade: {
      score:    { type: Number, min: 0, max: 100 },
      feedback: { type: String },
      gradedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Homework', homeworkSchema);
