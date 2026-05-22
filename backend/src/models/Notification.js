import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['task_assigned', 'deadline_reminder', 'status_update', 'comment', 'project_invite'],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
    relatedModel: { type: String, enum: ['Task', 'Project', 'Comment'] },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
