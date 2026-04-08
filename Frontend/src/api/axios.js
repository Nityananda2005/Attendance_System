import axios from 'axios';

/**
 * Configure Axios for both development and production.
 * - In Development: Fallback to localhost or uses VITE_BASE_URL (for mobile testing).
 * - In Production: Uses VITE_API_URL which you will set in the Vercel Dashboard.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:4000/api',
});

// Add a request interceptor to attach JWT token
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

export default api;
