import axios from 'axios';

/**
 * Configure Axios for both development and production.
 * In production (Vercel), we'll use a relative path /api which will be 
 * routed to the backend via vercel.json.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '/api',
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
