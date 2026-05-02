const { z } = require('zod');

const register = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    department: z.string(),
    designation: z.string(),
    joiningDate: z.string().datetime(),
    employeeId: z.string(),
    role: z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']).optional(),
  }),
});

const login = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const refreshToken = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

const forgotPassword = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPassword = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(8),
  }),
});

module.exports = {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
