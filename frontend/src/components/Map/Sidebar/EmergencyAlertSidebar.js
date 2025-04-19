import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import './EmergencyAlertSidebar.css';

const EmergencyAlertSidebar = ({city, isActive}) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let intervalId;
  
    const fetchAlerts = async () => {
      try {
        const response = await api.get(`/api/alerts/?city=${encodeURIComponent(city)}`);
        setAlerts(response.data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };
  
    if (isActive && city) {
      fetchAlerts(); // initial fetch
      intervalId = setInterval(fetchAlerts, 30000); // poll every 10s
    }
  
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, city]);

  return (
    <div>
      {alerts.length === 0 ? (
        <p>No alerts at the moment.</p>
      ) : (
        <div>
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.level}`}>
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
              <small>{new Date(alert.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyAlertSidebar;
