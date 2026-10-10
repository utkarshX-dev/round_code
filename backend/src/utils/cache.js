import { isRedisReady, redisClient } from '../config/redis.js';

const leaderboardCacheKeys = [
  'leaderboard:all-time',
  'leaderboard:all-time:v2',
  'leaderboard:weekly',
];
const inFlightLoads = new Map();

export async function getOrSetCache(key, loader, ttlSeconds) {
  if (!isRedisReady()) {
    return loader();
  }

  let cachedValue;
  try {
    cachedValue = await redisClient.get(key);
  } catch (error) {
    console.error(`Redis cache failed for "${key}":`, error.message);
  }

  if (cachedValue) {
    try {
      return typeof cachedValue === 'string'
        ? JSON.parse(cachedValue)
        : cachedValue;
    } catch (error) {
      console.error(`Redis cache contained invalid JSON for "${key}":`, error.message);
    }
  }

  let load = inFlightLoads.get(key);
  if (!load) {
    load = Promise.resolve().then(loader);
    inFlightLoads.set(key, load);
  }

  let value;
  try {
    value = await load;
  } finally {
    if (inFlightLoads.get(key) === load) {
      inFlightLoads.delete(key);
    }
  }

  try {
    await redisClient.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.error(`Redis cache write failed for "${key}":`, error.message);
  }

  return value;
}

export async function clearLeaderboardCache() {
  if (!isRedisReady()) {
    return;
  }

  try {
    // Keep invalidation bounded. Redis KEYS can block the server on a large
    // database, while the monthly cache has a short TTL and will expire naturally.
    const keys = leaderboardCacheKeys;

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis leaderboard cache clear failed:', error.message);
  }
}
