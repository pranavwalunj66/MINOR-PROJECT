const Quiz = require('../models/quiz.model');
const Class = require('../models/class.model');
const excel = require('excel4node');
const logger = require('../utils/logger');

// Create a new quiz (Teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, classIds, questions, timeLimit, windowStart, windowEnd } = req.body;

    // Validate time window
    const startTime = new Date(windowStart);
    const endTime = new Date(windowEnd);
    const now = new Date();

    if (startTime < now) {
      return res.status(400).json({ message: 'Window start time must be in the future' });
    }

    if (endTime <= startTime) {
      return res.status(400).json({ message: 'Window end time must be after window start time' });
    }

    // Validate questions
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Questions are required' });
    }

    if (questions.length > 50) {
      return res.status(400).json({ message: 'Maximum 50 questions allowed' });
    }

    // Check if teacher owns all classes
    const classes = await Class.find({
      _id: { $in: classIds },
      teacher: req.user._id
    });

    if (classes.length !== classIds.length) {
      return res.status(403).json({ message: 'Access denied to one or more classes' });
    }

    const quiz = new Quiz({
      title,
      description,
      teacher: req.user._id,
      classes: classIds,
      questions,
      timeLimit,
      windowStart: startTime,
      windowEnd: endTime
    });

    quiz.updateStatus();
    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quizId: quiz._id
    });
  } catch (error) {
    logger.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
};

// Get quiz details (with different views for teachers and students)
const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('classes', 'name');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.updateStatus();
    await quiz.save();

    if (req.user.role === 'teacher') {
      // Teacher view - show all details including questions and attempts
      return res.json({
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        windowStart: quiz.windowStart,
        windowEnd: quiz.windowEnd,
        status: quiz.status,
        classes: quiz.classes,
        questions: quiz.questions,
        attempts: quiz.attempts,
        questionCount: quiz.questions.length
      });
    } else {
      // Student view - hide correct answers and other attempts
      const attempt = quiz.attempts.find(a => a.student.toString() === req.user._id.toString());
      const now = new Date();

      const response = {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        windowStart: quiz.windowStart,
        windowEnd: quiz.windowEnd,
        status: quiz.status,
        classes: quiz.classes.map(c => ({
          id: c._id,
          name: c.name
        })),
        questionCount: quiz.questions.length
      };

      if (attempt) {
        response.attempt = {
          startTime: attempt.startTime,
          endTime: attempt.endTime,
          score: attempt.score,
          submittedAt: attempt.submittedAt
        };
      } else if (quiz.status === 'active') {
        response.questions = quiz.questions.map(q => ({
          text: q.text,
          options: q.options.map(o => ({ text: o.text }))
        }));
      }

      return res.json(response);
    }
  } catch (error) {
    logger.error('Get quiz details error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz details' });
  }
};

// Get all quizzes for a teacher
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user._id })
      .populate('classes', 'name')
      .select('-questions -attempts');

    quizzes.forEach(quiz => {
      quiz.updateStatus();
    });

    await Promise.all(quizzes.map(quiz => quiz.save()));

    res.json(quizzes);
  } catch (error) {
    logger.error('Get teacher quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Get student's quizzes (upcoming and past)
const getStudentQuizzes = async (req, res) => {
  try {
    const enrolledClasses = await Class.find({
      students: req.user._id,
      blocked: { $ne: req.user._id }
    });

    if (!enrolledClasses || enrolledClasses.length === 0) {
      return res.json({
        upcoming: [],
        past: []
      });
    }

    const classIds = enrolledClasses.map(c => c._id);
    const quizzes = await Quiz.find({
      classes: { $in: classIds }
    })
      .populate('classes', 'name')
      .lean();

    quizzes.forEach(quiz => {
      const now = new Date();
      if (now < quiz.windowStart) {
        quiz.status = 'scheduled';
      } else if (now >= quiz.windowStart && now <= quiz.windowEnd) {
        quiz.status = 'active';
      } else {
        quiz.status = 'completed';
      }
    });

    const now = new Date();
    const upcoming = [];
    const past = [];

    quizzes.forEach(quiz => {
      const attempt = quiz.attempts?.find(
        a => a?.student?.toString() === req.user._id.toString()
      );

      const quizView = {
        id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        windowStart: quiz.windowStart,
        windowEnd: quiz.windowEnd,
        status: quiz.status,
        classes: quiz.classes.map(c => ({
          id: c._id,
          name: c.name
        })),
        attempted: !!attempt,
        questionCount: quiz.questions?.length || 0
      };

      if (attempt) {
        quizView.score = attempt.score;
        quizView.startTime = attempt.startTime;
        quizView.endTime = attempt.endTime;
        quizView.submittedAt = attempt.submittedAt;
      }

      if (!attempt && quiz.windowEnd > now) {
        upcoming.push(quizView);
      } else {
        past.push(quizView);
      }
    });

    res.json({
      upcoming: upcoming.sort((a, b) => a.windowStart - b.windowStart),
      past: past.sort((a, b) => b.windowEnd - a.windowEnd)
    });
  } catch (error) {
    logger.error('Get student quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Start quiz attempt (Student only)
const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.updateStatus();

    // Check if student is enrolled in any of the quiz's classes
    const isEnrolled = await Class.exists({
      _id: { $in: quiz.classes },
      students: req.user._id,
      blocked: { $ne: req.user._id }
    });

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if quiz is active
    if (quiz.status !== 'active') {
      return res.status(400).json({ message: 'Quiz is not currently active' });
    }

    // Check if student has already attempted the quiz
    const hasAttempted = quiz.attempts.some(a => a.student.toString() === req.user._id.toString());
    if (hasAttempted) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + quiz.timeLimit * 60000);

    // Check if end time exceeds window end
    if (endTime > quiz.windowEnd) {
      return res.status(400).json({ message: 'Not enough time left in the quiz window' });
    }

    // Create attempt
    quiz.attempts.push({
      student: req.user._id,
      startTime: now,
      endTime: endTime
    });

    await quiz.save();

    res.json({
      message: 'Quiz started successfully',
      startTime: now,
      endTime: endTime,
      questions: quiz.questions.map(q => ({
        text: q.text,
        options: q.options.map(o => ({ text: o.text }))
      }))
    });
  } catch (error) {
    logger.error('Start quiz error:', error);
    res.status(500).json({ message: 'Failed to start quiz' });
  }
};

// Submit quiz attempt (Student only)
const submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.updateStatus();

    // Check if student is enrolled in any of the quiz's classes
    const isEnrolled = await Class.exists({
      _id: { $in: quiz.classes },
      students: req.user._id,
      blocked: { $ne: req.user._id }
    });

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find student's attempt
    const attempt = quiz.attempts.find(a => a.student.toString() === req.user._id.toString());
    if (!attempt) {
      return res.status(400).json({ message: 'You have not started this quiz' });
    }

    // Check if quiz is still active for this student
    const now = new Date();
    if (now > attempt.endTime) {
      return res.status(400).json({ message: 'Quiz time has expired' });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    // Validate answers
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid answers format' });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({ message: 'Must answer all questions' });
    }

    // Calculate score
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = answer.selectedOptions.every(optionIndex => {
        const option = question.options[optionIndex];
        return option && option.isCorrect;
      });

      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedOptions: answer.selectedOptions,
        isCorrect
      };
    });

    // Update attempt with answers and score
    attempt.answers = gradedAnswers;
    attempt.score = score;
    attempt.submittedAt = now;

    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      total: quiz.questions.length
    });
  } catch (error) {
    logger.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

// Extend quiz time (Teacher only)
const extendQuizTime = async (req, res) => {
  try {
    const { studentId, extraMinutes } = req.body;
    if (!studentId || !extraMinutes || extraMinutes <= 0) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attempt = quiz.attempts.find(a => a.student.toString() === studentId);
    if (!attempt) {
      return res.status(404).json({ message: 'Student attempt not found' });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: 'Cannot extend time for completed attempt' });
    }

    // Calculate new end time
    const newEndTime = new Date(attempt.endTime.getTime() + extraMinutes * 60000);
    
    // Check if new end time exceeds window end
    if (newEndTime > quiz.windowEnd) {
      return res.status(400).json({ message: 'Cannot extend beyond quiz window' });
    }

    attempt.endTime = newEndTime;
    attempt.timeExtended = true;
    attempt.extendedTime = (attempt.extendedTime || 0) + extraMinutes;

    await quiz.save();

    res.json({
      message: 'Quiz time extended successfully',
      newEndTime: attempt.endTime
    });
  } catch (error) {
    logger.error('Extend quiz time error:', error);
    res.status(500).json({ message: 'Failed to extend quiz time' });
  }
};

// Generate Excel report for a quiz (Teacher only)
const generateQuizReport = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId)
      .populate('teacher', 'name email')
      .populate('attempts.student', 'name email prn department');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const wb = new excel.Workbook();
    const ws = wb.addWorksheet('Quiz Report');

    // Style for headers
    const headerStyle = wb.createStyle({
      font: { bold: true, size: 12 },
      fill: { type: 'pattern', patternType: 'solid', fgColor: '#CCCCCC' }
    });

    // Add headers
    ws.cell(1, 1).string('Student Name').style(headerStyle);
    ws.cell(1, 2).string('Email').style(headerStyle);
    ws.cell(1, 3).string('PRN').style(headerStyle);
    ws.cell(1, 4).string('Department').style(headerStyle);
    ws.cell(1, 5).string('Score').style(headerStyle);
    ws.cell(1, 6).string('Submitted At').style(headerStyle);

    // Add data
    quiz.attempts.forEach((attempt, index) => {
      const row = index + 2;
      ws.cell(row, 1).string(attempt.student.name);
      ws.cell(row, 2).string(attempt.student.email);
      ws.cell(row, 3).string(attempt.student.prn || 'N/A');
      ws.cell(row, 4).string(attempt.student.department || 'N/A');
      ws.cell(row, 5).number(attempt.score);
      ws.cell(row, 6).date(attempt.submittedAt);
    });

    // Generate Excel file
    const buffer = await wb.writeToBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=quiz-report-${quiz._id}.xlsx`);
    res.send(buffer);
  } catch (error) {
    logger.error('Generate quiz report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

module.exports = {
  createQuiz,
  getQuizDetails,
  getTeacherQuizzes,
  getStudentQuizzes,
  startQuiz,
  submitQuiz,
  extendQuizTime,
  generateQuizReport
};
