import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import axios from 'axios';
import PhoneVerificationModal from '../components/Auth/PhoneVerificationModal';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    
  const { user, refreshUser } = useAuth();
  console.log("👤 USER IN PROFILE PAGE:", user);
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [originalPhone] = useState(user?.phone_number || '');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleSave = async () => {
    try {
      if (!firstName.trim()) {
        toast.error("Name can't be empty");
        return;
      }

      const profileData = { first_name: firstName };

      if (phone !== originalPhone) {
        setShowVerifyModal(true);
        return; // verification modal will handle update
      }

      await axios.patch('/api/accounts/profile/', profileData);
      toast.success("✅ Profile updated");
      setEditMode(false);
      refreshUser();
    } catch (err) {
      toast.error("❌ Failed to update profile");
    }
  };

  const handleVerifiedPhone = async () => {
    try {
      await axios.patch('/api/accounts/profile/', {
        first_name: firstName,
        phone_number: phone
      });
      toast.success("✅ Phone verified & updated");
      setShowVerifyModal(false);
      setEditMode(false);
      refreshUser();
    } catch {
      toast.error("❌ Could not update phone number");
    }
  };

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Please login to view your profile.</h2>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  


  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>👤 Your Profile</h2>

        <label>Name:</label>
        {editMode ? (
          <input value={firstName} onChange={e => setFirstName(e.target.value)} />
        ) : (
            <p>{user.first_name || user.email.split('@')[0]}</p>
        )}

        <label>Email:</label>
        <p>{user.email}</p>

        <label>Mobile Number:</label>
        {editMode ? (
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        ) : (
          <p>{user.phone_number || '—'}</p>
        )}

        {editMode ? (
          <div className="profile-buttons">
            <button className="save-button" onClick={handleSave}>Save</button>
            <button className="cancel-button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        ) : (
          <button className="edit-button" onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
        )}

        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </button>
      </div>

      {showVerifyModal && (
        <PhoneVerificationModal
          isOpen={showVerifyModal}
          phone={phone}
          onClose={() => setShowVerifyModal(false)}
          onVerified={handleVerifiedPhone}
        />
      )}
    </div>
  );
};

export default ProfilePage;
