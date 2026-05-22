import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';

const populateTask = [
  { path: 'assignedTo', select: 'name email avatar' },
  { path: 'createdBy', select: 'name email' },
  { path: 'project', select: 'name' },
];

const canManageTask = (user, project) =>
  user.role === 'admin' || project.createdBy.toString() === user._id.toString();

const isProjectMember = (user, project) =>
  canManageTask(user, project) || project.members.some((m) => m.toString() === user._id.toString());

export const getTasks = asyncHandler(async (req, res) => {
  const {
    project,
    status,
    priority,
    assignedTo,
    search,
    sort = '-createdAt',
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};
  if (project) filter.project = project;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  if (req.user.role !== 'admin') {
    const memberProjects = await Project.find({
      $or: [{ members: req.user._id }, { createdBy: req.user._id }],
    }).select('_id');
    const projectIds = memberProjects.map((p) => p._id);
    filter.project = project ? project : { $in: projectIds };
    if (!project && !assignedTo) {
      filter.$or = [{ assignedTo: req.user._id }, { project: { $in: projectIds } }];
    }
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (Number(page) - 1) * Number(limit);
  let sortObj = sort;
  if (sort === 'priority') sortObj = { priority: -1 };
  if (sort === 'dueDate') sortObj = { dueDate: 1 };

  const query = Task.find(filter).populate(populateTask).sort(sortObj);
  const [tasks, total] = await Promise.all([
    query.skip(skip).limit(Number(limit)),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate(populateTask);
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ success: true, data: task });
});

export const createTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new ApiError(403, 'Only admins can create tasks');
  const { title, description, assignedTo, priority, status, dueDate, project } = req.body;
  const proj = await Project.findById(project);
  if (!proj) throw new ApiError(404, 'Project not found');

  const task = await Task.create({
    title,
    description,
    assignedTo,
    priority,
    status,
    dueDate,
    project,
    createdBy: req.user._id,
    activity: [{ user: req.user._id, action: 'created', details: 'Task created' }],
  });

  const populated = await task.populate(populateTask);
  const io = req.app.get('io');
  if (assignedTo) {
    await createNotification(io, {
      user: assignedTo,
      type: 'task_assigned',
      message: `You were assigned: "${title}"`,
      relatedId: task._id,
      relatedModel: 'Task',
    });
  }
  io?.to(`project:${project}`).emit('task:created', populated);
  res.status(201).json({ success: true, data: populated });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('project');
  if (!task) throw new ApiError(404, 'Task not found');
  const project = task.project;
  const isAdmin = req.user.role === 'admin';
  const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
  const isCreator = project.createdBy?.toString() === req.user._id.toString();

  const { title, description, assignedTo, priority, status, dueDate } = req.body;
  const prevStatus = task.status;

  if (!isAdmin && !isCreator) {
    if (!isAssignee) throw new ApiError(403, 'Not allowed to update this task');
    if (status && Object.keys(req.body).length > 1) {
      throw new ApiError(403, 'Members can only update status');
    }
    if (status) task.status = status;
  } else {
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) {
      const prev = task.assignedTo?.toString();
      task.assignedTo = assignedTo || null;
      if (assignedTo && assignedTo !== prev) {
        await createNotification(req.app.get('io'), {
          user: assignedTo,
          type: 'task_assigned',
          message: `You were assigned: "${task.title}"`,
          relatedId: task._id,
          relatedModel: 'Task',
        });
      }
    }
  }

  if (status && status !== prevStatus) {
    task.activity.push({
      user: req.user._id,
      action: 'status_changed',
      details: `Status changed to ${status}`,
    });
    if (task.assignedTo) {
      await createNotification(req.app.get('io'), {
        user: task.assignedTo,
        type: 'status_update',
        message: `Task "${task.title}" status: ${status}`,
        relatedId: task._id,
        relatedModel: 'Task',
      });
    }
  }

  await task.save();
  const populated = await task.populate(populateTask);
  req.app.get('io')?.to(`project:${task.project._id || task.project}`).emit('task:updated', populated);
  res.json({ success: true, data: populated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') throw new ApiError(403, 'Only admins can delete tasks');
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');
  const projectId = task.project;
  await task.deleteOne();
  req.app.get('io')?.to(`project:${projectId}`).emit('task:deleted', { id: req.params.id });
  res.json({ success: true, message: 'Task deleted' });
});

export const reorderTasks = asyncHandler(async (req, res) => {
  const { taskId, status } = req.body;
  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const project = await Project.findById(task.project);
  const isAdmin = req.user.role === 'admin';
  const isAssignee = task.assignedTo?.toString() === req.user._id.toString();

  if (!isAdmin && !isAssignee && !canManageTask(req.user, project)) {
    throw new ApiError(403, 'Cannot update task status');
  }

  task.status = status;
  task.activity.push({
    user: req.user._id,
    action: 'status_changed',
    details: `Moved to ${status}`,
  });
  await task.save();
  const populated = await task.populate(populateTask);
  req.app.get('io')?.to(`project:${task.project}`).emit('task:updated', populated);
  res.json({ success: true, data: populated });
});
