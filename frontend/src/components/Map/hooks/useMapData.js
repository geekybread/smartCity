import { useState, useCallback, useRef } from 'react';
import { getCityCoordinates, getWeatherData, getAirQualityData } from '../../../services/weather';
import api from '../../../services/api';

export default function useMapData(city, country, user) {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [markers, setMarkers] = useState([]);
  const prevSearchRef = useRef('');

  const updateMarkers = useCallback(data => {
    const newMarkers = data.map(f => ({
      id: f.id,
      position: {
        lat: typeof f.latitude === 'number' ? f.latitude : parseFloat(f.latitude),
        lng: typeof f.longitude === 'number' ? f.longitude : parseFloat(f.longitude)
      },
      type: f.issue_type || f.issueType,
      severity: f.severity
    }));
    setMarkers(newMarkers);
  }, []);

  const fetchData = useCallback(async () => {
    if (!city && !country) return { center: null, zoom: null };

    const key = `${city?.trim().toLowerCase()}|${country?.trim().toLowerCase()}`;
    prevSearchRef.current = key;

    try {
      const { lat, lon } = await getCityCoordinates(city, country);
      const weatherData = await getWeatherData(lat, lon);
      const airQualityData = await getAirQualityData(lat, lon).catch(() => null);

      setWeather(weatherData);
      setAirQuality(airQualityData);

      // Fetch feedbacks just to update markers (not sidebar list)
      try {
        const resp = await api.get(`/api/feedback/?city=${encodeURIComponent(city)}`, {
          headers: user ? { Authorization: `Token ${localStorage.getItem('token')}` } : {}
        });
        updateMarkers(resp.data);
      } catch (err) {
        console.error('Marker update feedback fetch failed:', err);
        setMarkers([]);
      }

      return { center: { lat, lng: lon }, zoom: city ? 13 : 6 };
    } catch (error) {
      console.error('Error:', error);
      let message;
      switch (error.message) {
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
      return { error: true, message };
    }
  }, [city, country, updateMarkers, user]);

  const addFeedback = async (newFeedback) => {
    try {
      const response = await api.post('/api/feedback/', newFeedback, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });

      // Add new marker only for display
      const newMarker = {
        id: response.data.id,
        position: {
          lat: parseFloat(response.data.latitude),
          lng: parseFloat(response.data.longitude)
        },
        type: response.data.issue_type,
        severity: response.data.severity
      };
      setMarkers(prev => [newMarker, ...prev]);
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  return { weather, airQuality, markers, fetchData, addFeedback };
}
