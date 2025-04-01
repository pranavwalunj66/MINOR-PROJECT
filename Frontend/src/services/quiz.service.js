import api from './api';
import { handleQuizError } from '../utils/errorHandler';

class QuizService {
  // Get all quizzes for current user
  async getQuizzes(classId = null) {
    try {
      const url = classId ? `/quizzes?classId=${classId}` : '/quizzes';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Get a specific quiz by ID
  async getQuizById(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Create a new quiz (teacher only)
  async createQuiz(quizData) {
    try {
      const response = await api.post('/quizzes', quizData);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Update quiz details (teacher only)
  async updateQuiz(quizId, quizData) {
    try {
      const response = await api.put(`/quizzes/${quizId}`, quizData);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Delete a quiz (teacher only)
  async deleteQuiz(quizId) {
    try {
      const response = await api.delete(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Start a quiz attempt (student only)
  async startQuiz(quizId) {
    try {
      const response = await api.post(`/quizzes/${quizId}/start`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Submit a quiz attempt (student only)
  async submitQuiz(quizId, answers) {
    try {
      const response = await api.post(`/quizzes/${quizId}/submit`, { answers });
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Get quiz results
  async getQuizResults(quizId, studentId = null) {
    try {
      const url = studentId 
        ? `/quizzes/${quizId}/results/${studentId}`
        : `/quizzes/${quizId}/results`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Get quiz statistics (teacher only)
  async getQuizStatistics(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/statistics`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Export quiz results as Excel (teacher only)
  async exportQuizResults(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/export`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Extend quiz time for a student (teacher only)
  async extendQuizTime(quizId, studentId, additionalMinutes) {
    try {
      const response = await api.post(`/quizzes/${quizId}/extend-time`, {
        studentId,
        additionalMinutes,
      });
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Get active quiz attempt (student only)
  async getActiveAttempt(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/active-attempt`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Save quiz progress (student only)
  async saveProgress(quizId, answers) {
    try {
      const response = await api.post(`/quizzes/${quizId}/save-progress`, {
        answers,
      });
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }

  // Get quiz leaderboard
  async getLeaderboard(quizId) {
    try {
      const response = await api.get(`/quizzes/${quizId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw handleQuizError(error);
    }
  }
}

export const quizService = new QuizService();
