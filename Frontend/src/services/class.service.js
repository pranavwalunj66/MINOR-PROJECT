import api from './api';
import { handleClassError } from '../utils/errorHandler';

class ClassService {
  // Get all classes for current user (teacher's classes or student's enrolled classes)
  async getClasses() {
    try {
      const response = await api.get('/classes');
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Get a specific class by ID
  async getClassById(classId) {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Create a new class (teacher only)
  async createClass(classData) {
    try {
      const response = await api.post('/classes', classData);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Update class details (teacher only)
  async updateClass(classId, classData) {
    try {
      const response = await api.put(`/classes/${classId}`, classData);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Delete a class (teacher only)
  async deleteClass(classId) {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Join a class using enrollment key (student only)
  async joinClass(enrollmentKey) {
    try {
      const response = await api.post('/classes/join', { enrollmentKey });
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Leave a class (student only)
  async leaveClass(classId) {
    try {
      const response = await api.post(`/classes/${classId}/leave`);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Get class students (teacher only)
  async getClassStudents(classId) {
    try {
      const response = await api.get(`/classes/${classId}/students`);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Block/unblock student from class (teacher only)
  async toggleStudentBlock(classId, studentId, blocked) {
    try {
      const response = await api.put(`/classes/${classId}/students/${studentId}`, {
        blocked,
      });
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }

  // Generate new enrollment key (teacher only)
  async regenerateEnrollmentKey(classId) {
    try {
      const response = await api.post(`/classes/${classId}/regenerate-key`);
      return response.data;
    } catch (error) {
      throw handleClassError(error);
    }
  }
}

export const classService = new ClassService();
