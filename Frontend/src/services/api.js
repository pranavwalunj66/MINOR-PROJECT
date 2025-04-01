import axios from 'axios';
import { store } from '../store';
import { logout } from '../features/auth/authSlice';
import { handleApiError, ERROR_MESSAGES } from '../utils/errorHandler';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from store
    const token = store.getState().auth.token;
    
    // If token exists, add to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(handleApiError(error));
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token } = response.data;

        // Update token in store
        store.dispatch({
          type: 'auth/setCredentials',
          payload: { token },
        });

        // Update token in original request
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        store.dispatch(logout());
        return Promise.reject(handleApiError(error));
      }
    }

    // Handle maintenance mode
    if (error.response?.status === 503) {
      return Promise.reject(
        handleApiError({
          ...error,
          response: {
            ...error.response,
            data: {
              message: 'System is under maintenance. Please try again later.',
            },
          },
        })
      );
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      return Promise.reject(
        handleApiError({
          ...error,
          response: {
            ...error.response,
            data: {
              message: 'Too many requests. Please try again later.',
            },
          },
        })
      );
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(
        handleApiError({
          ...error,
          response: {
            status: 0,
            data: {
              message: ERROR_MESSAGES.NETWORK_ERROR,
            },
          },
        })
      );
    }

    return Promise.reject(handleApiError(error));
  }
);

// Add request/response timing for debugging
if (import.meta.env.MODE === 'development') {
  api.interceptors.request.use((config) => {
    config.metadata = { startTime: new Date() };
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      const endTime = new Date();
      const duration = endTime - response.config.metadata.startTime;
      console.log(`Request to ${response.config.url} took ${duration}ms`);
      return response;
    },
    (error) => {
      const endTime = new Date();
      const duration = endTime - error.config.metadata.startTime;
      console.error(`Failed request to ${error.config.url} took ${duration}ms`);
      return Promise.reject(error);
    }
  );
}

export default api;
