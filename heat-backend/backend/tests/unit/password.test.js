const { hashPassword, comparePassword } = require('../../src/utils/password');

describe('password utils', () => {
  it('hashes a password to a bcrypt hash different from the plaintext', async () => {
    const hash = await hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('correctly verifies a matching password', async () => {
    const hash = await hashPassword('Password123!');
    await expect(comparePassword('Password123!', hash)).resolves.toBe(true);
  });

  it('rejects a non-matching password', async () => {
    const hash = await hashPassword('Password123!');
    await expect(comparePassword('WrongPassword1', hash)).resolves.toBe(false);
  });
});
