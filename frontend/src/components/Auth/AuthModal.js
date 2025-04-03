import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Basic validation
      if (!formData.username || !formData.password) {
        throw new Error('Username and password are required');
      }

      if (mode === 'register' && !formData.email) {
        throw new Error('Email is required for registration');
      }

      const endpoint = mode === 'login' ? 'login' : 'register';
      const response = await fetch(`http://localhost:8000/api/auth/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          ...(mode === 'register' && { email: formData.email })
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('username', data.username);
        localStorage.setItem('email', data.email || ''); // New
        onLoginSuccess();
      } else {
        throw new Error(data.message || 'Authentication failed');
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Authentication failed');
      }

      if (!data.token) {
        throw new Error('No authentication token received');
      }

      // Store token and user data securely
      localStorage.setItem('authToken', data.token);
      if (data.user_id) {
        localStorage.setItem('userId', data.user_id);
      }

      onLoginSuccess();
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={onClose} disabled={isLoading}>×</button>
        <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          
          {mode === 'register' && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            minLength="8"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <p>Don't have an account? <span onClick={() => !isLoading && setMode('register')}>Register</span></p>
          ) : (
            <p>Already have an account? <span onClick={() => !isLoading && setMode('login')}>Login</span></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;