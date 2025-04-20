// src/services/api.js

import axios from 'axios'

// Create a single axios instance for the app
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // send cookies (if you ever need CSRF/session)
})

// Attach the token on every request if present
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
})

// Global response handler 
api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status
    // If unauthorized, clear token and reload to kick user to login
    if (status === 401 || status === 403) {
      localStorage.removeItem('token')
      // optional: redirect or reload
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default api
