// src/components/Map/Sidebar/FeedbackSidebar.js

import React, { useEffect, useState } from 'react';
import FeedbackForm from '../../Feedback/FeedbackForm';
import FeedbackList from '../../Feedback/FeedbackList';
import api from '../../../services/api';
import '../../Feedback/Feedback.css';  

export default function FeedbackSidebar({
  city,
  isActive,
  showFeedbackForm,
  selectedLocation,
  onReportClick,
  onFeedbackSubmit,
  onToggle
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive && city) {
      const fetchFeedbacks = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/feedback/?city=${encodeURIComponent(city)}`);
          setFeedbacks(response.data);
        } catch (err) {
          console.error('❌ Failed to fetch feedbacks:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchFeedbacks();
    }
  }, [city, isActive]);

  if (showFeedbackForm) {
    return (
      <FeedbackForm
        key={selectedLocation.name}
        onSubmit={onFeedbackSubmit}
        onCancel={() => onToggle('feedback')}
        location={selectedLocation}
      />
    );
  }

  return (
    <>
      <button className="report-issue-btn" onClick={onReportClick}>
        Report New Issue
      </button>

      {loading ? (
        <p>Loading feedbacks...</p>
      ) : (
        <FeedbackList feedbacks={feedbacks} city={city} />
      )}
    </>
  );
}
