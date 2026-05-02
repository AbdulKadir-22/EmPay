const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['PUBLIC', 'OPTIONAL', 'COMPANY'],
      default: 'PUBLIC',
    },
    description: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

holidaySchema.index({ date: 1 });

const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = Holiday;
