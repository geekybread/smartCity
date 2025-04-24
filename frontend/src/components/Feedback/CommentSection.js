// src/components/Feedback/CommentSection.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import './Feedback.css';

const CommentSection = ({ feedbackId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/api/feedback/${feedbackId}/comments/`);
        setComments(res.data);
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };

    fetchComments();
  }, [feedbackId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(
        `/api/feedback/${feedbackId}/comments/`,
        { text: newComment },
        { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
      );
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      setCommentError(null);
    } catch (err) {
      setCommentError('Could not submit comment');
    }
  };

  return (
    <div className="feedback-comments">
      <h4>Comments</h4>
      <div className="comment-list">
        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment, i) => (
            <div key={i} className={comment.is_official ? 'official-response' : 'user-comment'}>
              <div className="comment-meta">
                <strong>{comment.is_official ? 'Admin' : comment.user_email || 'Anonymous'}:</strong>
                <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <div>{comment.text}</div>
            </div>
          ))
        )}
      </div>

      {user && (
        <div className="comment-form">
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Post</button>
          {commentError && <p className="error-message">{commentError}</p>}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
