process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../../src/utils/jwt');

describe('jwt utils', () => {
  it('signs and verifies an access token round-trip', () => {
    const token = signAccessToken({ sub: 'user-1', role: 'FARMER' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('FARMER');
  });

  it('signs and verifies a refresh token round-trip', () => {
    const token = signRefreshToken({ sub: 'user-1' });
    const payload = verifyRefreshToken(token);
    expect(payload.sub).toBe('user-1');
  });

  it('rejects an access token when verified with the refresh verifier', () => {
    const token = signAccessToken({ sub: 'user-1' });
    expect(() => verifyRefreshToken(token)).toThrow();
  });

  it('throws on a tampered token', () => {
    const token = signAccessToken({ sub: 'user-1' });
    expect(() => verifyAccessToken(`${token}tampered`)).toThrow();
  });
});
