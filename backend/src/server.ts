import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Validação de variáveis de ambiente obrigatórias
const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    console.error(`[FATAL] Variável de ambiente obrigatória ausente: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const port = process.env.PORT || 3000;

// Origens permitidas — configure via env em produção
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
  }),
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origem (ex: ferramentas CLI/mobile em dev)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

// Rate Limiting geral
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});
app.use(limiter);

// Rate Limiting estrito para autenticação (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
});

app.use(express.json({ limit: '1mb' }));

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

