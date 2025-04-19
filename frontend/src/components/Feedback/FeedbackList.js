import React, { useState, useEffect } from 'react';
import FeedbackItem from './FeedbackItem';
import './Feedback.css';
import api from '../../services/api'; 

const FeedbackList = ({ city }) => { 
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

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
    if (filter === 'all') return true;
    return feedback.issueType === filter;
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return 0;
  });

  const issueTypes = [
    { value: 'all', label: 'All Issues' },
    { value: 'pothole', label: 'Potholes' },
    { value: 'streetlight', label: 'Streetlights' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'water', label: 'Water Logging' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="feedback-list">
      <div className="feedback-controls">
        <div className="filter-control">
          <label>Filter by:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {issueTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        
        <div className="sort-control">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {sortedFeedbacks.length === 0 ? (
        <div className="no-feedbacks">
          No {filter === 'all' ? '' : filter + ' '}issues reported for {city} yet.
        </div>
      ) : (
        <div className="feedback-items">
          {sortedFeedbacks.map((feedback) => (
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
