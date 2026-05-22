import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread } = req.query;
  const filter = { user: req.user._id };
  if (unread === 'true') filter.read = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Notification.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const ids = req.body.ids?.length ? req.body.ids : [req.params.id];
  await Notification.updateMany({ user: req.user._id, _id: { $in: ids } }, { read: true });
  res.json({ success: true, message: 'Marked as read' });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All marked as read' });
});
