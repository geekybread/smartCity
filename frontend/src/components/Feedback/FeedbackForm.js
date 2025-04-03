import React, { useState } from 'react';
import './Feedback.css';

const FeedbackForm = ({ onSubmit, onCancel, location }) => {
  const [formData, setFormData] = useState({
    issueType: 'pothole',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const feedback = {
      ...formData,
      location: location,
      timestamp: new Date().toISOString(),
      status: 'reported', // Default status
      upvotes: 0 // Initialize upvotes
    };
    onSubmit(feedback);
  };

  return (
    <div className="feedback-form-container">
      <h3>Report an Issue</h3>
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
            <option value="streetlight">Damaged Streetlight</option>
            <option value="intersection">Unsafe Intersection</option>
            <option value="garbage">Garbage Accumulation</option>
            <option value="water">Water Logging</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            placeholder="Please provide detailed information about the issue..."
            required
          />
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
          <button type="submit" className="submit-btn">Submit Report</button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;