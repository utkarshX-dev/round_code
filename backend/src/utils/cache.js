import { isRedisReady, redisClient } from '../config/redis.js';

const leaderboardCacheKeys = [
  'leaderboard:all-time',
  'leaderboard:weekly',
];

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

  const value = await loader();

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
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
    const monthlyKeys = await redisClient.keys('leaderboard:monthly:*');
    const keys = [...leaderboardCacheKeys, ...monthlyKeys];

    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    console.error('Redis leaderboard cache clear failed:', error.message);
  }
}
