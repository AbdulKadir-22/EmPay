const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'HR', 'PAYROLL_OFFICER', 'EMPLOYEE'],
      default: 'EMPLOYEE',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'PENDING',
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    otp: {
      hash: String,
      expiry: Date,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    company: {
      type: String,
      required: true,
      index: true,
      default: 'Default Company',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
