// src/context/AuthContext.js

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Token ${token}`
  return config
})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/auth/status/`);
      console.log("🧠 REFRESH USER API RESPONSE:", data); // ✅ ADD THIS
      setUser({
        email: data.email,
        first_name: data.first_name || null,
        phone_number: data.phone_number || null,
        is_phone_verified: data.is_phone_verified || false,
      });
      
    } catch {
      setUser(null);
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) checkAuthStatus()
    else setLoading(false)
  }, [])

  const checkAuthStatus = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/status/`,
        { withCredentials: true }
      );
      console.log("🔎 CHECK AUTH STATUS API RESPONSE:", data); // ✅ ADD THIS
      setUser({
        email: data.email,
        first_name: data.first_name || null,
        phone_number: data.phone_number || null,
        is_phone_verified: data.is_phone_verified || false,
      });
      
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  

  const login = (token, userData = null) => {
    localStorage.setItem('token', token)
    console.log("🔐 LOGIN CALLED with:", userData); // ✅ ADD THIS
    if (userData) {
      setUser(userData);
      setLoading(false);
    } else {
      checkAuthStatus();
    }
  }
  

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
