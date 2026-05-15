const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    roomId:      { type: String, required: true, unique: true },
    subject:     { type: String },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt:   { type: Date },
    endedAt:     { type: Date },
    status:      { type: String, enum: ['waiting', 'active', 'ended'], default: 'waiting' },
    dailyRoomUrl: { type: String },
    sharedFiles: [
      {
        name:       { type: String },
        fileUrl:    { type: String },
        publicId:   { type: String },
        uploadedBy: { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Classroom', classroomSchema);
