const express = require('express');
const { auth, teacherAuth, studentAuth } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { createClassSchema } = require('../utils/validation.schemas');
const {
  createClass,
  getTeacherClasses,
  joinClass,
  getStudentClasses,
  getClassDetails,
  toggleStudentBlock,
  getClassLeaderboard
} = require('../controllers/class.controller');

const router = express.Router();

// Teacher routes
router.post('/', auth, teacherAuth, validateRequest(createClassSchema), createClass);
router.get('/teacher', auth, teacherAuth, getTeacherClasses);
router.get('/details/:classId', auth, teacherAuth, getClassDetails);
router.post('/toggle-block', auth, teacherAuth, toggleStudentBlock);

// Student routes
router.post('/join', auth, studentAuth, joinClass);
router.get('/student', auth, studentAuth, getStudentClasses);

// Common routes
router.get('/:classId/leaderboard', auth, getClassLeaderboard);

module.exports = router;
