import { Router } from 'express';
import { getUsers, getUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/', getUsers);
router.get('/:id', getUser);

export default router;
