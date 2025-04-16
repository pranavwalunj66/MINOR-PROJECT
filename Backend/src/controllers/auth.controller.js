const Teacher = require('../models/teacher.model');
const Student = require('../models/student.model');
const { generateToken, generateRefreshToken } = require('../utils/jwt.utils');
const logger = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, department, prn } = req.body;
    
    // Basic validation
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({
        errors: [{ msg: 'Missing required fields' }]
      });
    }
    
    // Role-specific validation
    if (role === 'student') {
      if (!department || !prn) {
        return res.status(400).json({
          errors: [{ msg: 'Department and PRN are required for students' }]
        });
      }
      
      // Validate PRN format
      if (!/^\d{12}$/.test(prn)) {
        return res.status(400).json({
          errors: [{ msg: 'PRN must be a 12-digit number' }]
        });
      }
    } else if (role !== 'teacher') {
      return res.status(400).json({
        errors: [{ msg: 'Invalid role. Must be either teacher or student' }]
      });
    }
    
    // Check if user already exists in either collection
    const existingTeacher = await Teacher.findOne({ email });
    const existingStudent = await Student.findOne({ 
      $or: [
        { email },
        { prn: prn }
      ]
    });

    if (existingTeacher || existingStudent) {
      return res.status(400).json({
        errors: [{ msg: 'User already exists with this email or PRN' }]
      });
    }

    let user;
    if (role === 'teacher') {
      // For teachers, only include the necessary fields
      const teacherData = {
        name,
        email,
        phone,
        password
      };
      user = new Teacher(teacherData);
    } else {
      // For students, include all fields including department and PRN
      const studentData = {
        name,
        email,
        phone,
        password,
        department,
        prn
      };
      user = new Student(studentData);
    }

    // Set user as verified by default
    user.isVerified = true;
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role
      },
      token,
      refreshToken
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check both collections for the user
    let user = await Teacher.findOne({ email });
    let role = 'teacher';
    
    if (!user) {
      user = await Student.findOne({ email });
      role = 'student';
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role
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
    const token = generateToken(req.user);
    res.json({ token });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({ message: error.message || 'Token refresh failed' });
  }
};

const logout = async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: error.message || 'Logout failed' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout
};
