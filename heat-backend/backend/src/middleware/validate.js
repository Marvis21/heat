const ApiError = require('../utils/ApiError');

/**
 * Validates req.body / req.query / req.params against Zod schemas.
 * Usage: validate({ body: mySchema })
 */
const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) {
      req.body = schemas.body.parse(req.body);
    }
    if (schemas.query) {
      req.query = schemas.query.parse(req.query);
    }
    if (schemas.params) {
      req.params = schemas.params.parse(req.params);
    }
    next();
  } catch (err) {
    const details = err.errors
      ? err.errors.map((e) => ({ path: e.path.join('.'), message: e.message }))
      : err.message;
    next(ApiError.badRequest('Validation failed', details));
  }
};

module.exports = validate;
