const morgan = require('morgan');
const logger = require('../utils/logger.util');

const stream = {
  write: (message) => logger.http(message.trim()),
};

const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

const loggerMiddleware = morgan(
  ':id :method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

morgan.token('id', (req) => req.id);

module.exports = loggerMiddleware;
