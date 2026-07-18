const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const catchAsync = require('../utils/catchAsync');

/**
 * Requires a valid Bearer access token. Attaches req.user = { id, email, role }.
 */
const authenticate = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw ApiError.unauthorized('User no longer exists');
  }

  req.user = { id: user.id, email: user.email, role: user.role };
  next();
});

/**
 * Restricts access to specific roles. Use after `authenticate`.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to perform this action'));
  }
  next();
};

module.exports = { authenticate, authorize };
