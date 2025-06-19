import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '', // Optional, can keep it blank for same-origin
  withCredentials: true, // Important: this ensures cookies (token, refreshToken) are sent
});

// Response interceptor for handling 401 errors (expired access token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token API
        await api.get('/api/refresh-token');

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token invalid/expired
        console.error('Refresh token expired:', refreshError);
        if (typeof window !== 'undefined') {
          window.location.href = '/login'; // Optional: redirect to login
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
