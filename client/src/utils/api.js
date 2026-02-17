import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : '/api',
  timeout: 30000, // 30 second timeout (increased for media uploads)
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
    
    // Increase timeout for file uploads
    if (config.url?.includes('upload') || config.headers['Content-Type']?.includes('multipart/form-data')) {
      config.timeout = 60000; // 60 seconds for file uploads
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    if (response.config.url?.includes('/profile')) {
      console.log('Profile API response:', {
        url: response.config.url,
        method: response.config.method,
        status: response.status,
        hasUser: !!response.data?.user
      });
    }
    return response;
  },
  (error) => {
    // Log the error for debugging
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - is the backend server running?');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('Network error - cannot reach backend server');
    }
    
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth and redirecting to login');
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;