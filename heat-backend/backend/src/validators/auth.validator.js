const { z } = require('zod');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[0-9]/, 'Password must contain a number');

const register = z.object({
  email: z.string().email(),
  password: passwordSchema,
  name: z.string().min(1, 'Name is required'),
  farmName: z.string().optional(),
});

const login = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refresh = z.object({
  refreshToken: z.string().min(1).optional(), // may also arrive via httpOnly cookie
});

const forgotPassword = z.object({
  email: z.string().email(),
});

const resetPassword = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

const verifyEmail = z.object({
  token: z.string().min(1),
});

module.exports = { register, login, refresh, forgotPassword, resetPassword, verifyEmail };
