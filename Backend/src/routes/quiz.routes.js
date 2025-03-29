const express = require('express');
const { auth, teacherAuth, studentAuth } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { createQuizSchema } = require('../utils/validation.schemas');
const {
  createQuiz,
  getQuizDetails,
  getTeacherQuizzes,
  getStudentQuizzes,
  startQuiz,
  submitQuiz,
  extendQuizTime,
  generateQuizReport
} = require('../controllers/quiz.controller');

const router = express.Router();

// Teacher routes
router.post('/', auth, teacherAuth, validateRequest(createQuizSchema), createQuiz);
router.get('/teacher/all', auth, teacherAuth, getTeacherQuizzes);
router.post('/:quizId/extend', auth, teacherAuth, extendQuizTime);
router.get('/:quizId/report', auth, teacherAuth, generateQuizReport);

// Student routes
router.get('/student/all', auth, studentAuth, getStudentQuizzes);
router.get('/:quizId', auth, getQuizDetails);
router.post('/:quizId/start', auth, studentAuth, startQuiz);
router.post('/:quizId/submit', auth, studentAuth, submitQuiz);

module.exports = router;
