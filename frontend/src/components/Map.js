import React, { useState, useEffect, useCallback, useRef, useImperativeHandle } from 'react';
import { GoogleMap, useLoadScript, TrafficLayer } from '@react-google-maps/api';
import { getWeatherData, getCityCoordinates, getAirQualityData } from '../services/weather';
import { GOOGLE_MAPS_CONFIG } from './configs/maps';
import './Map.css';

const Map = React.forwardRef(({ city, country, onResult }, ref) => {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [map, setMap] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const prevSearchRef = useRef('');
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
  });

  const defaultZoom = city ? 13 : 6; // Default zoom levels
  const [zoom, setZoom] = useState(defaultZoom);

  useImperativeHandle(ref, () => ({
    refocus: () => {
      if (mapRef.current) {
        mapRef.current.panTo(center);
        setZoom(defaultZoom);
      }
    }
  }));

  const fetchData = useCallback(async () => {
    try {
      const currentSearch = `${city}|${country}`;
      if (prevSearchRef.current === currentSearch || (!city && !country)) {
        return;
      }
      prevSearchRef.current = currentSearch;

      console.log('ok')

      setIsLoading(true);
      setWeather(null);
      setAirQuality(null);

      const { lat, lon } = await getCityCoordinates(city, country);
      const newCenter = { lat, lng: lon };
      setCenter(newCenter);
      setZoom(defaultZoom);

      const [weatherData, airQualityData] = await Promise.all([
        getWeatherData(lat, lon),
        getAirQualityData(lat, lon).catch(error => {
          console.error('Air quality API error:', error);
          return null;
        })
      ]);

      setWeather(weatherData);
      setAirQuality(airQualityData);

      if (onResult) {
        onResult({ 
          success: true, 
          message: city 
            ? `${city} found${country ? ` in ${country}` : ''}`
            : `Showing capital of ${country}`,
          mapRef: {
            refocus: () => {
              setCenter(newCenter);
              setZoom(defaultZoom);
              if (mapRef.current) {
                mapRef.current.panTo(newCenter);
              }
            }
          }
        });
      }

    } catch (error) {
      console.error('Error:', error);
      if (onResult) {
        let message;
        switch(error.message) {
          case 'CITY_NOT_FOUND':
            message = `${city} not found${country ? ` in ${country}` : ''}`;
            break;
          case 'CITY_NOT_IN_COUNTRY':
            message = `${city} not found in ${country}`;
            break;
          case 'COUNTRY_NOT_FOUND':
            message = `${country} not found`;
            break;
          case 'INVALID_COUNTRY':
            message = `Invalid country: ${country}`;
            break;
          default:
            message = 'Failed to load location data';
        }
        onResult({ success: false, message });
      }
    } finally {
      setIsLoading(false);
    }
  }, [city, country, onResult, defaultZoom]);

  useEffect(() => {
    if (!isLoaded) return;
    fetchData();
  }, [isLoaded, fetchData, city, country]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        window.google.maps.event.trigger(mapRef.current, 'resize');
        mapRef.current.panTo(center);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [activeSidebar, center]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    setTimeout(() => {
      if (mapRef.current) {
        window.google.maps.event.trigger(mapRef.current, 'resize');
        mapRef.current.panTo(center);
      }
    }, 100);
  }, [center]);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const toggleSidebar = (sidebarName) => {
    const newActiveSidebar = activeSidebar === sidebarName ? null : sidebarName;
    setActiveSidebar(newActiveSidebar);
    setShowTraffic(newActiveSidebar === 'traffic');
  };

  const getAqiLevel = (aqi) => {
    if (!aqi) return 'no-data';
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy-sensitive';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very-unhealthy';
    return 'hazardous';
  };

  const getAqiDescription = (aqi) => {
    const levels = {
      'good': 'Good',
      'moderate': 'Moderate',
      'unhealthy-sensitive': 'Unhealthy for Sensitive Groups',
      'unhealthy': 'Unhealthy',
      'very-unhealthy': 'Very Unhealthy',
      'hazardous': 'Hazardous',
      'no-data': 'No data available'
    };
    return levels[getAqiLevel(aqi)];
  };

  const getPollutantName = (code) => {
    const names = {
      'pm25': 'PM2.5',
      'pm10': 'PM10',
      'o3': 'Ozone (O₃)',
      'no2': 'Nitrogen Dioxide (NO₂)',
      'so2': 'Sulfur Dioxide (SO₂)',
      'co': 'Carbon Monoxide (CO)'
    };
    return names[code] || code.toUpperCase();
  };

  if (loadError) return <div className="map-error">Error loading maps</div>;
  if (!isLoaded) return <div className="map-loading">Loading Maps...</div>;

  return (
    <div className="map-page-container">
      <div className="left-panel">
        <div 
          className={`control-card ${activeSidebar === 'weather' ? 'active' : ''}`} 
          onClick={() => toggleSidebar('weather')}
        >
          <div className="control-icon">☀️</div>
          <div className="control-label">Weather</div>
        </div>
        <div 
          className={`control-card ${activeSidebar === 'airQuality' ? 'active' : ''}`} 
          onClick={() => toggleSidebar('airQuality')}
        >
          <div className="control-icon">🌫️</div>
          <div className="control-label">Air Quality</div>
        </div>
        <div 
          className={`control-card ${activeSidebar === 'traffic' ? 'active' : ''}`} 
          onClick={() => toggleSidebar('traffic')}
        >
          <div className="control-icon">🚦</div>
          <div className="control-label">Traffic</div>
        </div>
      </div>
      

      <div className={`map-container ${activeSidebar ? 'sidebar-open' : ''}`}>
        <GoogleMap
          
          mapContainerStyle={{
            width: '100%',
            height: '100%'
          }}
          zoom={zoom}
          center={center}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            gestureHandling: 'greedy',
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            rotateControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }]
              }
            ]
          }}
        >
          {showTraffic && <TrafficLayer />}
        </GoogleMap>
      </div>

      <div className={`right-sidebar ${activeSidebar ? 'active' : ''}`}>
        {activeSidebar === 'weather' && weather && (
          <>
            <div className="sidebar-header">
              <h2>Weather Data</h2>
              <button onClick={() => toggleSidebar('weather')} className="close-sidebar">
                &times;
              </button>
            </div>
            <div className="sidebar-content">
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
            </div>
          </>
        )}

        {activeSidebar === 'airQuality' && (
          <>
            <div className="sidebar-header">
              <h2>
                {airQuality?.station ? `Air Quality at ${airQuality.station}` : 'Air Quality Data'}
              </h2>
              <button onClick={() => toggleSidebar('airQuality')} className="close-sidebar">
                &times;
              </button>
            </div>
            <div className="sidebar-content">
              {airQuality ? (
                <>
                  <div className="aqi-display">
                    <div className={`aqi-value aqi-${getAqiLevel(airQuality.aqi)}`}>
                      {airQuality.aqi || 'N/A'}
                    </div>
                    <div className="aqi-label">
                      {getAqiDescription(airQuality.aqi)}
                      {airQuality.dominentpol && (
                        <div className="dominant-pollutant">
                          Dominant: {airQuality.dominentpol.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pollution-stats">
                    <h3>Pollutant Details (μg/m³)</h3>
                    {Object.entries(airQuality.pollutants || {})
                      .filter(([_, value]) => value)
                      .map(([key, value]) => (
                        <div className="stat-item" key={key}>
                          <span>{getPollutantName(key)}</span>
                          <strong>{value}</strong>
                        </div>
                      ))
                    }
                  </div>
                  
                  {airQuality.attribution?.length > 0 && (
                    <div className="attribution">
                      <h3>Data Sources</h3>
                      {airQuality.attribution.map((source, i) => (
                        <div key={i}>
                          <a href={source.url} target="_blank" rel="noopener noreferrer">
                            {source.name}
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-air-quality-data">
                  <p>Air quality data is not available for this location.</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeSidebar === 'traffic' && (
          <>
            <div className="sidebar-header">
              <h2>Traffic Data</h2>
              <button onClick={() => toggleSidebar('traffic')} className="close-sidebar">
                &times;
              </button>
            </div>
            <div className="sidebar-content">
              <div className="traffic-info">
                <p>Traffic layer is currently {showTraffic ? 'enabled' : 'disabled'} on the map.</p>
                <div className="traffic-legend">
                  <div className="legend-item">
                    <span className="traffic-green"></span>
                    <span>Flowing</span>
                  </div>
                  <div className="legend-item">
                    <span className="traffic-yellow"></span>
                    <span>Slow</span>
                  </div>
                  <div className="legend-item">
                    <span className="traffic-red"></span>
                    <span>Congested</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default Map;