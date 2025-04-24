import { useState, useCallback, useRef } from 'react';
import { getCityCoordinates, getWeatherData, getAirQualityData } from '../../../services/weather';
import api from '../../../services/api';

export default function useMapData(city, country, user) {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);  // All feedback reports
  const prevSearchRef = useRef('');


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

      try {
        const resp = await api.get(`/api/feedback/?city=${encodeURIComponent(city)}`, {
          headers: user ? { Authorization: `Token ${localStorage.getItem('token')}` } : {}
        });

        setFeedbacks(resp.data);        // Store all feedbacks

      } catch (err) {
        console.error('Feedback fetch failed:', err);
        setFeedbacks([]);
      }

      return { center: { lat, lng: lon }, zoom: city ? 13 : 6 };

    } catch (error) {
      console.error('Map data error:', error);
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
  }, [city, country, user]);

  const addFeedback = async (newFeedback) => {
    try {
      const response = await api.post('/api/feedback/', newFeedback, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });

      const newFb = response.data;

      setFeedbacks(prev => [newFb, ...prev]);  // Add to full list

    } catch (error) {
      console.error("Error submitting feedback:", error);
      if (error.response) {
        console.error("❌ Backend error message:", error.response.data);  // 👈 THIS is what we need
      }
    }
    
  };

  return { weather, airQuality, feedbacks, fetchData, addFeedback };
}
