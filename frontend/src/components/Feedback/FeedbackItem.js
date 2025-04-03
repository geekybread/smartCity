import React, { useState } from 'react';
import './Feedback.css';

const FeedbackItem = ({ feedback }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(feedback?.upvotes || 0);

  const handleUpvote = () => {
    if (!upvoted) {
      setUpvoteCount(upvoteCount + 1);
      setUpvoted(true);
      // Here you would also update the backend
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
      case 'reported': return 'gray';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
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
        {feedback?.status && (
          <span 
            className="feedback-status" 
            style={{ backgroundColor: getStatusColor(feedback.status) }}
          >
            {formatText(feedback.status)}
          </span>
        )}
      </div>
      <div className="feedback-description">
        {feedback?.description || 'No description provided'}
      </div>
      
      <div className="feedback-meta">
        <button 
          className={`upvote-btn ${upvoted ? 'upvoted' : ''}`}
          onClick={handleUpvote}
          disabled={upvoted}
        >
          👍 {upvoteCount}
        </button>
        
        <div className="feedback-location-date">
          <span className="feedback-location">
            {feedback?.location || 'Location not specified'}
          </span>
          <span className="feedback-date">
            {feedback?.timestamp ? new Date(feedback.timestamp).toLocaleString() : 'Unknown date'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItem;