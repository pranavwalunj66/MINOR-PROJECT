const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('teacher', 'student').required(),
  department: Joi.string().when('role', {
    is: 'student',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  prn: Joi.string().when('role', {
    is: 'student',
    then: Joi.string().pattern(/^\d{12}$/).required(),
    otherwise: Joi.optional()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const otpVerificationSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required()
});

const createClassSchema = Joi.object({
  name: Joi.string().required().trim(),
  enrollmentKey: Joi.string().required().min(6)
});

const createQuizSchema = Joi.object({
  title: Joi.string().required().trim(),
  description: Joi.string().trim(),
  classIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  questions: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string().required(),
          isCorrect: Joi.boolean().required()
        })
      ).min(2).max(5).required()
    })
  ).min(1).max(50).required(),
  timeLimit: Joi.number().integer().min(1).required(),
  scheduledFor: Joi.date().greater('now').required(),
  passingCriteria: Joi.number().min(0).max(100).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  otpVerificationSchema,
  createClassSchema,
  createQuizSchema
};
