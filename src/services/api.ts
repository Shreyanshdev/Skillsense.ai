import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { removeCookie } from './cookieUtils'; // Optional: you may only need this for cleanup

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // ✅ Send cookies like token/refreshToken on every request
});

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (value: AxiosResponse<any>) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Retry failed requests after refresh
const processQueue = (error: any | null = null) => {
  failedQueue.forEach(async (prom) => {
    if (error) {
      prom.reject(error);
    } else {
      try {
        const res = await api(prom.config); // Browser auto-sends cookies
        prom.resolve(res);
      } catch (err) {
        prom.reject(err);
      }
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR: You may still want to log or attach non-auth headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR: Auto-refresh expired access token
api.interceptors.response.use(
  (response) => response, // Success response? Return as-is
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _isRetry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest.url !== '/auth/refresh-token' &&
      !originalRequest._isRetry
    ) {
      originalRequest._isRetry = true;

      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });

        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post('/auth/refresh-token') // Browser sends refreshToken cookie
            .then(() => {
              isRefreshing = false;
              processQueue(); // Retry all failed requests
              resolve(api(originalRequest)); // Retry original request
            })
            .catch((refreshError) => {
              isRefreshing = false;
              processQueue(refreshError); // Reject all failed requests
              removeCookie('token'); // Optional: clear frontend-only cookies
              removeCookie('refreshToken');
              if (typeof window !== 'undefined') {
                window.location.href = '/login'; // Auto logout
              }
              reject(refreshError);
            });
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
