import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, TrafficLayer } from '@react-google-maps/api';
import { getWeatherData, getCityCoordinates } from '../services/weather';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const Map = ({ city }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [weather, setWeather] = useState({
    main: { temp: 'N/A' },
    weather: [{ description: 'N/A' }],
  });
  const [center, setCenter] = useState({
    lat: 34.04924594193164,  // Default center (Los Angeles)
    lng: -118.24104309082031,
  });
  const [map, setMap] = useState(null);
  const [showTraffic, setShowTraffic] = useState(false);  // Toggle traffic layer

  // Fetch city coordinates and update map center
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const { lat, lon } = await getCityCoordinates(city);
        setCenter({ lat, lng: lon });

        // Fetch weather data for the new city
        const weatherData = await getWeatherData(lat, lon);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error fetching city data:', error);
        setWeather({ error: 'Failed to load city data' });
      }
    };

    fetchCityData();
  }, [city]);

  // Handle map load
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  // Handle errors and loading states
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div>
      <div className="widgets">
        <div className="widget">
          <h2>Weather</h2>
          <p>
            {weather && weather.main
              ? `${weather.main.temp}°C, ${weather.weather[0].description}`
              : weather?.error || 'Loading weather data...'}
          </p>
        </div>
      </div>

      {/* Toggle Traffic Button */}
      <button
        onClick={() => setShowTraffic(!showTraffic)}
        className="traffic-toggle"
      >
        {showTraffic ? 'Hide Traffic' : 'Show Traffic'}
      </button>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        onLoad={onLoad}  // Call onLoad when the map loads
      >
        {showTraffic && <TrafficLayer />}  {/* Conditionally render traffic layer */}
      </GoogleMap>
    </div>
  );
};

export default Map;