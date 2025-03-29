const User = require('../models/user.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt.utils');
const { generateOTP, sendEmailOTP, sendSMSOTP } = require('../utils/otp.utils');
const redisClient = require('../config/redis');

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
    await user.save();

    // Generate OTP
    const otp = generateOTP();
    await redisClient.setEx(`otp:${email}`, 600, otp); // OTP valid for 10 minutes

    // Send OTP via email and SMS
    await Promise.all([
      sendEmailOTP(email, otp),
      sendSMSOTP(phone, otp)
    ]);

    res.status(201).json({
      message: 'Registration successful. Please verify your email and phone.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
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

    const storedOTP = await redisClient.get(`otp:${email}`);
    if (!storedOTP || storedOTP !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otpAttempts = 0;
    await user.save();
    await redisClient.del(`otp:${email}`);

    res.json({ message: 'OTP verification successful' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'OTP verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
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

    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateToken(user._id, user.role);
    res.json({ accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    user.refreshToken = null;
    await user.save();
    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
};

module.exports = {
  register,
  verifyOTP,
  login,
  refreshToken,
  logout
};
