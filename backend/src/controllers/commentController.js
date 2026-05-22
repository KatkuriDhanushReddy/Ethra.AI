import { Comment } from '../models/Comment.js';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotification } from '../utils/notifications.js';

export const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('user', 'name email avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const task = await Task.findById(req.params.taskId);
  if (!task) throw new ApiError(404, 'Task not found');

  const comment = await Comment.create({
    content,
    user: req.user._id,
    task: task._id,
  });

  task.activity.push({
    user: req.user._id,
    action: 'commented',
    details: content.slice(0, 100),
  });
  await task.save();

  const populated = await comment.populate('user', 'name email avatar');
  if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
    await createNotification(req.app.get('io'), {
      user: task.assignedTo,
      type: 'comment',
      message: `New comment on "${task.title}"`,
      relatedId: task._id,
      relatedModel: 'Comment',
    });
  }
  req.app.get('io')?.to(`task:${task._id}`).emit('comment:created', populated);
  res.status(201).json({ success: true, data: populated });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not allowed');
  }
  await comment.deleteOne();
  res.json({ success: true, message: 'Comment deleted' });
});
