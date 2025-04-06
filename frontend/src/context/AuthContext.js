import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const refreshToken = async () => { /* ... */ };

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkAuthStatus = async () => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/auth/status/`,
                { withCredentials: true }
            );
            setUser(response.data.email);
            setIsAdmin(response.data.is_admin);
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
            }
            setUser(null);
            setIsAdmin(false);
        } finally {
            setLoading(false);
        }
    };

    const login = (token, isAdminLogin = false) => {
        localStorage.setItem('token', token);
        checkAuthStatus();
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAdmin, 
            loading, 
            login, 
            logout,
            checkAuthStatus 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);