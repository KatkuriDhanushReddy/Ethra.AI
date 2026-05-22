import { body } from 'express-validator';

export const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('project').notEmpty().withMessage('Project required'),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601(),
];

export const updateTaskValidator = [
  body('title').optional().trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('status').optional().isIn(['todo', 'in_progress', 'completed']),
  body('dueDate').optional().isISO8601(),
];
