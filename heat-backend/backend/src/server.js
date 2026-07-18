const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const prisma = require('./config/prisma');

const server = app.listen(env.port, () => {
  logger.info(`Heat API listening on port ${env.port} [${env.nodeEnv}]`);
  logger.info(`API docs available at http://localhost:${env.port}/api-docs`);
});

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed. Goodbye.');
    process.exit(0);
  });

  // Force exit if shutdown hangs
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});
