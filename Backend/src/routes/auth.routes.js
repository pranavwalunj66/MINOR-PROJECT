const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { loginSchema } = require('../utils/validation.schemas');
const {
  register,
  login,
  refreshToken,
  logout
} = require('../controllers/auth.controller');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', auth, logout);

module.exports = router;
