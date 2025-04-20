import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import './Feedback.css';
import { useAuth } from '../../context/AuthContext';

const FeedbackForm = ({ onSubmit, onCancel, location }) => {
  const [formData, setFormData] = useState({
    issueType: 'pothole',
    description: '',
    severity: 'medium',
    //isAnonymous: false,
  });
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please login to submit feedback');
      return;
    }

    const feedbackData = {
      issue_type: formData.issueType,
      description: DOMPurify.sanitize(formData.description),
      severity: formData.severity,
      location_name: location?.name || location?.address || "Unknown location",
      latitude: location?.lat,
      longitude: location?.lng,
      city: location?.city || "Unknown city",
      upvotes: 0,
    };
    onSubmit(feedbackData);
  };

  
  const isFormValid = formData.description.trim() !== '';

  return (
    <div className="feedback-form-container">
      <h3>Report an Issue</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Issue Type:</label>
          <select 
            name="issueType" 
            value={formData.issueType} 
            onChange={handleChange}
            required
          >
            <option value="pothole">Pothole</option>
            <option value="streetlight">Street Light</option>
            <option value="garbage">Garbage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="Describe the issue..."
            required
          />
        </div>

        <div className="form-group">
          <label>Severity:</label>
          <select 
            name="severity" 
            value={formData.severity} 
            onChange={handleChange} 
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="form-group">
          <p className="location-display">
            <strong>Location:</strong> {location}
          </p>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={!isFormValid}
          >
            Submit Report
          </button>
        </div>
      </form>
    </div>
  );
};

FeedbackForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  location: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    lat: PropTypes.number,
    lng: PropTypes.number,
  }).isRequired,
};

export default FeedbackForm;