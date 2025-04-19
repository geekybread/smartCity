import React from 'react';

export default function AirQualitySidebar({ airQuality, onToggle }) {
  if (!airQuality) {
    return <p>No air quality data is available.</p>;
  }

  const getLevel = aqi => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
  };
  const getDesc = l => ({
    good: 'Good',
    moderate: 'Moderate',
    'unhealthy-sensitive': 'Unhealthy for Sensitive Groups',
    unhealthy: 'Unhealthy',
    'very-unhealthy': 'Very Unhealthy',
    hazardous: 'Hazardous'
  })[l];

  const level = getLevel(airQuality.aqi);

  return (
    <>
      <div className="aqi-display">
        <div className={`aqi-value aqi-${level}`}>{airQuality.aqi || 'N/A'}</div>
        <div className="aqi-label">{getDesc(level)}</div>
      </div>
      <div className="pollution-stats">
        <h3>Pollutant Details (μg/m³)</h3>
        {Object.entries(airQuality.pollutants || {})
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div className="stat-item" key={k}>
              <span>{k.toUpperCase()}</span>
              <strong>{v}</strong>
            </div>
        ))}
      </div>
    </>
  );
}
