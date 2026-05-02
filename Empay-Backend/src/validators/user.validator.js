const { z } = require('zod');

const inviteUser = z.object({
  body: z.object({
    email: z.string().email(),
    role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).default('EMPLOYEE'),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    employeeId: z.string(),
    department: z.string(),
    designation: z.string(),
    joiningDate: z.string().datetime(),
  }),
});

const updateRole = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']),
  }),
});

module.exports = {
  inviteUser,
  updateRole,
};
