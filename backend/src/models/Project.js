import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    deadline: { type: Date },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed'],
      default: 'active',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

projectSchema.index({ name: 'text', description: 'text' });

export const Project = mongoose.model('Project', projectSchema);
