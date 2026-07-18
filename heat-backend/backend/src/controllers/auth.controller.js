const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth',
  });
}

const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 201, { user: result.user, accessToken: result.accessToken });
});

const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, { user: result.user, accessToken: result.accessToken });
});

const refresh = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
  const result = await authService.refresh(token);
  setRefreshCookie(res, result.refreshToken);
  sendSuccess(res, 200, { user: result.user, accessToken: result.accessToken });
});

const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME] || req.body.refreshToken;
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  sendSuccess(res, 200, { message: 'Logged out successfully' });
});

const me = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { user: req.user });
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, 200, {
    message: 'If an account with that email exists, a reset link has been sent.',
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, 200, { message: 'Password has been reset successfully' });
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  sendSuccess(res, 200, { message: 'Email verified successfully' });
});

module.exports = { register, login, refresh, logout, me, forgotPassword, resetPassword, verifyEmail };
