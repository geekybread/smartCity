import React, { useState, useEffect } from 'react';
import './Feedback.css';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import CommentSection from './CommentSection'; // ✅ Import modular comment UI

const FeedbackItem = ({ feedback }) => {
  const { user } = useAuth();
  const [upvoted, setUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(feedback?.upvotes || 0);
  const [showComments, setShowComments] = useState(false);


  useEffect(() => {
    const userKey = user ? `upvotedFeedbacks_${user.email}` : null;
    const votedList = userKey ? JSON.parse(localStorage.getItem(userKey) || '[]') : [];
  
    setUpvoted(feedback.has_upvoted || votedList.includes(feedback.id));
  }, [feedback, user]);
  
  const handleUpvote = async () => {
    if (!user) {
      alert('Please login to upvote');
      return;
    }

    try {
      const response = await axios.post(
        `/api/feedback/${feedback.id}/upvote/`,
        {},
        { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
      );
      setUpvoteCount(response.data.upvotes);
      setUpvoted(true);

      const userKey = `upvotedFeedbacks_${user.email}`;
      const voted = JSON.parse(localStorage.getItem(userKey) || '[]');
      const updated = Array.from(new Set([...voted, feedback.id])).map(Number);
      localStorage.setItem(userKey, JSON.stringify(updated));
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const getIcon = (type) => {
    if (!type) return '❗';
    switch (type.toLowerCase()) {
      case 'pothole': return '🕳️';
      case 'streetlight': return '💡';
      case 'intersection': return '🚦';
      case 'garbage': return '🗑️';
      case 'water': return '💧';
      case 'emergency': return '🚨';
      default: return '❗';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'gray';
    switch (status.toLowerCase()) {
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
    <div className="feedback-item" id={`feedback-${feedback.id}`}>
      <div className="feedback-header">
        <span className="feedback-icon">{getIcon(feedback?.issueType)}</span>
        <span className="feedback-type">
          {formatText(feedback?.issueType || 'Unknown')}
        </span>
        <span
          className="feedback-status"
          style={{ backgroundColor: getStatusColor(feedback?.status) }}
        >
          {formatText(feedback?.status)}
        </span>
      </div>

      <div className="feedback-description">
        {feedback?.description || 'No description provided'}
      </div>

      <div className="feedback-meta">
        <button
          className={`upvote-btn ${upvoted ? 'upvoted blocked' : ''}`}
          onClick={handleUpvote}
          title={upvoted ? 'You have already upvoted this report' : 'Upvote this report'}
        >
          👍 {upvoteCount}
        </button>


        <div className="feedback-location-date">
          <span className="feedback-location">
            {feedback?.location_name || feedback?.location || 'Location not specified'}
          </span>
          <span className="feedback-date">
            {feedback?.created_at
              ? new Date(feedback.created_at).toLocaleString()
              : feedback?.timestamp
                ? new Date(feedback.timestamp).toLocaleString()
                : 'Unknown date'}
          </span>
        </div>
      </div>

      {/* ✅ Comment Section */}
      <button
        className="toggle-comments-btn"
        onClick={() => setShowComments(prev => !prev)}
      >
        {showComments ? '🔽 Hide Comments' : '💬 Show Comments'}
      </button>

      {showComments && (
        <CommentSection feedbackId={feedback.id} />
      )}

    </div>
  );
};

export default FeedbackItem;
