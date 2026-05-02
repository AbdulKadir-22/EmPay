const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    baseSalary: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
    },
    allowances: [
      {
        name: String,
        amount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        isTaxable: { type: Boolean, default: true },
      },
    ],
    deductions: [
      {
        name: String,
        amount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        isStatutory: { type: Boolean, default: false },
      },
    ],
    pfEnabled: {
      type: Boolean,
      default: true,
    },
    taxEnabled: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    effectiveFrom: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = SalaryStructure;
