const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payrun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payrun',
      required: true,
      index: true,
    },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    
    // Snapshots at time of generation
    salarySnapshot: {
      baseSalary: mongoose.Schema.Types.Decimal128,
      allowances: [{ name: String, amount: mongoose.Schema.Types.Decimal128 }],
      deductions: [{ name: String, amount: mongoose.Schema.Types.Decimal128 }],
    },
    attendanceSnapshot: {
      totalDays: Number,
      presentDays: Number,
      absentDays: Number,
      lopDays: Number,
    },
    
    // Totals
    grossSalary: { type: mongoose.Schema.Types.Decimal128, required: true },
    totalDeductions: { type: mongoose.Schema.Types.Decimal128, required: true },
    netSalary: { type: mongoose.Schema.Types.Decimal128, required: true },
    
    status: {
      type: String,
      enum: ['GENERATED', 'PAID', 'VOID'],
      default: 'GENERATED',
    },
    pdfUrl: String,
    paidAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Immutability: Prevent updates once created
payslipSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error('Payslip is immutable and cannot be modified.'));
  }
  next();
});

// Compound index for unique payslip per employee per pay period
payslipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', payslipSchema);

module.exports = Payslip;
