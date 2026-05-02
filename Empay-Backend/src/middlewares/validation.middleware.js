const { formatResponse } = require('../utils/response.util');

/**
 * Generic validation middleware using Zod
 * @param {import('zod').ZodSchema} schema 
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json(
      formatResponse(false, 'Validation Failed', null, { code: 'VALIDATION_ERROR', details }, req)
    );
  }

  // Replace req data with parsed data (to handle transforms/defaults)
  req.body = result.data.body;
  req.query = result.data.query;
  req.params = result.data.params;

  next();
};

module.exports = validate;
