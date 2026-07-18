const ApiError = require('../../src/utils/ApiError');

describe('ApiError', () => {
  it('builds a 400 badRequest error with details', () => {
    const err = ApiError.badRequest('Bad input', { field: 'email' });
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Bad input');
    expect(err.details).toEqual({ field: 'email' });
    expect(err.isOperational).toBe(true);
  });

  it('builds a 401 unauthorized error with default message', () => {
    const err = ApiError.unauthorized();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('builds a 404 notFound error', () => {
    const err = ApiError.notFound('Animal not found');
    expect(err.statusCode).toBe(404);
  });

  it('marks internal errors as non-operational', () => {
    const err = ApiError.internal();
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(false);
  });
});
