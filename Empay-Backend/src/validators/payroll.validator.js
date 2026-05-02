const { z } = require('zod');

const createPayrun = z.object({
  body: z.object({
    name: z.string().min(3),
    month: z.number().min(1).max(12),
    year: z.number().min(2020),
    notes: z.string().optional(),
  }),
});

const updateSalaryStructure = z.object({
  params: z.object({
    userId: z.string(),
  }),
  body: z.any(),
});

module.exports = {
  createPayrun,
  updateSalaryStructure,
};
