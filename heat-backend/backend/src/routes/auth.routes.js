const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const schemas = require('../validators/auth.validator');

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new farmer account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *               name: { type: string }
 *               farmName: { type: string }
 *     responses:
 *       201: { description: Account created }
 *       409: { description: Email already registered }
 */
router.post('/register', authLimiter, validate({ body: schemas.register }), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Log in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: Logged in }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate({ body: schemas.login }), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new access token
 *     responses:
 *       200: { description: New tokens issued }
 *       401: { description: Invalid refresh token }
 */
router.post('/refresh', validate({ body: schemas.refresh }), controller.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the current refresh token
 *     responses:
 *       200: { description: Logged out }
 */
router.post('/logout', controller.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the current authenticated user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, controller.me);

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset token
 *     responses:
 *       200: { description: Reset email sent (if account exists) }
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate({ body: schemas.forgotPassword }),
  controller.forgotPassword
);

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using a valid reset token
 *     responses:
 *       200: { description: Password reset }
 *       400: { description: Invalid or expired token }
 */
router.post('/reset-password', validate({ body: schemas.resetPassword }), controller.resetPassword);

/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags: [Auth]
 *     summary: Verify email address using a verification token
 *     responses:
 *       200: { description: Email verified }
 */
router.post('/verify-email', validate({ body: schemas.verifyEmail }), controller.verifyEmail);

module.exports = router;
