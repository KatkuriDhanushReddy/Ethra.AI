import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markAsRead);

export default router;
