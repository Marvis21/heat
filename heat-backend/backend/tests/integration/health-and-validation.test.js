process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';

const request = require('supertest');
const app = require('../../src/app');

describe('GET /api/v1/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });
});

describe('GET /api/v1/unknown-route', () => {
  it('returns a 404 in the standard error envelope', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toMatch(/Route not found/);
  });
});

describe('POST /api/v1/auth/register validation', () => {
  it('rejects a weak password before touching the database', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'farmer@example.com',
      password: 'weak',
      name: 'Test Farmer',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toBe('Validation failed');
  });

  it('rejects an invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'Password123',
      name: 'Test Farmer',
    });
    expect(res.status).toBe(400);
  });
});

describe('Protected routes without a token', () => {
  it('rejects /animals with 401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/v1/animals');
    expect(res.status).toBe(401);
  });

  it('rejects /dashboard/summary with 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });
});
