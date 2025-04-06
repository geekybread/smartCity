import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, TrafficLayer, Marker } from '@react-google-maps/api';
import { getWeatherData, getCityCoordinates, getAirQualityData } from '../services/weather';
import { GOOGLE_MAPS_CONFIG } from './configs/maps';
import FeedbackForm from '../components/Feedback/FeedbackForm';
import FeedbackList from '../components/Feedback/FeedbackList';
import { useAuth } from '../context/AuthContext';
import './Map.css';
import api from '../services/api';
import AdminPanel from './Admin/AdminPanel';


const loadGoogleMaps = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    document.head.appendChild(script);
  });
};


const Map = React.forwardRef(({ 
  city, 
  country, 
  onResult,
}, ref) => {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [map, setMap] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [markers, setMarkers] = useState([]);
  const prevSearchRef = useRef('');
  const mapRef = useRef(null);

  const { user, isAdmin } = useAuth();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
  });

  const defaultZoom = city ? 13 : 6;
  const [zoom, setZoom] = useState(defaultZoom);

  const handleReportClick = () => {
    if (!user) {
      alert('Please login to submit feedback');
      return;
    }
    setSelectedLocation(`${city} (${center.lat.toFixed(4)}, ${center.lng.toFixed(4)})`);
    setShowFeedbackForm(true);
  };



  const fetchData = useCallback(async () => {
    try {
      const currentSearch = `${city}|${country}`;
      if (prevSearchRef.current === currentSearch || (!city && !country)) {
        return;
      }
      prevSearchRef.current = currentSearch;

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
        }),
        fetchFeedbackReports()
      ]);

      setWeather(weatherData);
      setAirQuality(airQualityData);

      const mockFeedbacks = [
        {
          id: 1,
          issueType: 'pothole',
          description: 'Large pothole near the intersection causing traffic issues',
          severity: 'high',
          location: `${city} Central Area`,
          coordinates: { lat: lat + 0.005, lng: lon + 0.005 },
          timestamp: '2023-05-15T10:30:00Z',
          anonymous: false
        },
        {
          id: 2,
          issueType: 'streetlight',
          description: 'Streetlight flickering all night',
          severity: 'medium',
          location: `${city} Residential District`,
          coordinates: { lat: lat - 0.005, lng: lon - 0.003 },
          timestamp: '2023-05-14T18:45:00Z',
          anonymous: true
        }
      ];
      setFeedbacks(mockFeedbacks);
      updateMarkers(mockFeedbacks);

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

  const updateMarkers = (feedbackData) => {
    const newMarkers = feedbackData.map(feedback => ({
      position: { 
        lat: typeof feedback.latitude === 'number' ? 
          feedback.latitude : 
          parseFloat(feedback.latitude),
        lng: typeof feedback.longitude === 'number' ? 
          feedback.longitude : 
          parseFloat(feedback.longitude)
      },
      type: feedback.issue_type,
      severity: feedback.severity,
      id: feedback.id
    }));
    setMarkers(newMarkers);
  };

  const handleMapClick = (event) => {
    const clickedLocation = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    const locationName = `${city} (${clickedLocation.lat.toFixed(4)}, ${clickedLocation.lng.toFixed(4)})`;
    setSelectedLocation(locationName);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSubmit = async (feedback) => {
    try {
      if (!user) {
        alert('Please login to submit feedback');
        return;
      }
  
      const coordinates = mapRef.current.getCenter();
      const newFeedback = {
        ...feedback, // Add user reference
        id: `feedback-${Date.now()}`,
        location_name: selectedLocation || `${city} (${coordinates.lat().toFixed(4)}, ${coordinates.lng().toFixed(4)})`,
        latitude: coordinates.lat(),
        longitude: coordinates.lng()
      };
  
      // Send to backend
      const response = await api.post('/api/feedback/', newFeedback, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
  
      setFeedbacks(prev => [response.data, ...prev]);
      updateMarkers([response.data, ...feedbacks]);
      setShowFeedbackForm(false);
      alert('Thank you for your report!');
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback');
    }
  };


  const fetchFeedbackReports = useCallback(async () => {
    try {
      const response = await api.get(`/api/feedback/?city=${encodeURIComponent(city)}`, {
        headers: user ? { Authorization: `Token ${localStorage.getItem('token')}` } : {}
      });
      setFeedbacks(response.data);
      updateMarkers(response.data);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setFeedbacks([]);
    }
  }, [city, user]);


  const getMarkerIcon = (type, severity) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    const colors = {
      low: 'green',
      medium: 'orange',
      high: 'red'
    };
    
    const icons = {
      pothole: `${baseUrl}construction.png`,
      streetlight: `${baseUrl}streetlight.png`,
      intersection: `${baseUrl}traffic.png`,
      garbage: `${baseUrl}trash.png`,
      other: `${baseUrl}info.png`
    };
    
    return icons[type] || `${baseUrl}${colors[severity]}-dot.png`;
  };

  useEffect(() => {
    if (!isLoaded) return;
    fetchData();
  }, [isLoaded, fetchData, city, country, fetchFeedbackReports]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        window.google.maps.event.trigger(mapRef.current, 'resize');
        if (!activeSidebar) {
          mapRef.current.panTo(center);
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [center]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    setMap(map);
    map.addListener('click', handleMapClick);
    
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
    setShowFeedbackForm(false);
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
        <div className="panel-title">Menu</div>

        {isAdmin && (
          <div 
            className={`control-card ${activeSidebar === 'admin' ? 'active' : ''}`} 
            onClick={() => toggleSidebar('admin')}
          >
            <div className="control-icon">🛠️</div>
            <div className="control-label">Admin</div>
          </div>
        )}
  
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
        <div 
          className={`control-card ${activeSidebar === 'feedback' ? 'active' : ''}`} 
          onClick={() => toggleSidebar('feedback')}
        >
          <div className="control-icon">📝</div>
          <div className="control-label">Reports</div>
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
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={{
                url: getMarkerIcon(marker.type, marker.severity),
                scaledSize: new window.google.maps.Size(32, 32)
              }}
              onClick={() => {
                const feedback = feedbacks.find(f => f.id === marker.id);
                if (feedback) {
                  setSelectedLocation(feedback.location);
                  setShowFeedbackForm(true);
                }
              }}
            />
          ))}
        </GoogleMap>
      </div>

      <div className={`right-sidebar ${activeSidebar ? 'active' : ''}`}>

        {activeSidebar === 'admin' && isAdmin && (
          <>
            <div className="sidebar-header">
              <h2>Admin Dashboard</h2>
              <button onClick={() => toggleSidebar('admin')} className="close-sidebar">
                &times;
              </button>
            </div>
            <div className="sidebar-content">
              <AdminPanel feedbacks={feedbacks} />
            </div>
          </>
        )}

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

        {activeSidebar === 'feedback' && (
          <>
            <div className="sidebar-header">
              <h2>City Issues & Reports</h2>
              <button onClick={() => toggleSidebar('feedback')} className="close-sidebar">
                &times;
              </button>
            </div>
            <div className="sidebar-content">
              {showFeedbackForm ? (
                <FeedbackForm 
                  onSubmit={handleFeedbackSubmit} 
                  onCancel={() => setShowFeedbackForm(false)}
                  location={selectedLocation || `${city} (click on map to select location)`}
                />
              ) : (
                <>
                  <button 
                    className="report-issue-btn"
                    onClick={handleReportClick}
                  >
                    Report New Issue
                  </button>
                  <FeedbackList 
                    feedbacks={feedbacks} 
                    city={city}
                    isAdmin={isAdmin} // Pass admin status
                  />
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

export default Map;