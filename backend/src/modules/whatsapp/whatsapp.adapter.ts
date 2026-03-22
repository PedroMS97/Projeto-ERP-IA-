/**
 * whatsapp.adapter.ts
 *
 * Isolates Baileys from the rest of the application.
 * Handles: connection, session persistence, reconnection with exponential backoff,
 * QR code generation, and sending messages.
 */

import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as fs from 'fs';
import * as path from 'path';
import pino from 'pino';

const logger = pino({ level: 'silent' }); // suppress Baileys internal logs

export interface IncomingMessage {
  jid: string;       // sender phone number (e.g. 5511999999999@s.whatsapp.net)
  text: string;      // message plain text
  pushName: string;  // sender display name
}

export type MessageHandler = (msg: IncomingMessage) => Promise<void> | void;
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export class WhatsAppAdapter {
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private qrCode: string | null = null;
  private status: ConnectionStatus = 'disconnected';
  private messageHandlers: MessageHandler[] = [];
  private reconnectAttempts = 0;
  private readonly maxReconnectDelay = 60_000;
  private readonly sessionPath: string;
  private isShuttingDown = false;

  constructor(sessionPath: string) {
    this.sessionPath = sessionPath;
    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
  }

  getQRCode(): string | null { return this.qrCode; }
  getStatus(): ConnectionStatus { return this.status; }

  async sendMessage(jid: string, text: string): Promise<void> {
    if (!this.sock) throw new Error('WhatsApp not connected');
    await this.sock.sendMessage(jid, { text });
  }

  async disconnect(): Promise<void> {
    this.isShuttingDown = true;
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
    }
    this.status = 'disconnected';
  }

  async connect(): Promise<void> {
    this.status = 'connecting';

    const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      logger,
      printQRInTerminal: false,
      browser: ['CRM Bot', 'Chrome', '1.0.0'],
    });

    // ── Connection updates ────────────────────────────────────────────────────
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCode = qr;
        console.log('[WhatsApp] Scan QR code via GET /api/whatsapp/qrcode');
      }

      if (connection === 'open') {
        this.reconnectAttempts = 0;
        this.qrCode = null;
        this.status = 'connected';
        console.log('[WhatsApp] Connected successfully ✅');
      }

      if (connection === 'close') {
        this.status = 'disconnected';
        const boom = lastDisconnect?.error as Boom | undefined;
        const code = boom?.output?.statusCode;
        const loggedOut = code === DisconnectReason.loggedOut;

        if (loggedOut) {
          console.log('[WhatsApp] Logged out. Delete session folder and restart to reconnect.');
          return;
        }

        if (!this.isShuttingDown) {
          const delay = Math.min(2 ** this.reconnectAttempts * 2_000, this.maxReconnectDelay);
          this.reconnectAttempts++;
          console.log(`[WhatsApp] Disconnected. Reconnecting in ${delay / 1000}s… (attempt ${this.reconnectAttempts})`);
          setTimeout(() => this.connect(), delay);
        }
      }
    });

    // ── Persist credentials ───────────────────────────────────────────────────
    this.sock.ev.on('creds.update', saveCreds);

    // ── Incoming messages ─────────────────────────────────────────────────────
    this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return;

      for (const msg of messages) {
        if (msg.key.fromMe || !msg.message) continue;

        const jid = msg.key.remoteJid;
        if (!jid) continue;

        const text =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          '';

        if (!text.trim()) continue;

        const incoming: IncomingMessage = {
          jid,
          text: text.trim(),
          pushName: msg.pushName ?? '',
        };

        for (const handler of this.messageHandlers) {
          try {
            await handler(incoming);
          } catch (err) {
            console.error('[WhatsApp] Handler error:', err);
          }
        }
      }
    });

    console.log('[WhatsApp] Adapter initialized, waiting for connection...');
  }
}
