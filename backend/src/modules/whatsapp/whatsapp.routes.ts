/**
 * whatsapp.routes.ts
 *
 * HTTP management endpoints for the WhatsApp integration.
 * Auth middleware is applied so only authenticated users can manage the connection.
 */

import { Router, Request, Response } from 'express';
import QRCode from 'qrcode';
import { WhatsAppAdapter } from './whatsapp.adapter';
import { authenticate } from '../../middlewares/authMiddleware';

export function createWhatsAppRouter(adapter: WhatsAppAdapter): Router {
  const router = Router();

  // GET /api/whatsapp/qrcode/image — restrito a usuários autenticados
  router.get('/qrcode/image', authenticate, async (_req: Request, res: Response) => {
    const qr = adapter.getQRCode();

    if (!qr) {
      res.send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:40px">
          <h2>✅ WhatsApp já está conectado!</h2>
          <p>Nenhum QR code necessário.</p>
          <script>setTimeout(() => location.reload(), 3000);</script>
        </body></html>
      `);
      return;
    }

    const dataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
    res.send(`
      <html>
        <head><title>WhatsApp QR Code</title></head>
        <body style="font-family:sans-serif;text-align:center;padding:40px;background:#f9f9f9">
          <h2>📱 Escaneie o QR Code com o WhatsApp</h2>
          <p>Vá em <b>WhatsApp → Dispositivos Vinculados → Vincular um dispositivo</b></p>
          <img src="${dataUrl}" style="border:4px solid #25D366;border-radius:12px;padding:8px;background:white" />
          <p style="color:#888;font-size:14px">Página atualiza automaticamente a cada 5 segundos</p>
          <script>setTimeout(() => location.reload(), 5000);</script>
        </body>
      </html>
    `);
  });

  // GET /api/whatsapp/status
  router.get('/status', authenticate, (_req: Request, res: Response) => {
    const status = adapter.getStatus();
    const qr = adapter.getQRCode();
    res.json({
      status,
      qrCode: qr
        ? `data:image/png;base64,${Buffer.from(qr).toString('base64')}`
        : null,
      qrRaw: qr ?? null,
    });
  });

  // GET /api/whatsapp/qrcode (raw QR string for custom renderers)
  router.get('/qrcode', authenticate, (_req: Request, res: Response) => {
    const qr = adapter.getQRCode();
    if (!qr) {
      res.json({ connected: true, message: 'Already connected — no QR code needed.' });
      return;
    }
    res.json({ qrRaw: qr });
  });

  // POST /api/whatsapp/disconnect
  router.post('/disconnect', authenticate, async (_req: Request, res: Response) => {
    try {
      await adapter.disconnect();
      res.json({ message: 'Disconnected successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to disconnect.', error: String(err) });
    }
  });

  return router;
}
