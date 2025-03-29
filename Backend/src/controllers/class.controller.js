const Class = require('../models/class.model');
const User = require('../models/user.model');

// Create a new class (Teacher only)
const createClass = async (req, res) => {
  try {
    const { name, enrollmentKey } = req.body;

    // Check if enrollment key is already in use
    const existingClass = await Class.findOne({ enrollmentKey });
    if (existingClass) {
      return res.status(400).json({ message: 'Enrollment key already in use' });
    }

    const newClass = new Class({
      name,
      enrollmentKey,
      teacher: req.user._id
    });

    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: {
        id: newClass._id,
        name: newClass.name,
        enrollmentKey: newClass.enrollmentKey
      }
    });
  } catch (error) {
    console.error('Class creation error:', error);
    res.status(500).json({ message: 'Failed to create class' });
  }
};

// Get all classes for a teacher
const getTeacherClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email prn department')
      .populate('quizzes', 'title scheduledFor status')
      .select('-blocked');

    res.json({ classes });
  } catch (error) {
    console.error('Get teacher classes error:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// Join a class (Student only)
const joinClass = async (req, res) => {
  try {
    const { enrollmentKey } = req.body;

    const targetClass = await Class.findOne({ enrollmentKey });
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check if student is blocked
    if (targetClass.blocked.includes(req.user._id)) {
      return res.status(403).json({ message: 'You are blocked from this class' });
    }

    // Check if student is already enrolled
    if (targetClass.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled in this class' });
    }

    targetClass.students.push(req.user._id);
    await targetClass.save();

    res.json({
      message: 'Successfully joined the class',
      class: {
        id: targetClass._id,
        name: targetClass.name
      }
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ message: 'Failed to join class' });
  }
};

// Get all classes for a student
const getStudentClasses = async (req, res) => {
  try {
    const classes = await Class.find({
      students: req.user._id,
      blocked: { $ne: req.user._id }
    })
      .populate('teacher', 'name email')
      .populate('quizzes', 'title scheduledFor status')
      .select('-students -blocked');

    res.json({ classes });
  } catch (error) {
    console.error('Get student classes error:', error);
    res.status(500).json({ message: 'Failed to fetch classes' });
  }
};

// Get class details (Teacher only)
const getClassDetails = async (req, res) => {
  try {
    const classId = req.params.classId;

    const classDetails = await Class.findOne({
      _id: classId,
      teacher: req.user._id
    })
      .populate('students', 'name email prn department')
      .populate('blocked', 'name email prn')
      .populate('quizzes', 'title scheduledFor status');

    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ class: classDetails });
  } catch (error) {
    console.error('Get class details error:', error);
    res.status(500).json({ message: 'Failed to fetch class details' });
  }
};

// Block/Unblock student from class (Teacher only)
const toggleStudentBlock = async (req, res) => {
  try {
    const { classId, studentId, action } = req.body;

    const targetClass = await Class.findOne({
      _id: classId,
      teacher: req.user._id
    });

    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const student = await User.findOne({
      _id: studentId,
      role: 'student'
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (action === 'block') {
      // Remove from students and add to blocked
      targetClass.students = targetClass.students.filter(
        id => id.toString() !== studentId
      );
      if (!targetClass.blocked.includes(studentId)) {
        targetClass.blocked.push(studentId);
      }
    } else if (action === 'unblock') {
      // Remove from blocked and add to students
      targetClass.blocked = targetClass.blocked.filter(
        id => id.toString() !== studentId
      );
      if (!targetClass.students.includes(studentId)) {
        targetClass.students.push(studentId);
      }
    }

    await targetClass.save();

    res.json({
      message: `Student successfully ${action}ed`,
      classId: targetClass._id,
      studentId
    });
  } catch (error) {
    console.error('Toggle student block error:', error);
    res.status(500).json({ message: 'Failed to update student status' });
  }
};

// Get class leaderboard
const getClassLeaderboard = async (req, res) => {
  try {
    const classId = req.params.classId;

    const targetClass = await Class.findById(classId)
      .populate('quizzes')
      .populate('students', 'name prn department');

    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Calculate total correct answers for each student
    const leaderboard = targetClass.students.map(student => {
      let totalCorrect = 0;
      let totalAttempted = 0;

      targetClass.quizzes.forEach(quiz => {
        const attempt = quiz.attempts.find(
          a => a.student.toString() === student._id.toString()
        );
        if (attempt) {
          totalCorrect += attempt.answers.filter(a => a.isCorrect).length;
          totalAttempted += 1;
        }
      });

      return {
        studentId: student._id,
        name: student.name,
        prn: student.prn,
        department: student.department,
        totalCorrect,
        totalAttempted,
        quizzesTaken: totalAttempted
      };
    });

    // Sort by total correct answers (descending)
    leaderboard.sort((a, b) => b.totalCorrect - a.totalCorrect);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  createClass,
  getTeacherClasses,
  joinClass,
  getStudentClasses,
  getClassDetails,
  toggleStudentBlock,
  getClassLeaderboard
};
