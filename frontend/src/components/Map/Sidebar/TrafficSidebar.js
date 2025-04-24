import React from 'react';
import '../css/TrafficPanel.css';

export default function TrafficSidebar({ showTraffic }) {
  return (
    <div className="traffic-info">
      <p>Traffic layer is currently {showTraffic ? 'enabled' : 'disabled'}.</p>
      <div className="traffic-legend">
        <div className="legend-item">
          <span className="traffic-green" /> Flowing
        </div>
        <div className="legend-item">
          <span className="traffic-yellow" /> Slow
        </div>
        <div className="legend-item">
          <span className="traffic-red" /> Congested
        </div>
      </div>
    </div>
  );
}
