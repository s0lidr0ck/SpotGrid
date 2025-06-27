import axios from 'axios';
import { getStoredToken } from './auth';

// Create axios instance for API calls
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  config => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // Handle session timeouts
    if (error.response && error.response.status === 401) {
      // Check if it's not the login endpoint that's failing
      if (!error.config.url.includes('/auth/login')) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);