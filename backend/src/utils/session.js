import crypto from 'node:crypto';
import { redisClient, redisEnabled } from '../config/redis.js';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const sessionKey = (sessionId) => `auth:session:${sessionId}`;

export const createSession = async (userId) => {
  if (!redisEnabled || !redisClient) {
    throw new Error('Redis is required for application sessions');
  }

  const sessionId = crypto.randomUUID();
  await redisClient.set(sessionKey(sessionId), JSON.stringify({ userId }), { ex: SESSION_TTL_SECONDS });
  return sessionId;
};

export const getSession = async (sessionId) => {
  if (!sessionId || !redisEnabled || !redisClient) return null;
  const session = await redisClient.get(sessionKey(sessionId));
  if (!session) return null;
  return typeof session === 'string' ? JSON.parse(session) : session;
};

export const deleteSession = async (sessionId) => {
  if (sessionId && redisEnabled && redisClient) {
    await redisClient.del(sessionKey(sessionId));
  }
};
