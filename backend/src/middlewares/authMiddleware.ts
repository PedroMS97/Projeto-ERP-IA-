import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: string;
  role: 'ADMIN' | 'VENDEDOR' | 'GERENTE';
  companyId: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Não autenticado.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ['HS256'],
    }) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

/**
 * Restringe acesso a usuários com uma das roles informadas.
 * Deve ser usado APÓS o middleware `authenticate`.
 */
export const requireRole = (...roles: Array<'ADMIN' | 'VENDEDOR' | 'GERENTE'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Acesso negado. Permissão insuficiente.' });
      return;
    }
    next();
  };
};