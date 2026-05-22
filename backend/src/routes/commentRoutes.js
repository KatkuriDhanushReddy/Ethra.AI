import { Router } from 'express';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.js';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/:taskId/comments', getComments);
router.post(
  '/:taskId/comments',
  body('content').trim().notEmpty().withMessage('Content required'),
  validate,
  createComment
);
router.delete('/comments/:id', deleteComment);

export default router;
