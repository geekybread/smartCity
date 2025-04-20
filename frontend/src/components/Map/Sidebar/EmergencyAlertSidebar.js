// src/components/Map/Sidebar/EmergencyAlertSidebar.js

import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './EmergencyAlertSidebar.css';

const EmergencyAlertSidebar = ({ city, isActive }) => {
  const [alerts, setAlerts] = useState([]);
  const [sortBy, setSortBy] = useState('time'); // 'time' or 'level'

  useEffect(() => {
    let intervalId;

    const fetchAlerts = async () => {
      try {
        const response = await api.get(`/api/emergency-alerts/?city=${encodeURIComponent(city)}`);
        setAlerts(response.data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    if (isActive && city) {
      fetchAlerts(); // initial fetch
      intervalId = setInterval(fetchAlerts, 30000); // poll every 30s
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, city]);

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortBy === 'level') {
      const priority = { critical: 3, warning: 2, info: 1 };
      return (priority[b.level] || 0) - (priority[a.level] || 0);
    } else {
      return new Date(b.created_at) - new Date(a.created_at); // newest first
    }
  });

  return (
    <div className="alert-sidebar-wrapper">
      <div className="alert-sidebar-header">
        <h3>Emergency Alerts</h3>
        <div className="sort-controls">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="time">Time</option>
            <option value="level">Severity</option>
          </select>
        </div>
      </div>

      {sortedAlerts.length === 0 ? (
        <p>No alerts at the moment.</p>
      ) : (
        <div className="alert-list">
          {sortedAlerts.map((alert) => (
            <div key={alert.id} className={`alert-item ${alert.level}`}>
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
              <small>
                {alert.created_at
                  ? new Date(alert.created_at).toLocaleString()
                  : ''}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertSidebar;
