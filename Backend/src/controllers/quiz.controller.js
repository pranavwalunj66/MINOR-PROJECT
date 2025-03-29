const Quiz = require('../models/quiz.model');
const Class = require('../models/class.model');
const excel = require('excel4node');

// Create a new quiz (Teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, classIds, questions, timeLimit, scheduledFor, passingCriteria } = req.body;

    // Verify all classes exist and belong to the teacher
    const classes = await Class.find({
      _id: { $in: classIds },
      teacher: req.user._id
    });

    if (classes.length !== classIds.length) {
      return res.status(400).json({ message: 'Invalid class IDs provided' });
    }

    const quiz = new Quiz({
      title,
      description,
      teacher: req.user._id,
      classes: classIds,
      questions,
      timeLimit,
      scheduledFor,
      passingCriteria
    });

    await quiz.save();

    // Add quiz reference to all classes
    await Class.updateMany(
      { _id: { $in: classIds } },
      { $push: { quizzes: quiz._id } }
    );

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz: {
        id: quiz._id,
        title: quiz.title,
        scheduledFor: quiz.scheduledFor
      }
    });
  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Failed to create quiz' });
  }
};

// Get quiz details (with different views for teachers and students)
const getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;
    const isTeacher = req.user.role === 'teacher';

    const quiz = await Quiz.findById(quizId)
      .populate('teacher', 'name email')
      .populate('classes', 'name');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check authorization
    if (isTeacher) {
      if (quiz.teacher._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view this quiz' });
      }
    } else {
      // For students, check if they're enrolled in any of the quiz's classes
      const enrolledClass = await Class.findOne({
        _id: { $in: quiz.classes },
        students: req.user._id,
        blockedStudents: { $ne: req.user._id }
      });

      if (!enrolledClass) {
        return res.status(403).json({ message: 'Not authorized to view this quiz' });
      }
    }

    // Different views for teachers and students
    const quizView = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      scheduledFor: quiz.scheduledFor,
      status: quiz.status,
      classes: quiz.classes,
      passingCriteria: quiz.passingCriteria
    };

    if (isTeacher) {
      // Teachers see everything including correct answers
      quizView.questions = quiz.questions;
      quizView.attempts = quiz.attempts;
    } else {
      // Students only see questions when the quiz is active
      if (quiz.status === 'active') {
        quizView.questions = quiz.questions.map(q => ({
          text: q.text,
          options: q.options.map(o => ({ text: o.text }))
        }));
      }
      // Show student's own attempt if it exists
      const attempt = quiz.attempts.find(
        a => a.student.toString() === req.user._id.toString()
      );
      if (attempt) {
        quizView.myAttempt = attempt;
      }
    }

    res.json({ quiz: quizView });
  } catch (error) {
    console.error('Get quiz details error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz details' });
  }
};

// Get all quizzes for a teacher
const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ teacher: req.user._id })
      .populate('classes', 'name')
      .select('-questions -attempts');

    res.json({ quizzes });
  } catch (error) {
    console.error('Get teacher quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Get student's quizzes (upcoming and past)
const getStudentQuizzes = async (req, res) => {
  try {
    // Find all classes the student is enrolled in
    const enrolledClasses = await Class.find({
      students: req.user._id,
      blockedStudents: { $ne: req.user._id }
    });

    const classIds = enrolledClasses.map(c => c._id);

    // Find all quizzes for these classes
    const quizzes = await Quiz.find({
      classes: { $in: classIds }
    })
      .populate('classes', 'name')
      .select('-questions');

    // Separate upcoming and past quizzes
    const now = new Date();
    const upcoming = [];
    const past = [];

    quizzes.forEach(quiz => {
      const attempt = quiz.attempts.find(
        a => a.student.toString() === req.user._id.toString()
      );

      const quizView = {
        id: quiz._id,
        title: quiz.title,
        scheduledFor: quiz.scheduledFor,
        status: quiz.status,
        classes: quiz.classes,
        attempted: !!attempt
      };

      if (attempt) {
        quizView.score = attempt.score;
        quizView.submittedAt = attempt.submittedAt;
      }

      if (quiz.scheduledFor > now && !attempt) {
        upcoming.push(quizView);
      } else {
        past.push(quizView);
      }
    });

    res.json({
      upcoming: upcoming.sort((a, b) => a.scheduledFor - b.scheduledFor),
      past: past.sort((a, b) => b.scheduledFor - a.scheduledFor)
    });
  } catch (error) {
    console.error('Get student quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

// Submit quiz attempt (Student only)
const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Verify quiz is active
    if (quiz.status !== 'active') {
      return res.status(400).json({ message: 'Quiz is not active' });
    }

    // Check if student is enrolled in any of the quiz's classes
    const enrolledClass = await Class.findOne({
      _id: { $in: quiz.classes },
      students: req.user._id,
      blockedStudents: { $ne: req.user._id }
    });

    if (!enrolledClass) {
      return res.status(403).json({ message: 'Not authorized to attempt this quiz' });
    }

    // Check if student has already attempted
    const existingAttempt = quiz.attempts.find(
      a => a.student.toString() === req.user._id.toString()
    );

    if (existingAttempt) {
      return res.status(400).json({ message: 'Quiz already attempted' });
    }

    // Validate and grade answers
    let score = 0;
    const gradedAnswers = answers.map((answer, index) => {
      const question = quiz.questions[index];
      const isCorrect = question.options
        .filter(o => o.isCorrect)
        .every(o => answer.selectedOptions.includes(o._id.toString()));

      if (isCorrect) score++;

      return {
        questionIndex: index,
        selectedOptions: answer.selectedOptions,
        isCorrect
      };
    });

    // Create attempt record
    quiz.attempts.push({
      student: req.user._id,
      answers: gradedAnswers,
      score,
      submittedAt: new Date()
    });

    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      totalQuestions: quiz.questions.length
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz' });
  }
};

// Extend quiz time (Teacher only)
const extendQuizTime = async (req, res) => {
  try {
    const { quizId, studentId, extraTime } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      teacher: req.user._id,
      status: 'active'
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Active quiz not found' });
    }

    const attempt = quiz.attempts.find(
      a => a.student.toString() === studentId
    );

    if (!attempt) {
      return res.status(404).json({ message: 'Student attempt not found' });
    }

    attempt.timeExtended = true;
    attempt.extendedTime = (attempt.extendedTime || 0) + extraTime;

    await quiz.save();

    res.json({
      message: 'Quiz time extended successfully',
      studentId,
      extraTime
    });
  } catch (error) {
    console.error('Extend quiz time error:', error);
    res.status(500).json({ message: 'Failed to extend quiz time' });
  }
};

// Generate Excel report for a quiz (Teacher only)
const generateQuizReport = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findOne({
      _id: quizId,
      teacher: req.user._id
    }).populate('attempts.student', 'name prn department');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Create a new workbook and worksheet
    const wb = new excel.Workbook();
    const ws = wb.addWorksheet('Quiz Results');

    // Add headers
    ws.cell(1, 1).string('Student Name');
    ws.cell(1, 2).string('PRN');
    ws.cell(1, 3).string('Department');
    ws.cell(1, 4).string('Score');
    ws.cell(1, 5).string('Submission Time');
    ws.cell(1, 6).string('Time Extended');
    ws.cell(1, 7).string('Extra Time (minutes)');

    // Add data
    quiz.attempts.forEach((attempt, index) => {
      const rowIndex = index + 2;
      ws.cell(rowIndex, 1).string(attempt.student.name);
      ws.cell(rowIndex, 2).string(attempt.student.prn);
      ws.cell(rowIndex, 3).string(attempt.student.department);
      ws.cell(rowIndex, 4).number(attempt.score);
      ws.cell(rowIndex, 5).date(attempt.submittedAt);
      ws.cell(rowIndex, 6).string(attempt.timeExtended ? 'Yes' : 'No');
      ws.cell(rowIndex, 7).number(attempt.extendedTime || 0);
    });

    // Generate file buffer
    const buffer = await wb.writeToBuffer();

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=quiz_report_${quizId}.xlsx`);

    res.send(buffer);
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

module.exports = {
  createQuiz,
  getQuizDetails,
  getTeacherQuizzes,
  getStudentQuizzes,
  submitQuiz,
  extendQuizTime,
  generateQuizReport
};
