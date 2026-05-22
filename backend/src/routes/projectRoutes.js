import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { canAccessProject } from '../middleware/projectAccess.js';
import { createProjectValidator, updateProjectValidator } from '../validators/projectValidators.js';

const router = Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', canAccessProject, getProject);
router.post('/', authorize('admin'), createProjectValidator, validate, createProject);
router.patch('/:id', canAccessProject, updateProjectValidator, validate, updateProject);
router.delete('/:id', canAccessProject, deleteProject);
router.post('/:id/members', authorize('admin'), canAccessProject, addMember);
router.delete('/:id/members/:userId', authorize('admin'), canAccessProject, removeMember);

export default router;
