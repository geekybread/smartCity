import React, { useState, useEffect } from 'react';
import FeedbackItem from './FeedbackItem';
import './Feedback.css';
import api from '../../services/api'; // Import your axios instance

const FeedbackList = ({ city }) => { // Removed `feedbacks` prop (now fetched internally)
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Fetch data from backend
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await api.get('/api/feedback/');
        // Transform backend data to match frontend structure
        const transformedData = response.data.map(item => ({
          ...item,
          id: item.id,  // Backend: id → Frontend: id
          issueType: item.issue_type,  // Backend: issue_type → Frontend: issueType
          timestamp: item.created_at,  // Backend: created_at → Frontend: timestamp
        }));
        setFeedbacks(transformedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  // Filter and sort logic
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.issue_type === filter; // Use original field for filtering
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at) - new Date(a.created_at); // Sort by original field
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
              feedback={{
                ...feedback,
                // Ensure FeedbackItem receives expected props:
                issueType: feedback.issue_type, // Transform again if needed
                timestamp: feedback.created_at
              }} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;