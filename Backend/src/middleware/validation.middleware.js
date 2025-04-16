const validateQuiz = (req, res, next) => {
  const { title, description, classIds, questions, timeLimit, windowStart, windowEnd } = req.body;

  // Validate title
  if (!title || title.trim().length === 0 || title.length > 100) {
    return res.status(400).json({ errors: [{ msg: 'Title is required and must be at most 100 characters' }] });
  }

  // Validate description
  if (description && description.length > 500) {
    return res.status(400).json({ errors: [{ msg: 'Description must be at most 500 characters' }] });
  }

  // Validate classIds
  if (!Array.isArray(classIds) || classIds.length === 0) {
    return res.status(400).json({ errors: [{ msg: 'At least one class must be selected' }] });
  }

  if (!classIds.every(id => typeof id === 'string')) {
    return res.status(400).json({ errors: [{ msg: 'Invalid class IDs' }] });
  }

  // Validate questions
  if (!Array.isArray(questions) || questions.length === 0 || questions.length > 50) {
    return res.status(400).json({ errors: [{ msg: 'Quiz must have between 1 and 50 questions' }] });
  }

  // Validate each question
  for (const question of questions) {
    if (!question.text || question.text.trim().length === 0 || question.text.length > 1000) {
      return res.status(400).json({ errors: [{ msg: 'Each question must have text of at most 1000 characters' }] });
    }

    if (!Array.isArray(question.options) || question.options.length < 2) {
      return res.status(400).json({ errors: [{ msg: 'Each question must have at least 2 options' }] });
    }

    if (!question.options.some(option => option.isCorrect)) {
      return res.status(400).json({ errors: [{ msg: 'Each question must have at least one correct option' }] });
    }

    for (const option of question.options) {
      if (!option.text || option.text.trim().length === 0 || option.text.length > 500) {
        return res.status(400).json({ errors: [{ msg: 'Each option must have text of at most 500 characters' }] });
      }
    }
  }

  // Validate time limit
  if (!timeLimit || timeLimit < 1 || timeLimit > 180) {
    return res.status(400).json({ errors: [{ msg: 'Time limit must be between 1 and 180 minutes' }] });
  }

  // Validate time window
  if (!windowStart || !windowEnd) {
    return res.status(400).json({ errors: [{ msg: 'Start and end time for quiz window are required' }] });
  }

  const startTime = new Date(windowStart);
  const endTime = new Date(windowEnd);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return res.status(400).json({ errors: [{ msg: 'Invalid start or end time format' }] });
  }

  if (endTime <= startTime) {
    return res.status(400).json({ errors: [{ msg: 'End time must be after start time' }] });
  }

  next();
};

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      // Handle both standard Joi errors and custom validation errors
      const errors = error.details.map(detail => {
        // Check if this is a custom validation error
        if (detail.type === 'any.invalid') {
          return { msg: detail.message };
        }
        return { msg: detail.message };
      });
      return res.status(400).json({ errors });
    }
    next();
  };
};

module.exports = {
  validateQuiz,
  validateRequest
};
