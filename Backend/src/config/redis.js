const Redis = require('redis');
const logger = require('../utils/logger');

const createRedisClient = () => {
  try {
    const client = Redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          logger.warn('Redis connection refused, continuing without Redis');
          return undefined;
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          return new Error('Retry time exhausted');
        }
        if (options.attempt > 3) {
          logger.warn('Redis connection failed after 3 attempts, continuing without Redis');
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    client.on('connect', () => {
      logger.info('Redis client connected');
    });

    client.on('error', (err) => {
      logger.warn('Redis Client Error:', err);
    });

    return client;
  } catch (error) {
    logger.warn('Failed to create Redis client:', error);
    return null;
  }
};

module.exports = createRedisClient();
