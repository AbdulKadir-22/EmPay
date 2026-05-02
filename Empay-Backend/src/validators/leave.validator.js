const { z } = require('zod');

const createLeaveType = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    description: z.string().optional(),
    totalDays: z.number().min(0),
    carryForward: z.boolean().default(false),
    maxCarryForward: z.number().min(0).default(0),
  }),
});

const allocateLeave = z.object({
  body: z.object({
    employeeId: z.string(),
    leaveTypeId: z.string(),
    year: z.number().min(2020),
    totalDays: z.number().min(0),
  }),
});

const requestLeave = z.object({
  body: z.object({
    leaveTypeId: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(5),
  }),
});

const updateStatus = z.object({
  params: z.object({
    requestId: z.string(),
  }),
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
    comment: z.string().optional(),
  }),
});

module.exports = {
  createLeaveType,
  allocateLeave,
  requestLeave,
  updateStatus,
};
