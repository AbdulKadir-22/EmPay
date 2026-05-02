const mongoose = require('mongoose');

const payrunSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'PROCESSING', 'COMPLETED', 'FINALIZED'],
      default: 'DRAFT',
      index: true,
    },
    totalEmployees: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    finalizedAt: {
      type: Date,
    },
    notes: String,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

payrunSchema.index({ month: 1, year: 1, status: 1 });

const Payrun = mongoose.model('Payrun', payrunSchema);

module.exports = Payrun;
