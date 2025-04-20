// ✅ src/components/Alerts/EmergencyBanner.js

import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './EmergencyBanner.css'

const EmergencyBanner = ({ city }) => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [dismissedIds, setDismissedIds] = useState(new Set())

  useEffect(() => {
    if (!city) {
      setAlerts([])
      return
    }

    const fetchAlerts = async () => {
      try {
        const { data } = await api.get(
          `/api/emergency-alerts/?city=${encodeURIComponent(city)}`
        )

        const now = new Date()
        let list = data.filter(a => new Date(a.expiry_time) > now)

        if (user) {
          list = list.filter(a => !a.is_seen)
          for (const a of list) {
            await api.post(`/api/emergency-alerts/${a.id}/mark_seen/`).catch(() => {})
          }
        }

        setAlerts(list)
      } catch (err) {
        console.error('Error fetching alerts:', err)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [city, user])

  const dismissAlert = (id) => {
    setDismissedIds(prev => {
      const next = new Set(prev).add(id);
      if (!user) {
        localStorage.setItem('dismissedAlerts', JSON.stringify([...next]));
      }
      return next;
    });
  };
  

  if (!alerts.length) return null

  return (
    <div className="emergency-banner-container">
      {alerts
        .filter(a => !dismissedIds.has(a.id))
        .map(alert => (
          <div
            key={alert.id}
            className={`emergency-banner ${alert.level?.toLowerCase() || 'info'}`}
          >
            <div className="alert-content">
              <strong>{alert.title || 'Alert'}:</strong> {alert.message}
            </div>
            <button className="dismiss-button" onClick={() => dismissAlert(alert.id)}>
              ✖  
            </button>
          </div>
        ))}
    </div>
  )
}

export default EmergencyBanner
