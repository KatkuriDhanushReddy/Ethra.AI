import { Router } from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskValidator, updateTaskValidator } from '../validators/taskValidators.js';

const router = Router();

router.use(protect);

router.get('/', getTasks);
router.patch('/reorder/status', reorderTasks);
router.get('/:id', getTask);
router.post('/', createTaskValidator, validate, createTask);
router.patch('/:id', updateTaskValidator, validate, updateTask);
router.delete('/:id', deleteTask);

export default router;
