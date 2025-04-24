// src/components/Auth/GoogleLogin.js

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import './GoogleLogin.css';

const GoogleAuth = () => {
  const { user, login, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSuccess = async credentialResponse => {
    const id_token = credentialResponse.credential;

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/`,
        { id_token },
        { withCredentials: true }
      );
      login(data.key, {
        ...data.user,
        first_name: data.user.first_name || '',
      });
      
      toast.success(`✅ Welcome, ${data.user?.first_name || 'User'}!`);
    } catch (err) {
      console.error('❌ Backend error:', err.response?.data || err.message);
      toast.error(`❌ Login failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return '?';
    const name = nameOrEmail.split('@')[0];
    return name[0].toUpperCase();
  };

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      {!user ? (
        <div className="google-auth-wrapper">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error('❌ Google Login Failed')}
            ux_mode="popup"
            theme="outline"
            size="large"
          />
        </div>
      ) : (
        <div className="user-menu">
          <div className="avatar-circle" onClick={toggleMenu}>
            {user.first_name?.[0]?.toUpperCase() || getInitials(user.email)}
          </div>
          {menuOpen && (
            <div className="dropdown-menu">
              <div className="user-name">
              👤 {user.first_name || user.email.split('@')[0]}
              </div>
            
              <button
                className="dropdown-action"
                onClick={() => {
                  setMenuOpen(false);
                  window.location.href = "/profile";
                }}
              >
                Profile
              </button>


            
              <button
                className="dropdown-action logout-btn"
                onClick={() => {
                  logout();
                  toast.info("🔓 Logged out");
                  setMenuOpen(false);
                }}
              >
                Logout
              </button>

            </div>
          
          )}
        </div>
      )}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuth;
