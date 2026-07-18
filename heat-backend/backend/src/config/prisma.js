const { PrismaClient } = require('@prisma/client');
const env = require('./env');

// Reuse a single PrismaClient instance across the app (and across hot-reloads in dev)
// to avoid exhausting DB connections.
const prisma =
  global.__prisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.nodeEnv === 'development') {
  global.__prisma = prisma;
}

module.exports = prisma;
