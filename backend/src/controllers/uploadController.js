import path from 'path';
import { Task } from '../models/Task.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadAttachment = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const attachment = {
    filename: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date(),
  };
  task.attachments.push(attachment);
  await task.save();
  res.json({ success: true, data: attachment });
});
