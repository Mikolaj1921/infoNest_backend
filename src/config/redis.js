const { createClient } = require('redis');
const { RedisStore } = require('rate-limit-redis');
const config = require('./index');

let redisClient = null;
let redisStore = null;

// ua: ініт Redis тільки якщо ввімкнено в .env
if (process.env.USE_REDIS === 'true' && config.REDIS_URL) {
  redisClient = createClient({
    url: config.REDIS_URL,
  });

  redisClient.on('error', (err) =>
    console.warn('Redis Client Error:', err.message),
  );

  redisClient
    .connect()
    .then(() => console.log('Redis connected successfully'))
    .catch((err) => console.warn('Redis connection failed:', err.message));

  redisStore = new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  });
}

module.exports = { redisStore };
