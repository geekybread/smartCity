// src/components/Auth/PhoneVerificationModal.js
import React, { useState } from 'react';
import './PhoneVerificationModal.css'; // optional styling
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


export default function PhoneVerificationModal({ isOpen, onClose, onVerified }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { logout } = useAuth();


  if (!isOpen) return null;

  const handleStartVerification = async () => {
    setError(null);
    setLoading(true);
    try {
      await axios.post('/api/accounts/verify/start/', { phone });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/accounts/verify/check/', { phone, code: otp });
      if (res.data.verified) {
        onVerified();
        onClose();
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-verification-backdrop">
      <div className="phone-verification-modal">
        <h2>📱 Verify Your Phone</h2>

        {step === 'phone' ? (
          <>
            <label>Enter your phone number (with country code):</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+919876543210"
            />
            <button onClick={handleStartVerification} disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </>
        ) : (
          <>
            <label>Enter the OTP sent to {phone}:</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
            />
            <button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </>
        )}

        <button
        onClick={logout}
        style={{
            marginTop: '1rem',
            background: 'transparent',
            color: '#ff4d4f',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '0.9rem'
        }}
        >
        Log out instead
        </button>


        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}
