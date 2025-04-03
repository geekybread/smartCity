import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',      
    mobile: '',
    password: '',    
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Frontend validation
      if (!formData.username || !formData.password) {
        throw new Error('Username and password are required');
      }

      if (mode === 'register') {
        if (!formData.email) throw new Error('Email is required');
        if (!formData.name) throw new Error('Full name is required');
        if (!formData.mobile) throw new Error('Mobile number is required');
        if (!/^\d{10,15}$/.test(formData.mobile)) {
          throw new Error('Mobile number must be 10-15 digits');
        }
      }

      const endpoint = mode === 'login' ? 'login' : 'register';
      const response = await fetch(`http://localhost:8000/api/auth/${endpoint}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mode === 'login' ? {
          username: formData.username,
          password: formData.password
        } : {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: formData.name,
          mobile: formData.mobile
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify({
        username: data.username,
        email: data.email,
        name: data.name,
        mobile: data.mobile
      }));

      onLoginSuccess({
        username: data.username,
        email: data.email,
        name: data.name,
        mobile: data.mobile
      });

    } catch (error) {
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
          {mode === 'register' && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          )}
          
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
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                pattern="[0-9]{10,15}"
                title="Please enter a valid mobile number (10-15 digits)"
              />
            </>
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