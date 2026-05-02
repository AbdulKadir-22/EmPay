const { z } = require('zod');

const clockIn = z.object({
  body: z.object({
    location: z.string().optional(),
  }),
});

const clockOut = z.object({
  body: z.object({
    location: z.string().optional(),
  }),
});

const manualEntry = z.object({
  body: z.object({
    employeeId: z.string(),
    date: z.string().datetime(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE']),
    clockIn: z.string().datetime().optional(),
    clockOut: z.string().datetime().optional(),
    reason: z.string(),
  }),
});

const queryFilters = z.object({
  query: z.object({
    employeeId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.string().optional(),
  }),
});

module.exports = {
  clockIn,
  clockOut,
  manualEntry,
  queryFilters,
};
