import axios from 'axios';

const API_KEY = 'f9293dbeda02be4bda1ce865b2706cb4';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Fetch weather data
export const getWeatherData = async (lat, lon) => {
  const response = await axios.get(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
  return response.data;
};

// Fetch city coordinates
export const getCityCoordinates = async (city) => {
  const response = await axios.get(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}`);
  return {
    lat: response.data.coord.lat,
    lon: response.data.coord.lon,
  };
};