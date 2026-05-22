import { body } from 'express-validator';

export const createProjectValidator = [
  body('name').trim().notEmpty().withMessage('Project name required'),
  body('description').optional().trim(),
  body('deadline').optional().isISO8601(),
  body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed']),
];

export const updateProjectValidator = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('deadline').optional().isISO8601(),
  body('status').optional().isIn(['planning', 'active', 'on_hold', 'completed']),
];
