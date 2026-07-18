process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

const { computeOestrusLevel } = require('../../src/services/records.service');

describe('computeOestrusLevel', () => {
  it('returns NONE when no signs are observed', () => {
    expect(computeOestrusLevel(0)).toBe('NONE');
  });

  it('returns POSSIBLE for 1-3 signs', () => {
    expect(computeOestrusLevel(1)).toBe('POSSIBLE');
    expect(computeOestrusLevel(3)).toBe('POSSIBLE');
  });

  it('returns HIGH for 4 or more signs', () => {
    expect(computeOestrusLevel(4)).toBe('HIGH');
    expect(computeOestrusLevel(8)).toBe('HIGH');
  });
});
