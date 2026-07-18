module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
};
