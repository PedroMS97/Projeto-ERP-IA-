import { Router } from 'express';
import { register, login, refreshToken, logout } from './auth.controller';
import { authLimiter } from '../../server';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

export default router;
