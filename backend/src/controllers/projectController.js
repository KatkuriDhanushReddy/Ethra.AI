import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';

const populateProject = { path: 'members createdBy', select: 'name email avatar role' };

export const getProjects = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.$or = [{ members: req.user._id }, { createdBy: req.user._id }];
  }
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const query = Project.find(filter).populate(populateProject).sort({ updatedAt: -1 });
  if (search) query.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });

  const [projects, total] = await Promise.all([
    query.skip(skip).limit(Number(limit)),
    Project.countDocuments(filter),
  ]);

  const withProgress = await Promise.all(
    projects.map(async (p) => {
      const tasks = await Task.find({ project: p._id });
      const completed = tasks.filter((t) => t.status === 'completed').length;
      return {
        ...p.toObject(),
        taskCount: tasks.length,
        completedCount: completed,
        progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
      };
    })
  );

  res.json({
    success: true,
    data: withProgress,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate(populateProject);
  if (!project) throw new ApiError(404, 'Project not found');
  const tasks = await Task.find({ project: project._id }).populate('assignedTo', 'name email avatar');
  const completed = tasks.filter((t) => t.status === 'completed').length;
  res.json({
    success: true,
    data: {
      ...project.toObject(),
      tasks,
      taskCount: tasks.length,
      completedCount: completed,
      progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    },
  });
});

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, deadline, status, members = [] } = req.body;
  const memberIds = [...new Set([...members, req.user._id.toString()])];
  const project = await Project.create({
    name,
    description,
    deadline,
    status,
    members: memberIds,
    createdBy: req.user._id,
  });
  const populated = await project.populate(populateProject);
  const io = req.app.get('io');
  for (const memberId of memberIds) {
    if (memberId !== req.user._id.toString()) {
      await createNotification(io, {
        user: memberId,
        type: 'project_invite',
        message: `You were added to project "${name}"`,
        relatedId: project._id,
        relatedModel: 'Project',
      });
    }
  }
  if (io) io.emit('project:created', populated);
  res.status(201).json({ success: true, data: populated });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = req.project || (await Project.findById(req.params.id));
  if (!project) throw new ApiError(404, 'Project not found');
  if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only admin or project creator can edit');
  }
  const { name, description, deadline, status } = req.body;
  if (name) project.name = name;
  if (description !== undefined) project.description = description;
  if (deadline !== undefined) project.deadline = deadline;
  if (status) project.status = status;
  await project.save();
  const populated = await project.populate(populateProject);
  req.app.get('io')?.emit('project:updated', populated);
  res.json({ success: true, data: populated });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = req.project || (await Project.findById(req.params.id));
  if (!project) throw new ApiError(404, 'Project not found');
  if (req.user.role !== 'admin' && project.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only admin or project creator can delete');
  }
  await Task.deleteMany({ project: project._id });
  await project.deleteOne();
  req.app.get('io')?.emit('project:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Project deleted' });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const project = req.project;
  if (!project.members.includes(userId)) {
    project.members.push(userId);
    await project.save();
    await createNotification(req.app.get('io'), {
      user: userId,
      type: 'project_invite',
      message: `You were added to project "${project.name}"`,
      relatedId: project._id,
      relatedModel: 'Project',
    });
  }
  const populated = await project.populate(populateProject);
  res.json({ success: true, data: populated });
});

export const removeMember = asyncHandler(async (req, res) => {
  const project = req.project;
  project.members = project.members.filter((m) => m.toString() !== req.params.userId);
  await project.save();
  const populated = await project.populate(populateProject);
  res.json({ success: true, data: populated });
});
