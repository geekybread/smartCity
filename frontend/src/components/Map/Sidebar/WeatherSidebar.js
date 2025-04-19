import React from 'react';

export default function WeatherSidebar({ weather, onToggle }) {
  if (!weather) return null;
  return (
    <>
      <div className="weather-display">
        <div className="weather-icon">
          <img 
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`} 
            alt={weather.weather[0].description}
          />
        </div>
        <div className="weather-details">
          <div className="temperature">{Math.round(weather.main.temp)}°C</div>
          <div className="description">{weather.weather[0].description}</div>
        </div>
      </div>
      <div className="weather-stats">
        <div className="stat-item">
          <span>Feels Like</span>
          <strong>{Math.round(weather.main.feels_like)}°C</strong>
        </div>
        <div className="stat-item">
          <span>Humidity</span>
          <strong>{weather.main.humidity}%</strong>
        </div>
        <div className="stat-item">
          <span>Wind</span>
          <strong>{weather.wind.speed} m/s</strong>
        </div>
        <div className="stat-item">
          <span>Pressure</span>
          <strong>{weather.main.pressure} hPa</strong>
        </div>
      </div>
    </>
  );
}
