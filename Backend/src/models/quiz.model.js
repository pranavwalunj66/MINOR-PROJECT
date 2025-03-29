const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: [{
    text: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      required: true
    }
  }]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  passingCriteria: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed'],
    default: 'scheduled'
  },
  attempts: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    answers: [{
      questionIndex: Number,
      selectedOptions: [Number],
      isCorrect: Boolean
    }],
    score: Number,
    submittedAt: Date,
    timeExtended: {
      type: Boolean,
      default: false
    },
    extendedTime: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

// Virtual for getting the total number of questions
quizSchema.virtual('questionCount').get(function() {
  return this.questions.length;
});

// Virtual for getting the maximum possible score
quizSchema.virtual('maxScore').get(function() {
  return this.questions.length;
});

// Virtual for getting the passing score
quizSchema.virtual('passingScore').get(function() {
  if (!this.passingCriteria) return 0;
  return Math.ceil((this.passingCriteria / 100) * this.maxScore);
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
