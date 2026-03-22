import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);
app.use(express.json());

// ── Existing routes ──────────────────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes';
import clientRoutes from './modules/clients/clients.routes';
import productRoutes from './modules/products/products.routes';

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/products', productRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// ── WhatsApp ─────────────────────────────────────────────────────────────────
import { WhatsAppAdapter } from './modules/whatsapp/whatsapp.adapter';
import { handleIncomingMessage } from './modules/whatsapp/whatsapp.controller';
import { createWhatsAppRouter } from './modules/whatsapp/whatsapp.routes';
import { startWorker, setSendFunction } from './modules/whatsapp/whatsapp.worker';

const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH
  ? path.resolve(process.env.WHATSAPP_SESSION_PATH)
  : path.resolve('./whatsapp-session');

const whatsappAdapter = new WhatsAppAdapter(SESSION_PATH);

// Register routes using the adapter singleton
app.use('/api/whatsapp', createWhatsAppRouter(whatsappAdapter));

// ── Server boot ──────────────────────────────────────────────────────────────
app.listen(port, async () => {
  console.log(`🚀 Server is running on port ${port}`);

  // Wire the worker's send function to the adapter
  setSendFunction((jid, text) => whatsappAdapter.sendMessage(jid, text));

  // Start BullMQ worker
  startWorker();

  // Register the message handler and start Baileys
  whatsappAdapter.onMessage(handleIncomingMessage);
  await whatsappAdapter.connect();
});

