const Joi = require('joi');

// Base schema with common fields
const baseSchema = {
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('teacher', 'student').required()
};

// Teacher-specific schema
const teacherSchema = Joi.object({
  ...baseSchema,
  role: Joi.string().valid('teacher').required()
});

// Student-specific schema
const studentSchema = Joi.object({
  ...baseSchema,
  role: Joi.string().valid('student').required(),
  department: Joi.string().required(),
  prn: Joi.string().pattern(/^\d{12}$/).required()
});

// Combined schema for registration
const registerSchema = Joi.object(baseSchema).custom((value, helpers) => {
  if (value.role === 'teacher') {
    const { error } = teacherSchema.validate(value);
    if (error) return helpers.error('any.invalid', { message: error.details[0].message });
  } else if (value.role === 'student') {
    const { error } = studentSchema.validate(value);
    if (error) return helpers.error('any.invalid', { message: error.details[0].message });
  }
  return value;
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

const enrollSchema = Joi.object({
  classId: Joi.string().required(),
  enrollmentKey: Joi.string().required()
});

const createQuizSchema = Joi.object({
  title: Joi.string().required().trim().max(100),
  description: Joi.string().trim().max(500).allow('', null),
  classIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  questions: Joi.array().items(
    Joi.object({
      text: Joi.string().required().max(1000),
      options: Joi.array().items(
        Joi.object({
          text: Joi.string().required().max(500),
          isCorrect: Joi.boolean().required()
        })
      ).min(2).required()
    })
  ).min(1).max(50).required(),
  timeLimit: Joi.number().integer().min(1).max(180).required(),
  windowStart: Joi.date().iso().required(),
  windowEnd: Joi.date().iso().greater(Joi.ref('windowStart')).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  otpVerificationSchema,
  createClassSchema,
  enrollSchema,
  createQuizSchema
};
