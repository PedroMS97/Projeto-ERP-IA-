import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { revokeToken, isTokenRevoked } from '../../config/redis';

// ── Validações simples (sem dependência extra) ─────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CNPJ_DIGITS_REGEX = /^\d{14}$/;

/**
 * Valida CNPJ com algoritmo de dígitos verificadores (módulo 11).
 * Rejeita sequências repetidas (ex: 00000000000000).
 */
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (!CNPJ_DIGITS_REGEX.test(digits)) return false;
  if (/^(\d)\1+$/.test(digits)) return false; // todos os dígitos iguais

  const calcDigit = (d: string, length: number): number => {
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
      sum += parseInt(d[length - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  if (calcDigit(digits, 12) !== parseInt(digits[12])) return false;
  if (calcDigit(digits, 13) !== parseInt(digits[13])) return false;
  return true;
}

function validateRegisterInput(data: Record<string, unknown>): string | null {
  const { name, email, password, companyName, cnpj } = data;
  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
    return 'Nome deve ter entre 2 e 100 caracteres.';
  }
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email) || email.length > 255) {
    return 'E-mail inválido.';
  }
  if (!password || typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'Senha deve ter entre 8 e 128 caracteres.';
  }
  if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2 || companyName.length > 150) {
    return 'Nome da empresa deve ter entre 2 e 150 caracteres.';
  }
  if (cnpj !== undefined) {
    if (typeof cnpj !== 'string' || !isValidCNPJ(cnpj)) {
      return 'CNPJ inválido.';
    }
  }
  return null;
}

function validateLoginInput(data: Record<string, unknown>): string | null {
  const { email, password } = data;
  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    return 'E-mail inválido.';
  }
  if (!password || typeof password !== 'string' || password.length < 1 || password.length > 128) {
    return 'Senha inválida.';
  }
  return null;
}

function signAccessToken(payload: { id: string; role: string; companyId: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
    algorithm: 'HS256',
  });
}

const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 dias em segundos

function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = crypto.randomUUID();
  const token = jwt.sign({ id: userId, jti }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
  return { token, jti };
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateRegisterInput(req.body);
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const { name, email, password, companyName, cnpj } = req.body as Record<string, string>;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : undefined;

    let company = normalizedCnpj
      ? await prisma.company.findUnique({ where: { cnpj: normalizedCnpj } })
      : null;

    if (!company) {
      company = await prisma.company.create({
        data: { name: companyName.trim(), cnpj: normalizedCnpj ?? '' },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(400).json({ message: 'Usuário já cadastrado.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
      },
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso.', userId: user.id });
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationError = validateLoginInput(req.body);
    if (validationError) {
      res.status(400).json({ message: 'Credenciais inválidas.' });
      return;
    }

    const { email, password } = req.body as Record<string, string>;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    // Mensagem genérica para não revelar se email existe
    if (!user) {
      res.status(401).json({ message: 'Credenciais inválidas.' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Credenciais inválidas.' });
      return;
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
    const { token: refreshToken } = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      token: accessToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    });
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.refreshToken as string | undefined;
    if (!rawToken) {
      res.status(401).json({ message: 'Não autenticado.' });
      return;
    }

    let payload: { id: string; jti: string };
    try {
      payload = jwt.verify(rawToken, process.env.JWT_REFRESH_SECRET as string, {
        algorithms: ['HS256'],
      }) as { id: string; jti: string };
    } catch {
      res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    // Verifica se o token foi revogado (logout ou rotação anterior)
    if (!payload.jti || await isTokenRevoked(payload.jti)) {
      res.status(401).json({ message: 'Sessão inválida. Faça login novamente.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      res.status(401).json({ message: 'Usuário não encontrado.' });
      return;
    }

    // Revoga o token atual antes de emitir o novo (rotação segura)
    const decoded = jwt.decode(rawToken) as { exp?: number } | null;
    const remainingTtl = decoded?.exp ? Math.max(decoded.exp - Math.floor(Date.now() / 1000), 1) : REFRESH_TOKEN_TTL_SECONDS;
    await revokeToken(payload.jti, remainingTtl);

    const newAccessToken = signAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
    const { token: newRefreshToken } = signRefreshToken(user.id);

    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({ token: newAccessToken });
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawToken = req.cookies?.refreshToken as string | undefined;
    if (rawToken) {
      try {
        const payload = jwt.decode(rawToken) as { jti?: string; exp?: number } | null;
        if (payload?.jti) {
          const remainingTtl = payload.exp ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 1) : REFRESH_TOKEN_TTL_SECONDS;
          await revokeToken(payload.jti, remainingTtl);
        }
      } catch {
        // Ignora erros ao revogar — o cookie será limpo de qualquer forma
      }
    }
  } finally {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.json({ message: 'Logout realizado com sucesso.' });
  }
};
