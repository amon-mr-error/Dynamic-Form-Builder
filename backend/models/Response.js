const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema(
  {
    form: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
    },
    respondent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    responses: [
      {
        elementId: {
          type: String,
          required: true,
        },
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    ipAddress: String,
    userAgent: String,
    completedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      startTime: Date,
      endTime: Date,
      timeSpent: Number, // in seconds
      completionPercentage: Number,
      device: String,
      browser: String,
    },
    status: {
      type: String,
      enum: ['complete', 'partial', 'invalid'],
      default: 'complete',
    },
    aiAnalysis: {
      sentiment: String,
      keywords: [String],
      summary: String,
      flags: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Response', ResponseSchema);