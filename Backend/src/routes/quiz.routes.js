const express = require('express');
const { auth, teacherAuth, studentAuth } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validation.middleware');
const { createQuizSchema } = require('../utils/validation.schemas');
const {
  createQuiz,
  getQuizDetails,
  getTeacherQuizzes,
  getStudentQuizzes,
  submitQuiz,
  extendQuizTime,
  generateQuizReport
} = require('../controllers/quiz.controller');

const router = express.Router();

// Teacher routes
router.post('/', auth, teacherAuth, validateRequest(createQuizSchema), createQuiz);
router.get('/teacher', auth, teacherAuth, getTeacherQuizzes);
router.post('/extend-time', auth, teacherAuth, extendQuizTime);
router.get('/:quizId/report', auth, teacherAuth, generateQuizReport);

// Student routes
router.get('/student', auth, studentAuth, getStudentQuizzes);
router.post('/:quizId/submit', auth, studentAuth, submitQuiz);

// Common routes
router.get('/:quizId', auth, getQuizDetails);

module.exports = router;
