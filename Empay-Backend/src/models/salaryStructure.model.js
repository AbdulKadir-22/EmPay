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
      type: Number,
      required: true,
      default: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    allowances: [
      {
        name: { type: String, required: true },
        amount: { type: Number, default: 0 },
        rateType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
        percentageOf: { type: String, default: 'BASE' }, // e.g., % of Base Salary
      },
    ],
    deductions: [
      {
        name: { type: String, required: true },
        amount: { type: Number, default: 0 },
        rateType: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
        percentageOf: { type: String, default: 'GROSS' },
      },
    ],
    statutory: {
      pfEnabled: { type: Boolean, default: true },
      pfNumber: String,
      esiEnabled: { type: Boolean, default: false },
      esiNumber: String,
      ptEnabled: { type: Boolean, default: true },
      tdsEnabled: { type: Boolean, default: false },
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const SalaryStructure = mongoose.model('SalaryStructure', salaryStructureSchema);

module.exports = SalaryStructure;
