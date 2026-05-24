const config = require('../config');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * Handles various error types: Joi validation, Prisma, and general errors
 * Must be registered as the last middleware in app.js
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Request error', config.isDevelopment ? err.message : 'Internal error');
  if (config.isDevelopment && err.stack) {
    logger.debug(err.stack);
  }

  // Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({ error: err.message });
  }

  // Prisma errors
  if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
    return res.status(400).json({ error: 'Database error: ' + err.message });
  }

  // MongoDB errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  // Default error response
  res.status(err.status || 500).json({
    error: config.isDevelopment ? err.message : 'Internal server error',
  });
};

module.exports = errorHandler;
