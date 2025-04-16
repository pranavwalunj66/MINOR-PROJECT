const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Temporary development mode flag
const DEV_MODE = true; // Set this to false when you want to re-enable authentication

const auth = async (req, res, next) => {
  if (DEV_MODE) {
    // In dev mode, create a mock user if none exists
    if (!req.user) {
      req.user = {
        _id: 'dev_user_id',
        role: 'teacher', // or 'student' based on your needs
        isVerified: true
      };
    }
    return next();
  }

  try {
    const token = req.header('Authorization')?.replace('Bearer', '').trim();
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Email not verified' });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const teacherAuth = (req, res, next) => {
  if (DEV_MODE) {
    req.user = { ...req.user, role: 'teacher' };
    return next();
  }

  if (req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Teacher access required' });
  }
  next();
};

const studentAuth = (req, res, next) => {
  if (DEV_MODE) {
    req.user = { ...req.user, role: 'student' };
    return next();
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

module.exports = {
  auth,
  teacherAuth,
  studentAuth
};
