import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
    dueDate: { type: Date },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    attachments: [{ filename: String, url: String, uploadedAt: Date }],
    activity: [activitySchema],
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model('Task', taskSchema);
