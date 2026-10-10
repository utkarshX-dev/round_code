import { createClient } from 'redis';
import { Redis as UpstashRedis } from '@upstash/redis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL;
const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redisEnabled = Boolean(redisUrl || (upstashUrl && upstashToken));
export const redisType = upstashUrl && upstashToken ? 'upstash' : 'redis';

export const redisClient = upstashUrl && upstashToken
  ? new UpstashRedis({ url: upstashUrl, token: upstashToken })
  : redisUrl
    ? createClient({ url: redisUrl })
    : null;

if (redisClient && redisType === 'redis') {
  redisClient.on('error', (error) => {
    console.error('Redis error:', error.message);
  });
}

export function isRedisReady() {
  return redisType === 'upstash' ? redisEnabled : Boolean(redisClient?.isReady);
}

export async function connectRedis() {
  if (!redisClient || (redisType === 'redis' && redisClient.isOpen)) {
    return;
  }

  try {
    if (redisType === 'upstash') {
      await redisClient.ping();
    } else {
      await redisClient.connect();
    }
    console.log('✅ Redis connection ready');
  } catch (error) {
    console.error('Redis connection failed; continuing without Redis:', error.message);
  }
}

export async function disconnectRedis() {
  if (redisType === 'redis' && redisClient?.isOpen) {
    await redisClient.quit();
  }
}
