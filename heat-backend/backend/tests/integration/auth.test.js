/**
 * These tests exercise the full register -> login -> me -> refresh -> logout flow
 * against a real database, so they need TEST_DATABASE_URL (or DATABASE_URL) pointed
 * at a disposable Postgres instance with migrations applied.
 *
 * Run: DATABASE_URL=postgresql://... npx prisma migrate deploy && npm test
 *
 * If no database is reachable, these tests are skipped automatically so the rest
 * of the suite (pure unit tests, validation tests) still runs in CI without infra.
 */
const request = require('supertest');

let dbAvailable = true;
let app;
let prisma;

beforeAll(async () => {
  try {
    prisma = require('../../src/config/prisma');
    await prisma.$connect();
    app = require('../../src/app');
  } catch (err) {
    dbAvailable = false;
  }
});

afterAll(async () => {
  if (dbAvailable && prisma) {
    await prisma.user.deleteMany({ where: { email: 'integration-test@heatapp.com' } });
    await prisma.$disconnect();
  }
});

const maybe = () => (dbAvailable ? describe : describe.skip);

maybe()('Auth flow (requires live DB)', () => {
  const credentials = {
    email: 'integration-test@heatapp.com',
    password: 'Password123!',
    name: 'Integration Tester',
    farmName: 'Test Farm',
  };
  let accessToken;
  let cookies;

  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.accessToken).toBeDefined();
    accessToken = res.body.data.accessToken;
    cookies = res.headers['set-cookie'];
  });

  it('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(credentials);
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: credentials.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: credentials.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('returns the current user for /auth/me with a valid token', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(credentials.email);
  });

  it('refreshes tokens using the refresh cookie', async () => {
    const res = await request(app).post('/api/v1/auth/refresh').set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });
});
