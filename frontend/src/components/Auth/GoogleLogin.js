// src/components/Auth/GoogleLogin.js

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import './GoogleLogin.css'

const GoogleAuth = () => {
  const { user, login, logout } = useAuth()

  const handleSuccess = async credentialResponse => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/`,
        { id_token: credentialResponse.credential, provider: 'google' },
        { withCredentials: true }
      )
      login(data.key, data.user)
      toast.success('✅ Logged in successfully!')
    } catch {
      toast.error('❌ Login failed')
    }
  }

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
        <div className="google-auth-user-info">
          <span className="user-email">👤 {user.email}</span>
          <button
            className="logout-btn"
            onClick={() => {
              logout()
              toast.info('🔓 Logged out')
            }}
          >
            Logout
          </button>
        </div>
      )}
    </GoogleOAuthProvider>
  )
}

export default GoogleAuth
