const crypto = require('crypto');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { hashPassword, comparePassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    farmName: user.farmName,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt,
  };
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id });

  const decoded = verifyRefreshToken(refreshToken);
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return { accessToken, refreshToken };
}

async function register({ email, password, name, farmName }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await hashPassword(password);
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: { email, passwordHash, name, farmName, emailVerifyToken },
  });

  const tokens = await issueTokenPair(user);
  // In production: send verification email containing emailVerifyToken here.
  return { user: toPublicUser(user), ...tokens };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const tokens = await issueTokenPair(user);
  return { user: toPublicUser(user), ...tokens };
}

async function refresh(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('Refresh token required');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Refresh token is no longer valid');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw ApiError.unauthorized('User no longer exists');

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const tokens = await issueTokenPair(user);
  return { user: toPublicUser(user), ...tokens };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true },
  });
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond success (don't leak whether an email exists)
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpires },
  });

  // In production: send email containing resetToken here.
  return resetToken;
}

async function resetPassword({ token, password }) {
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpires: { gt: new Date() } },
  });
  if (!user) throw ApiError.badRequest('Invalid or expired reset token');

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpires: null },
  });

  // Invalidate all existing refresh tokens for safety
  await prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } });
}

async function verifyEmail(token) {
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) throw ApiError.badRequest('Invalid verification token');

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  toPublicUser,
};
