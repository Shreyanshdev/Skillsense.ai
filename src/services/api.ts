// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getCookie, setCookie, removeCookie } from './cookieUtils'; // Make sure this file exists and exports correctly
import {jwtDecode} from 'jwt-decode'; // Make sure @types/jwt-decode is installed

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  withCredentials: true, // IMPORTANT: Allows sending and receiving cookies.
});


let isRefreshing = false;

let failedQueue: Array<{
    resolve: (value: AxiosResponse<any>) => void; // Resolve with the full AxiosResponse
    reject: (reason?: any) => void;
    config: AxiosRequestConfig; // Use AxiosRequestConfig here as it's what you initially pass
}> = [];

/**
 * Processes the queue of failed requests after a token refresh attempt.
 * @param newAccessToken - The new access token if refresh was successful.
 * @param error - The error object if the refresh failed.
 */
const processQueue = (newAccessToken: string | null, error: any | null = null) => {
  failedQueue.forEach(async prom => { // Add 'async' here
    if (error) {
      prom.reject(error); // Reject the pending promise if refresh failed.
    } else if (newAccessToken) {
      // Update the request config with the new token
      prom.config.headers = prom.config.headers || {};
      (prom.config.headers as any).Authorization = `Bearer ${newAccessToken}`; // Type assertion for headers
      try {
        const res = await api(prom.config); // AWAIT HERE to get the actual response
        prom.resolve(res); // Resolve with the actual AxiosResponse
      } catch (err) {
        prom.reject(err); // If retry fails, reject the queued promise
      }
    } else {
        // This case should ideally not happen if error is handled.
        prom.reject(new Error("Token refresh failed without specific error."));
    }
  });
  failedQueue = []; // Clear the queue.
};

// Axios Request Interceptor: Add access token to outgoing requests and proactively check expiry.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => { // Change type here
    const accessToken = getCookie('token'); // Assuming 'token' is the access token cookie name

    if (accessToken && config.headers) {
      try {
        // Proactively check token expiry
        const decodedToken: { exp: number } = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token is expired. Don't add it. Let the response interceptor handle the 401.
          // Or, for immediate rejection, you could reject the request here.
        } else {
          // Ensure headers is treated as a generic object for assignment
          (config.headers as any).Authorization = `Bearer ${accessToken}`;
        }
      } catch (e) {
        // If token is malformed, clear it and force login.
        removeCookie('token');
        removeCookie('refreshToken');
        if (typeof window !== 'undefined') { window.location.href = '/login'; }
        return Promise.reject(new Error("Malformed access token. Logging out."));
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


// Axios Response Interceptor for automatic token refreshing.
api.interceptors.response.use(
  (response) => response, // If response is successful, just return it.
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _isRetry?: boolean };

    // Check if the error is a 401 Unauthorized response
    // AND if it's not already the refresh token request itself (to prevent infinite loop)
    // AND if this specific request hasn't been retried already (`_isRetry` flag).
    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh-token' && !originalRequest._isRetry) {
      originalRequest._isRetry = true; // Mark the request to prevent infinite retry loops.

      // Return a new Promise that will resolve/reject once the token refresh is complete.
      return new Promise((resolve, reject) => {
        // Add original request (with its resolve/reject) to the queue.
        failedQueue.push({ resolve, reject, config: originalRequest });

        // Only trigger a refresh if one isn't already in progress.
        if (!isRefreshing) {
          isRefreshing = true; // Set flag to indicate refresh is in progress.

          // Make the request to the refresh token endpoint.
          // The browser automatically sends the httpOnly refreshToken cookie.
          api.post('/auth/refresh-token')
            .then(refreshRes => {
              isRefreshing = false; // Reset flag as refresh is complete.
              const newAccessToken = getCookie('token'); // Read the new token from cookies

              if (newAccessToken) {
                  processQueue(newAccessToken); // Process all queued requests.
                  // Update the original request's headers and retry it immediately.
                  originalRequest.headers = originalRequest.headers || {};
                  (originalRequest.headers as any).Authorization = `Bearer ${newAccessToken}`; // Type assertion
                  resolve(api(originalRequest)); // Resolve the main promise with the retried request's promise
              } else {
                  // This means refresh-token endpoint succeeded but didn't set 'token' cookie.
                  // Treat as refresh failure and reject.
                  throw new Error("Refresh token endpoint succeeded but no new access token cookie found.");
              }
            })
            .catch((refreshError) => {
              isRefreshing = false; // Reset flag.
              // Pass the error to processQueue to reject all pending requests.
              processQueue(null, refreshError);
              
              // Clear all tokens and redirect to login if refresh failed.
              removeCookie('token');
              removeCookie('refreshToken');
              if (typeof window !== 'undefined') {
                window.location.href = '/login'; // Redirect to the login page.
              }
              // Reject the original request promise with the refresh error.
              reject(refreshError);
            });
        }
      });
    }

    // For any other error status (e.g., 400, 403, 500) or if it was the refresh token request itself that failed,
    // or if the request was already retried, just propagate the original error.
    return Promise.reject(error);
  }
);

export default api;