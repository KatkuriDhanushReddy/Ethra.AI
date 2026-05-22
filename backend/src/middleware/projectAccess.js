import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const canAccessProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id || req.params.projectId || req.body.project);
  if (!project) throw new ApiError(404, 'Project not found');

  const userId = req.user._id.toString();
  const isMember =
    project.createdBy.toString() === userId ||
    project.members.some((m) => m.toString() === userId);

  if (!isMember && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not a project member');
  }
  req.project = project;
  next();
});
