/**
 * whatsapp.worker.ts
 *
 * BullMQ worker that consumes the "whatsapp-messages" queue.
 * Each job: parse command via AI → call service if needed → reply.
 */

import { Worker } from 'bullmq';
import { redisConnectionOptions, QUEUE_NAME, WhatsAppMessageJob } from './whatsapp.queue';
import { parseCommand } from './whatsapp.parser';
import * as InventoryService from './whatsapp.service';

let sendFn: ((jid: string, text: string) => Promise<void>) | null = null;

export function setSendFunction(fn: (jid: string, text: string) => Promise<void>) {
  sendFn = fn;
}

async function safeSend(jid: string, text: string) {
  if (!sendFn) {
    // LGPD: não logar jid (número de telefone)
    console.warn('[Worker] sendFn não configurado — não foi possível responder.');
    return;
  }
  try {
    await sendFn(jid, text);
  } catch (err) {
    console.error('[Worker] Falha ao enviar mensagem:', (err as Error).message);
  }
}

export function startWorker() {
  const worker = new Worker<WhatsAppMessageJob>(
    QUEUE_NAME,
    async (job) => {
      const { jid, text, companyId } = job.data;
      // LGPD: não logar jid (telefone), pushName (nome) nem conteúdo da mensagem
      console.log(`[Worker] Processando job ${job.id}`);

      if (!companyId) {
        await safeSend(jid, '⚠️ Sistema não configurado. Defina WHATSAPP_DEFAULT_COMPANY_ID no servidor.');
        return;
      }

      // Limitar tamanho do texto para evitar DoS / abuso de IA
      const safeText = text.slice(0, 500);

      // 1. Send to AI
      const cmd = await parseCommand(safeText);
      console.log(`[Worker] AI Action: ${cmd.action} (Confidence: ${cmd.confidence})`);

      // 2. Decide response based on Action
      let finalReply = cmd.message; // Default fallback to AI's natural reply

      try {
        if (cmd.confidence < 0.8 && cmd.action !== 'REPLY_ONLY' && cmd.action !== 'UNKNOWN') {
          finalReply = `🤔 Não tenho certeza se entendi direito (Confiança baixa). Pode reescrever de outra forma?`;
        } else {
          switch (cmd.action) {
            case 'ADD_STOCK': {
              const qty = parseInt(String(cmd.data?.quantidade), 10);
              if (cmd.data?.produto && !isNaN(qty) && qty > 0 && qty <= 999_999) {
                const res = await InventoryService.processEntry(companyId, cmd.data.produto, qty, jid, cmd.data.tamanho);
                finalReply = cmd.message + '\n\n' + res.message;
              } else if (cmd.data?.produto) {
                finalReply = `⚠️ Quantidade inválida. Informe um número inteiro entre 1 e 999.999.`;
              }
              break;
            }

            case 'REMOVE_STOCK':
            case 'ADD_SALE': {
              const qty = parseInt(String(cmd.data?.quantidade), 10);
              if (cmd.data?.produto && !isNaN(qty) && qty > 0 && qty <= 999_999) {
                const res = await InventoryService.processExit(companyId, cmd.data.produto, qty, jid, cmd.data.tamanho);
                finalReply = cmd.message + '\n\n' + res.message;
              } else if (cmd.data?.produto) {
                finalReply = `⚠️ Quantidade inválida. Informe um número inteiro entre 1 e 999.999.`;
              }
              break;
            }

            case 'CHECK_STOCK':
              if (cmd.data?.produto) {
                const res = await InventoryService.queryStock(companyId, cmd.data.produto, cmd.data.tamanho);
                finalReply = res.message;
              }
              break;

            case 'ADD_EXPENSE':
            case 'CHECK_CASH_FLOW':
            case 'TOP_PRODUCTS':
            case 'LOW_STOCK_ALERT':
            case 'SUPPLIER_ORDER':
              finalReply = cmd.message + '\n\n*(Nota: Essa função financeira/analítica ainda não está conectada ao banco de dados, mas entendi seu comando!)*';
              break;

            case 'REPLY_ONLY':
            case 'UNKNOWN':
            default:
              finalReply = cmd.message;
              break;
          }
        }
      } catch (e) {
        console.error('[Worker] Erro ao executar ação no banco:', (e as Error).message);
        finalReply = '❌ Ocorreu um erro interno ao processar sua solicitação no sistema.';
      }

      await safeSend(jid, finalReply);
    },
    {
      connection: redisConnectionOptions,
      concurrency: 5,
    },
  );

  worker.on('completed', (_job) => console.log('[Worker] Job concluído.'));
  worker.on('failed', (_job, err) => console.error('[Worker] Job falhou:', err?.message));

  console.log('[BullMQ] Worker started');
  return worker;
}