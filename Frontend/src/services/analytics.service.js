import api from './api';
import { handleApiError } from '../utils/errorHandler';

class AnalyticsService {
  // Get class leaderboard
  async getClassLeaderboard(classId) {
    try {
      const response = await api.get(`/analytics/classes/${classId}/leaderboard`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get student performance in a class
  async getStudentClassPerformance(classId, studentId = null) {
    try {
      const url = studentId
        ? `/analytics/classes/${classId}/students/${studentId}`
        : `/analytics/classes/${classId}/performance`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get teacher's overall statistics
  async getTeacherStats() {
    try {
      const response = await api.get('/analytics/teacher/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get student's overall statistics
  async getStudentStats() {
    try {
      const response = await api.get('/analytics/student/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get class analytics (teacher only)
  async getClassAnalytics(classId) {
    try {
      const response = await api.get(`/analytics/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get quiz analytics (teacher only)
  async getQuizAnalytics(quizId) {
    try {
      const response = await api.get(`/analytics/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get performance trends
  async getPerformanceTrends(type = 'student', id = null) {
    try {
      const params = id ? `?id=${id}` : '';
      const response = await api.get(`/analytics/trends/${type}${params}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Export class analytics as Excel (teacher only)
  async exportClassAnalytics(classId) {
    try {
      const response = await api.get(`/analytics/classes/${classId}/export`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get question-wise analytics for a quiz (teacher only)
  async getQuestionAnalytics(quizId) {
    try {
      const response = await api.get(`/analytics/quizzes/${quizId}/questions`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Get student performance comparison
  async getStudentComparison(studentId, classId = null) {
    try {
      const url = classId
        ? `/analytics/students/${studentId}/compare?classId=${classId}`
        : `/analytics/students/${studentId}/compare`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export const analyticsService = new AnalyticsService();
