const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return res.status(400).json({
        message: 'Validation error',
        errors: errorMessage
      });
    }

    next();
  };
};

module.exports = validateRequest;
