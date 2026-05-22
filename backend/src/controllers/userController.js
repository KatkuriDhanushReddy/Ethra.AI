import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ name: 1 }),
    User.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json({ success: true, data: user });
});
