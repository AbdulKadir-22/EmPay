const { z } = require('zod');

const updateProfile = z.object({
  params: z.object({
    employeeId: z.string(),
  }),
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    manager: z.string().optional(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']).optional(),
    bankDetails: z.object({
      accountName: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      ifscCode: z.string().optional(),
    }).optional(),
    governmentIds: z.object({
      pan: z.string().optional(),
      aadhaar: z.string().optional(),
    }).optional(),
  }),
});

const uploadDocument = z.object({
  params: z.object({
    employeeId: z.string(),
  }),
  body: z.object({
    name: z.string(),
    url: z.string().url(),
  }),
});

module.exports = {
  updateProfile,
  uploadDocument,
};
