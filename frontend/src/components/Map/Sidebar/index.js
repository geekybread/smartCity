// src/components/Map/Sidebar/index.js

import React from 'react'
import { useAuth } from '../../../context/AuthContext'
import WeatherSidebar        from './WeatherSidebar'
import AirQualitySidebar     from './AirQualitySidebar'
import TrafficSidebar        from './TrafficSidebar'
import FeedbackSidebar       from './FeedbackSidebar'
import EmergencyAlertSidebar from './EmergencyAlertSidebar'
import '../Map.css'

const titles = {
  weather:    'Weather Data',
  airQuality: 'Air Quality Data',
  traffic:    'Traffic Data',
  feedback:   'City Issues & Reports',
  alerts:     'Emergency Alerts',
  zones:      'Accident Zones',
}

export default function Sidebar({
  active,
  onToggle,
  accidentZones = [],
  alerts = [],
  ...rest
}) {
  const { user } = useAuth()

  return (
    <div className={`right-sidebar ${active ? 'active' : ''}`}>
      {active && (
        <>
          <div className="sidebar-header">
            <h2>
              {titles[active]}
              {(active === 'alerts' || active === 'zones') && rest.city
                ? ` – ${rest.city}`
                : ''}
            </h2>
            <button onClick={() => onToggle(active)} className="close-sidebar">
              &times;
            </button>
          </div>
          <div className="sidebar-content">
            {active === 'weather'    && <WeatherSidebar {...rest} />}
            {active === 'airQuality' && <AirQualitySidebar {...rest} />}
            {active === 'traffic'    && <TrafficSidebar {...rest} />}
            {active === 'alerts'     && (
              <EmergencyAlertSidebar
                city={rest.city}
                alerts={alerts}
                isActive={active === 'alerts'}
                user={user}
              />
            )}
            {active === 'feedback'   && (
              <FeedbackSidebar
                city={rest.city}
                isActive={active === 'feedback'}
                showFeedbackForm={rest.showFeedbackForm}
                selectedLocation={rest.selectedLocation}
                onReportClick={rest.onReportClick}
                onFeedbackSubmit={rest.onFeedbackSubmit}
                onToggle={onToggle}
              />
            )}
            {active === 'zones' && (
              <div className="zones-sidebar">
                <h3>Accident Zones in {rest.city}</h3>
                {accidentZones.length > 0 ? (
                  <ul className="zone-list">
                    {accidentZones.map(z => (
                      <li key={z.id}>{z.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No accident zones defined for {rest.city}.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
