/**
 * whatsapp.queue.ts
 *
 * BullMQ queue setup.
 * Passes the Redis URL string directly to BullMQ to avoid version conflicts
 * between the IORedis shipped with BullMQ and any top-level IORedis install.
 */

import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse redis URL into host/port for BullMQ connection object
function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || '127.0.0.1',
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      db: parsed.pathname ? parseInt(parsed.pathname.replace('/', '') || '0', 10) : 0,
    };
  } catch {
    return { host: '127.0.0.1', port: 6379 };
  }
}

export const redisConnectionOptions = {
  ...parseRedisUrl(REDIS_URL),
  maxRetriesPerRequest: null as null,
  enableReadyCheck: false,
};

export const QUEUE_NAME = 'whatsapp-messages';

export interface WhatsAppMessageJob {
  jid: string;
  text: string;
  pushName: string;
  companyId: string;
  receivedAt: string; // ISO string
}

export const messageQueue = new Queue<WhatsAppMessageJob>(QUEUE_NAME, {
  connection: redisConnectionOptions,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2_000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 100 },
  },
});

messageQueue.on('error', (err) => {
  console.error('[Redis/BullMQ] Queue error:', err.message);
});
