import config from '#app/common/config.js';

export function getRedisConnection ({ worker = false } = {}) {
  const redisUrl = config.get('redis.url');
  let parsed;

  try {
    parsed = new URL(redisUrl);
  } catch {
    throw new Error(`Invalid REDIS_URL value: ${redisUrl}`);
  }

  const db = parsed.pathname && parsed.pathname !== '/'
    ? Number.parseInt(parsed.pathname.slice(1), 10)
    : 0;

  if (!Number.isInteger(db) || db < 0) {
    throw new Error(`Invalid Redis database in REDIS_URL: ${redisUrl}`);
  }

  return {
    host: parsed.hostname || '127.0.0.1',
    port: Number(parsed.port || 6379),
    username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
    password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
    db,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
    connectTimeout: 5000,
    enableOfflineQueue: worker,
    maxRetriesPerRequest: worker ? null : 1,
  };
}
