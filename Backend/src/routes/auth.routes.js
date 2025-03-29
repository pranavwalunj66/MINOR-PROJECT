const express = require('express');
const { auth } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validation.middleware');
const { registerSchema, loginSchema, otpVerificationSchema } = require('../utils/validation.schemas');
const {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout
} = require('../controllers/auth.controller');

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/verify-otp', validateRequest(otpVerificationSchema), verifyOTP);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', auth, logout);

module.exports = router;
