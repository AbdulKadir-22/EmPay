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
  body: z.object({
    baseSalary: z.number().min(0),
    allowances: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0),
      isTaxable: z.boolean().optional(),
    })).optional(),
    deductions: z.array(z.object({
      name: z.string(),
      amount: z.number().min(0),
      isStatutory: z.boolean().optional(),
    })).optional(),
    pfEnabled: z.boolean().optional(),
    taxEnabled: z.boolean().optional(),
    effectiveFrom: z.string().datetime(),
  }),
});

module.exports = {
  createPayrun,
  updateSalaryStructure,
};
