/**
 * whatsapp.parser.ts
 *
 * This file now just acts as a routing layer to the AI Agent.
 * The legacy regex logic has been removed to allow the virtual
 * ERP assistant to handle all intents intelligently.
 */

import { parseWithAI, AgentResponse } from './whatsapp.ai';

export async function parseCommand(text: string): Promise<AgentResponse> {
  const raw = text.trim();
  console.log(`[Parser] Routing "${raw}" to AI Virtual Assistant...`);
  return await parseWithAI(raw);
}
