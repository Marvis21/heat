const env = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

/**
 * Catches requests that didn't match any route.
 */
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Converts known error types (Prisma, JWT, etc.) into ApiError so the
 * response shape is always consistent.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Prisma known request errors (e.g. unique constraint violation)
  if (err.code === 'P2002') {
    const field = (err.meta && err.meta.target) || 'field';
    return ApiError.conflict(`A record with this ${field} already exists`);
  }
  if (err.code === 'P2025') {
    return ApiError.notFound('Record not found');
  }
  if (err.code && err.code.startsWith('P')) {
    return ApiError.badRequest('Database request error', err.message);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Invalid or expired token');
  }

  if (err.type === 'entity.too.large') {
    return ApiError.badRequest('Payload too large');
  }

  if (err.name === 'MulterError') {
    return ApiError.badRequest(`File upload error: ${err.message}`);
  }

  return ApiError.internal(env.nodeEnv === 'production' ? 'Internal server error' : err.message);
}

// eslint-disable-next-line no-unused-vars
function globalErrorHandler(err, req, res, next) {
  const apiError = normalizeError(err);

  if (!apiError.isOperational) {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unexpected error');
  } else {
    logger.warn(
      { statusCode: apiError.statusCode, path: req.originalUrl, method: req.method, message: apiError.message },
      'Handled API error'
    );
  }

  res.status(apiError.statusCode).json({
    success: false,
    error: {
      message: apiError.message,
      details: apiError.details || undefined,
      ...(env.nodeEnv !== 'production' && !apiError.isOperational ? { stack: err.stack } : {}),
    },
  });
}

module.exports = { notFoundHandler, globalErrorHandler };
