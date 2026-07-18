/**
 * Wraps an async Express route handler so rejected promises are forwarded
 * to next(err) instead of causing an unhandled rejection.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
