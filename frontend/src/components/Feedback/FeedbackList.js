import React, { useState } from 'react';
import FeedbackItem from './FeedbackItem';
import './Feedback.css';

const FeedbackList = ({ feedbacks, city }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (filter === 'all') return true;
    return feedback.issueType === filter;
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    }
    return 0;
  });

  const issueTypes = [
    { value: 'all', label: 'All Issues' },
    { value: 'pothole', label: 'Potholes' },
    { value: 'streetlight', label: 'Streetlights' },
    { value: 'intersection', label: 'Intersections' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'water', label: 'Water Logging' },
    { value: 'other', label: 'Other' }
  ];

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
            <option value="upvotes">Most Upvoted</option>
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
            <FeedbackItem key={feedback.id} feedback={feedback} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;