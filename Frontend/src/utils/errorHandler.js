import { toast } from 'react-hot-toast';

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to server. Please check your internet connection.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  QUIZ_EXPIRED: 'This quiz has expired and is no longer available.',
  QUIZ_NOT_STARTED: 'This quiz has not started yet.',
  QUIZ_ALREADY_ATTEMPTED: 'You have already attempted this quiz.',
  CLASS_FULL: 'This class is full and cannot accept more students.',
  INVALID_ENROLLMENT_KEY: 'The enrollment key is invalid or expired.',
  STUDENT_BLOCKED: 'You have been blocked from this class.',
};

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (!error.response) {
    // Network error
    return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0);
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      // Bad request - validation errors
      return new ApiError(
        data.message || ERROR_MESSAGES.VALIDATION_ERROR,
        status,
        data.errors
      );

    case 401:
      // Unauthorized - session expired
      return new ApiError(ERROR_MESSAGES.UNAUTHORIZED, status);

    case 403:
      // Forbidden - insufficient permissions
      return new ApiError(
        data.message || ERROR_MESSAGES.FORBIDDEN,
        status
      );

    case 404:
      // Not found
      return new ApiError(
        data.message || ERROR_MESSAGES.NOT_FOUND,
        status
      );

    case 409:
      // Conflict - quiz already attempted, student blocked, etc.
      return new ApiError(data.message, status);

    case 429:
      // Too many requests
      return new ApiError(
        'Too many requests. Please try again later.',
        status
      );

    case 500:
    case 502:
    case 503:
    case 504:
      // Server errors
      return new ApiError(ERROR_MESSAGES.SERVER_ERROR, status);

    default:
      return new ApiError(
        data.message || 'An unexpected error occurred',
        status
      );
  }
};

export const showErrorToast = (error) => {
  if (error instanceof ApiError) {
    // Show validation errors if present
    if (error.errors && error.errors.length > 0) {
      error.errors.forEach((err) => {
        toast.error(err);
      });
    } else {
      toast.error(error.message);
    }
  } else {
    toast.error(ERROR_MESSAGES.SERVER_ERROR);
  }
};

export const handleQuizError = (error) => {
  if (error.response?.status === 409) {
    const { code } = error.response.data;
    switch (code) {
      case 'QUIZ_EXPIRED':
        return new ApiError(ERROR_MESSAGES.QUIZ_EXPIRED, 409);
      case 'QUIZ_NOT_STARTED':
        return new ApiError(ERROR_MESSAGES.QUIZ_NOT_STARTED, 409);
      case 'QUIZ_ALREADY_ATTEMPTED':
        return new ApiError(ERROR_MESSAGES.QUIZ_ALREADY_ATTEMPTED, 409);
      default:
        return handleApiError(error);
    }
  }
  return handleApiError(error);
};

export const handleClassError = (error) => {
  if (error.response?.status === 409) {
    const { code } = error.response.data;
    switch (code) {
      case 'CLASS_FULL':
        return new ApiError(ERROR_MESSAGES.CLASS_FULL, 409);
      case 'INVALID_ENROLLMENT_KEY':
        return new ApiError(ERROR_MESSAGES.INVALID_ENROLLMENT_KEY, 409);
      case 'STUDENT_BLOCKED':
        return new ApiError(ERROR_MESSAGES.STUDENT_BLOCKED, 409);
      default:
        return handleApiError(error);
    }
  }
  return handleApiError(error);
};
