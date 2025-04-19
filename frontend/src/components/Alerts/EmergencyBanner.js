import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './EmergencyBanner.css';

console.log('✅ EmergencyBanner loaded');

const EmergencyBanner = ({ city }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(new Set());


  useEffect(() => {
    console.log('🟢 useEffect in EmergencyBanner fired');

    const fetchAlerts = async () => {
      try {
        const response = await api.get(`/api/alerts/?city=${encodeURIComponent(city)}`);
        console.log('🚨 ALERT RESPONSE:', response.data);
        setAlerts(response.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 30000); // Poll every 30s
    return () => clearInterval(interval); // Cleanup
  }, [city]);

  useEffect(() => {
    const stored = localStorage.getItem('dismissedAlerts');
    if (stored) {
      setDismissedIds(new Set(JSON.parse(stored)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dismissedAlerts', JSON.stringify(Array.from(dismissedIds)));
  }, [dismissedIds]);

  const dismissAlert = (id) => {
    setDismissedIds(prev => new Set(prev).add(id));
  };  

  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="emergency-banner-container">
      {alerts.filter(alert => !dismissedIds.has(alert.id)).map(alert => (
        <div key={alert.id} className={`emergency-banner ${alert.level}`}>
          <div className="alert-content">
            <strong>{alert.title}:</strong> {alert.message}
          </div>
          <button className="dismiss-button" onClick={() => dismissAlert(alert.id)}>✖</button>
        </div>
      ))}

    </div>
  );
};

export default EmergencyBanner;
