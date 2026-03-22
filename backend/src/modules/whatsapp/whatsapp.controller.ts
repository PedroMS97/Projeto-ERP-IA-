/**
 * whatsapp.controller.ts
 *
 * Thin controller: receives messages from the adapter and enqueues them
 * into BullMQ. No business logic lives here.
 */

import { IncomingMessage } from './whatsapp.adapter';
import { messageQueue, WhatsAppMessageJob } from './whatsapp.queue';

const DEFAULT_COMPANY_ID = process.env.WHATSAPP_DEFAULT_COMPANY_ID || '';

export async function handleIncomingMessage(msg: IncomingMessage): Promise<void> {
  const jobData: WhatsAppMessageJob = {
    jid: msg.jid,
    text: msg.text,
    pushName: msg.pushName,
    companyId: DEFAULT_COMPANY_ID,
    receivedAt: new Date().toISOString(),
  };

  await messageQueue.add('inbound', jobData, { priority: 1 });
}
