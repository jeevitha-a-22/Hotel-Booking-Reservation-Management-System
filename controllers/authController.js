const bcrypt = require('bcryptjs');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/token');
const { AppError } = require('../middleware/errorHandler');

// Module 1: Guest Registration & Authentication
// @route POST /api/auth/register
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('Email already registered', 409, 'DUPLICATE_EMAIL'));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  // Public registration only ever creates guests; staff/admin accounts should be
  // provisioned separately (e.g. seeded or created by an existing admin) in a real deployment.
  const allowedRole = 'guest';
  void role; // intentionally ignored from public input

  const user = await User.create({ name, email, passwordHash, role: allowedRole, phone });
  const token = generateToken(user);

  res.status(201).json({
    success: true,
    message: 'Record created successfully',
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, token },
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));

  const token = generateToken(user);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { _id: user._id, name: user.name, email: user.email, role: user.role, token },
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Profile fetched successfully', data: req.user });
});

module.exports = { register, login, getMe };
