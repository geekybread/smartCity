import React, { useState } from 'react';
import './Feedback.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const FeedbackItem = ({ feedback, showAdminControls = false }) => {
  const { user, isAdmin } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(feedback?.upvotes || 0);
  const [currentStatus, setCurrentStatus] = useState(feedback?.status || 'reported');
  const [adminResponse, setAdminResponse] = useState(feedback?.admin_response || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleUpvote = async () => {
    if (!user) {
      alert('Please login to upvote');
      return;
    }
    
    try {
      const response = await axios.post(
        `/api/feedback/${feedback.id}/upvote/`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setUpvoteCount(response.data.upvotes);
      setUpvoted(true);
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const response = await axios.patch(
        `/api/feedback/${feedback.id}/`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

  const handleAdminResponse = async () => {
    try {
      await axios.patch(
        `/api/feedback/${feedback.id}/`,
        { admin_response: adminResponse },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Response update failed:', error);
    }
  };

  const getIcon = (type) => {
    if (!type) return '❗';
    switch(type.toLowerCase()) {
      case 'pothole': return '🕳️';
      case 'streetlight': return '💡';
      case 'intersection': return '🚦';
      case 'garbage': return '🗑️';
      case 'water': return '💧';
      default: return '❗';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'gray';
    switch(status.toLowerCase()) {
      case 'reported': return '#6c757d';
      case 'in_progress': return '#007bff';
      case 'resolved': return '#28a745';
      default: return 'gray';
    }
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.toString().replace(/_/g, ' ');
  };

  return (
    <div className="feedback-item">
      <div className="feedback-header">
        <span className="feedback-icon">{getIcon(feedback?.issueType)}</span>
        <span className="feedback-type">
          {formatText(feedback?.issueType || 'Unknown')}
        </span>
        <span 
          className="feedback-status" 
          style={{ backgroundColor: getStatusColor(currentStatus) }}
        >
          {formatText(currentStatus)}
        </span>
      </div>
      
      <div className="feedback-description">
        {feedback?.description || 'No description provided'}
      </div>
      
      {(showAdminControls || isAdmin) && (
        <div className="admin-controls">
          <div className="status-control">
            <label>Update Status:</label>
            <select 
              value={currentStatus} 
              onChange={handleStatusChange}
            >
              <option value="reported">Reported</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="admin-response">
            {isEditing ? (
              <>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Enter official response..."
                />
                <button onClick={handleAdminResponse}>Save Response</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                {adminResponse && (
                  <div className="official-response">
                    <strong>Official Response:</strong>
                    <p>{adminResponse}</p>
                  </div>
                )}
                <button onClick={() => setIsEditing(true)}>
                  {adminResponse ? 'Edit Response' : 'Add Response'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="feedback-meta">
        <button 
          className={`upvote-btn ${upvoted ? 'upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={upvoted || !user}
        >
          👍 {upvoteCount}
        </button>
        
        <div className="feedback-location-date">
          <span className="feedback-location">
            {feedback?.location_name || feedback?.location || 'Location not specified'}
          </span>
          <span className="feedback-date">
            {feedback?.created_at ? new Date(feedback.created_at).toLocaleString() : 
             feedback?.timestamp ? new Date(feedback.timestamp).toLocaleString() : 'Unknown date'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItem;