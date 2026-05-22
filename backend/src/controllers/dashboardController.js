import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';

  let projectFilter = {};
  if (!isAdmin) {
    projectFilter = { $or: [{ members: userId }, { createdBy: userId }] };
  }

  const projects = await Project.find(projectFilter).select('_id name status');
  const projectIds = projects.map((p) => p._id);

  let taskFilter = isAdmin ? {} : { $or: [{ project: { $in: projectIds } }, { assignedTo: userId }] };
  const tasks = await Task.find(taskFilter);
  const now = new Date();

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    pending: tasks.filter((t) => t.status !== 'completed').length,
    overdue: tasks.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'completed'
    ).length,
    byStatus: {
      todo: tasks.filter((t) => t.status === 'todo').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    },
    byPriority: {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    },
  };

  const projectStats = await Promise.all(
    projects.slice(0, 5).map(async (p) => {
      const pTasks = await Task.find({ project: p._id });
      const done = pTasks.filter((t) => t.status === 'completed').length;
      return {
        id: p._id,
        name: p.name,
        status: p.status,
        total: pTasks.length,
        completed: done,
        progress: pTasks.length ? Math.round((done / pTasks.length) * 100) : 0,
      };
    })
  );

  const recentActivity = await Task.find(taskFilter)
    .sort({ updatedAt: -1 })
    .limit(10)
    .populate('project', 'name')
    .populate('assignedTo', 'name')
    .select('title status updatedAt project assignedTo activity');

  const activityTimeline = recentActivity.flatMap((t) =>
    (t.activity || []).slice(-3).map((a) => ({
      taskTitle: t.title,
      projectName: t.project?.name,
      ...a.toObject(),
    }))
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);

  const productivity = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const completed = tasks.filter(
      (t) =>
        t.status === 'completed' &&
        t.updatedAt >= d &&
        t.updatedAt < next
    ).length;
    productivity.push({
      date: d.toISOString().split('T')[0],
      completed,
    });
  }

  const notifications = await Notification.find({ user: userId, read: false })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      stats,
      projectStats,
      recentActivity,
      activityTimeline,
      productivity,
      notifications,
      projectCount: projects.length,
    },
  });
});
