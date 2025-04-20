// src/components/Feedback/FeedbackList.js

import React, { useState, useEffect } from 'react';
import FeedbackItem from './FeedbackItem';
import './Feedback.css';
import api from '../../services/api'; 

const FeedbackList = ({ city }) => { 
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [issueFilter, setIssueFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // New filter for progress/status

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/feedback/?city=${encodeURIComponent(city)}`);
        const transformedData = response.data.map(item => ({
          ...item,
          issueType: item.issue_type,
          timestamp: item.created_at,
          status: item.status || 'In Progress'  // fallback if status is missing
        }));
        setFeedbacks(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchFeedbacks();
    }
  }, [city]);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const issueMatch = issueFilter === 'all' || feedback.issueType === issueFilter;
    const statusMatch = statusFilter === 'all' || feedback.status === statusFilter;
    return issueMatch && statusMatch;
  });

  const issueTypes = [
    { value: 'all', label: 'All Issues' },
    { value: 'pothole', label: 'Potholes' },
    { value: 'streetlight', label: 'Streetlights' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'water', label: 'Water Logging' },
    { value: 'other', label: 'Other' }
  ];

  const progressStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'reported', label: 'Reported' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' }
  ];
  

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="feedback-list">
      <div className="feedback-controls">
        <div className="filter-control">
          <label>Filter by Issue:</label>
          <select value={issueFilter} onChange={(e) => setIssueFilter(e.target.value)}>
            {issueTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div className="progress-control">
          <label>Progress:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {progressStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredFeedbacks.length === 0 ? (
        <div className="no-feedbacks">
          No matching reports for {city}.
        </div>
      ) : (
        <div className="feedback-items">
          {filteredFeedbacks.map((feedback) => (
            <FeedbackItem 
              key={feedback.id} 
              feedback={feedback}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
