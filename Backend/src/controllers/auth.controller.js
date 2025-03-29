const User = require('../models/user.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt.utils');
const { generateOTP, sendEmailOTP, sendSMSOTP } = require('../utils/otp.utils');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { phone },
        { prn: req.body.prn }
      ].filter(Boolean)
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email, phone, or PRN'
      });
    }

    // Create user
    const user = new User(req.body);

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Redis if available, otherwise store in user document
    if (redisClient && redisClient.isOpen) {
      await redisClient.setEx(`otp:${email}`, 600, otp); // OTP valid for 10 minutes
    } else {
      user.tempOTP = otp;
      user.tempOTPExpires = new Date(Date.now() + 600000); // 10 minutes
    }

    await user.save();

    // Send OTP via email and SMS
    try {
      await Promise.all([
        sendEmailOTP(email, otp),
        sendSMSOTP(phone, otp)
      ]);
    } catch (error) {
      logger.warn('Failed to send OTP:', error);
    }

    res.status(201).json({
      message: 'Registration successful. Please verify your email and phone.'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    if (user.otpAttempts >= 5) {
      return res.status(400).json({ message: 'Maximum OTP attempts exceeded' });
    }

    let isValidOTP = false;
    if (redisClient && redisClient.isOpen) {
      const storedOTP = await redisClient.get(`otp:${email}`);
      isValidOTP = storedOTP && storedOTP === otp;
    } else {
      isValidOTP = user.tempOTP === otp && user.tempOTPExpires > new Date();
    }

    if (!isValidOTP) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otpAttempts = 0;
    user.tempOTP = undefined;
    user.tempOTPExpires = undefined;
    await user.save();

    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`otp:${email}`);
    }

    res.json({ message: 'OTP verification successful' });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({ message: error.message || 'OTP verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    logger.debug('Found user:', user ? { 
      email: user.email, 
      hasPassword: !!user.password,
      isVerified: user.isVerified 
    } : null);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const token = generateToken(req.user._id, req.user.role);
    res.json({ token });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: error.message || 'Token refresh failed' });
  }
};

const logout = async (req, res) => {
  try {
    // Nothing to do if Redis is not available
    if (redisClient && redisClient.isOpen) {
      await redisClient.del(`refresh:${req.user._id}`);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: error.message || 'Logout failed' });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout
};
