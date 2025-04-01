// Mock auth service for development
const MOCK_USERS = {
  teacher: {
    id: 1,
    name: 'John Doe',
    email: 'teacher@example.com',
    role: 'teacher',
  },
  student: {
    id: 2,
    name: 'Jane Smith',
    email: 'student@example.com',
    role: 'student',
  },
};

const MOCK_DELAY = 500; // Simulate API delay

const mockApi = {
  async post(url, data) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    switch (url) {
      case '/auth/login': {
        const { email, password } = data;
        // For development, use simple email check to determine role
        const user = email.includes('teacher') ? MOCK_USERS.teacher : MOCK_USERS.student;
        const token = 'mock_jwt_token';
        return { data: { user, token } };
      }
      case '/auth/register': {
        const user = { ...data, id: Math.random() };
        return { data: user };
      }
      case '/auth/verify-otp': {
        return { data: { verified: true } };
      }
      default:
        throw new Error('Not implemented');
    }
  },
  async get(url) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    switch (url) {
      case '/auth/me': {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token');
        // For development, return teacher by default
        return { data: MOCK_USERS.teacher };
      }
      default:
        throw new Error('Not implemented');
    }
  },
};

export const authService = {
  async register(userData) {
    const response = await mockApi.post('/auth/register', userData);
    return response.data;
  },

  async login(credentials) {
    const response = await mockApi.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async verifyOtp(data) {
    const response = await mockApi.post('/auth/verify-otp', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  async getCurrentUser() {
    const response = await mockApi.get('/auth/me');
    return response.data;
  },
};
