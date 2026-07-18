const { createClient } = require('redis');
const env = require('./env');
const logger = require('../utils/logger');

let client = null;

async function getRedisClient() {
  if (!env.redis.enabled) return null;
  if (client) return client;

  client = createClient({ url: env.redis.url });
  client.on('error', (err) => logger.error({ err }, 'Redis client error'));

  try {
    await client.connect();
    logger.info('Connected to Redis');
  } catch (err) {
    logger.warn({ err }, 'Redis connection failed - continuing without cache');
    client = null;
  }

  return client;
}

module.exports = { getRedisClient };
