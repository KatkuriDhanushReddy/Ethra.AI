import { Notification } from '../models/Notification.js';

export const createNotification = async (io, { user, type, message, relatedId, relatedModel }) => {
  const notification = await Notification.create({
    user,
    type,
    message,
    relatedId,
    relatedModel,
  });
  if (io) {
    io.to(`user:${user}`).emit('notification', notification);
  }
  return notification;
};
