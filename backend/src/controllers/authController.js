import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
});

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(400, 'Email already registered');

  const allowAdminSignup = process.env.ALLOW_ADMIN_SIGNUP === 'true' || process.env.NODE_ENV !== 'production';
  const user = await User.create({
    name,
    email,
    password,
    role: allowAdminSignup && role === 'admin' ? 'admin' : 'member',
  });

  const token = generateToken(user._id);
  res.status(201).json({ success: true, token, user: userResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  const token = generateToken(user._id);
  res.json({ success: true, token, user: userResponse(user) });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: userResponse(req.user) });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  if (name) req.user.name = name;
  if (avatar !== undefined) req.user.avatar = avatar;
  await req.user.save();
  res.json({ success: true, user: userResponse(req.user) });
});
