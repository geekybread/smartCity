import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, TrafficLayer } from '@react-google-maps/api';
import { getWeatherData, getCityCoordinates } from '../services/weather';
import { GOOGLE_MAPS_CONFIG } from './configs/maps';
import './Map.css';

const Map = ({ city, country, onResult }) => {
  const [weather, setWeather] = useState(null);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [map, setMap] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const prevSearchRef = useRef('');

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries,
  });

  const fetchData = useCallback(async () => {
    try {
      const currentSearch = `${city}|${country}`;
      if (prevSearchRef.current === currentSearch || (!city && !country)) {
        return;
      }
      prevSearchRef.current = currentSearch;

      setIsLoading(true);
      setWeather(null);

      const { lat, lon } = await getCityCoordinates(city, country);
      setCenter({ lat, lng: lon });

      const weatherData = await getWeatherData(lat, lon);
      setWeather(weatherData);

      if (onResult) {
        const message = city 
          ? `${city} found${country ? ` in ${country}` : ''}`
          : `Showing capital of ${country}`;
        onResult({ success: true, message });
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
  }, [city, country, onResult]);

  useEffect(() => {
    if (!isLoaded) return;
    fetchData();
  }, [isLoaded, fetchData]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="map-page-container">
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          zoom={13}
          center={center}
          onLoad={onLoad}
        >
          {showTraffic && <TrafficLayer />}
        </GoogleMap>
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          className="traffic-toggle"
          disabled={isLoading}
        >
          {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
        </button>
      </div>
      
      <div className="weather-widget">
        <h2>Weather</h2>
        {isLoading ? (
          <div>Loading...</div>
        ) : weather ? (
          <>
            <p>{weather.main?.temp}°C</p>
            <p>{weather.weather?.[0]?.description}</p>
          </>
        ) : (
          <div>No weather data</div>
        )}
      </div>
    </div>
  );
};

export default Map;