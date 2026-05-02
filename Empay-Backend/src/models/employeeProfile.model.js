const mongoose = require('mongoose');

const employeeProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employmentType: {
      type: String,
      enum: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'],
      default: 'FULL_TIME',
    },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      ifscCode: String,
    },
    governmentIds: {
      pan: String,
      aadhaar: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes
employeeProfileSchema.index({ department: 1 });
employeeProfileSchema.index({ manager: 1 });

const EmployeeProfile = mongoose.model('EmployeeProfile', employeeProfileSchema);

module.exports = EmployeeProfile;
