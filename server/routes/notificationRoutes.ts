import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

export default router;
