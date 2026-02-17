import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - is the backend server running?');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - cannot reach backend server');
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;