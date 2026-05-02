const { z } = require('zod');

const onboard = z.object({
  body: z.object({
    companyName: z.string().min(2),
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(8),
  }),
});

module.exports = {
  onboard,
};
