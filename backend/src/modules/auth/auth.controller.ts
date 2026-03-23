import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../middlewares/authMiddleware';

// ── Validações simples (sem dependência extra) ─────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CNPJ_REGEX = /^\d{14}$/;

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
  if (cnpj !== undefined && (typeof cnpj !== 'string' || !CNPJ_REGEX.test(cnpj.replace(/\D/g, '')))) {
    return 'CNPJ inválido (deve conter 14 dígitos).';
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

function signRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
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

    const token = signAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
    const refreshToken = signRefreshToken(user.id);

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId },
    });
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ message: 'Não autenticado.' });
      return;
    }

    let payload: { id: string };
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string, {
        algorithms: ['HS256'],
      }) as { id: string };
    } catch {
      res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      res.status(401).json({ message: 'Usuário não encontrado.' });
      return;
    }

    const newAccessToken = signAccessToken({ id: user.id, role: user.role, companyId: user.companyId });
    const newRefreshToken = signRefreshToken(user.id);

    // Rotaciona o refresh token
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ token: newAccessToken });
  } catch {
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
};

export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.json({ message: 'Logout realizado com sucesso.' });
};