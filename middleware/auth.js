const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User');

// Verifies the JWT sent in Authorization: Bearer <token> and attaches req.user.
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authorized, no token provided', 401, 'UNAUTHORIZED');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) throw new AppError('User no longer exists', 401, 'UNAUTHORIZED');
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Not authorized, invalid token', 401, 'UNAUTHORIZED'));
  }
};

// Role-based access control - use AFTER protect(). Usage: authorize('admin','staff')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient role permissions', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = { protect, authorize };
