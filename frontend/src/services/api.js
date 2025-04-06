import axios from 'axios';
import Cookies from 'js-cookie';  // For CSRF tokens

const refreshToken = async () => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/auth/token/refresh/',
      { refresh: localStorage.getItem('refresh_token') },
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.access;
  } catch (err) {
    throw new Error('Token refresh failed');
  }
};

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const csrfToken = Cookies.get('csrftoken');

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const originalRequest = error.config;
      const token = localStorage.getItem('token');

      // Attempt token refresh if possible
      if (token && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const newToken = await refreshToken();  // Implement this
          localStorage.setItem('token', newToken);
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } else {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }

    // Global error handling (e.g., show toast)
    const errorMessage = error.response?.data?.message || 'Request failed';
    console.error('API Error:', errorMessage);
    return Promise.reject(error);
  }
);

// Dev-only logging
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(request => {
    console.log('Request:', request);
    return request;
  });
  api.interceptors.response.use(response => {
    console.log('Response:', response);
    return response;
  });
}

export default api;