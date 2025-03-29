const morgan = require('morgan');
const logger = require('../utils/logger');

// Create custom Morgan token for request body
morgan.token('body', (req) => {
  const body = { ...req.body };
  
  // Remove sensitive information
  if (body.password) body.password = '[REDACTED]';
  if (body.otp) body.otp = '[REDACTED]';
  
  return JSON.stringify(body);
});

// Create custom format
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :body';

const requestLogger = morgan(morganFormat, {
  stream: logger.stream,
  skip: (req) => {
    // Skip logging for health check endpoints
    return req.url === '/health';
  }
});

module.exports = requestLogger;
