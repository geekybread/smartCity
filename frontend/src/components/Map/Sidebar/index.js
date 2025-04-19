import React from 'react';
import WeatherSidebar    from './WeatherSidebar';
import AirQualitySidebar from './AirQualitySidebar';
import TrafficSidebar    from './TrafficSidebar';
import FeedbackSidebar   from './FeedbackSidebar';
import EmergencyAlertSidebar from './EmergencyAlertSidebar';


const titles = {
  weather:    'Weather Data',
  airQuality: 'Air Quality Data',
  traffic:    'Traffic Data',
  feedback:   'City Issues & Reports',
  alerts: 'Emergency Alerts'
};

export default function Sidebar({ active, onToggle, ...rest }) {
  return (
    <div className={`right-sidebar ${active ? 'active' : ''}`}>
      {active && (
        <>
          <div className="sidebar-header">
          <h2>
            {titles[active]}
            {active === 'alerts' && rest.city ? ` – ${rest.city}` : ''}
          </h2>

            <button
              onClick={() => onToggle(active)}
              className="close-sidebar"
            >
              &times;
            </button>
          </div>
          <div className="sidebar-content">
            {active === 'weather'    && <WeatherSidebar {...rest} />}
            {active === 'airQuality' && <AirQualitySidebar {...rest} />}
            {active === 'traffic'    && <TrafficSidebar {...rest} />}
            {active === 'alerts' && <EmergencyAlertSidebar city={rest.city} isActive={active === 'alerts'} />}
            {active === 'feedback' && (
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



          </div>
        </>
      )}
    </div>
  );
}
