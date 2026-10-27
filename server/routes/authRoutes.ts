import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { authRateLimiter } from '../middleware/rateLimiter.ts';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', authenticateToken, getMe);

export default router;
