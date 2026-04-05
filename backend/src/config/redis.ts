/**
 * redis.ts
 *
 * Shared Redis client for application-level use (e.g., token blacklist).
 * Separate from BullMQ's internal ioredis instance to avoid conflicts.
 */

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
});

/** Marca um jti de refresh token como revogado até o TTL expirar. */
export async function revokeToken(jti: string, ttlSeconds: number): Promise<void> {
  await redisClient.set(`revoked:${jti}`, '1', 'EX', ttlSeconds);
}

/** Retorna true se o jti estiver na blacklist. */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  const val = await redisClient.get(`revoked:${jti}`);
  return val !== null;
}
