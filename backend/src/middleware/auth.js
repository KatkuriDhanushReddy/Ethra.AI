import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, 'Not authorized');
  }
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'User not found');
  req.user = user;
  next();
});

export const authorize = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'Insufficient permissions');
    }
    next();
  });
