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

// Add a response interceptor to handle 401 (Unauthorized) errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Skip automatic logout/redirect if the 401 occurs during a login attempt
      // This allows the login page to show "Invalid Credentials" instead of jumping to the splash page
      if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
        return Promise.reject(error);
      }

      // Auto logout if unauthorized (e.g. account deleted or token expired)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
