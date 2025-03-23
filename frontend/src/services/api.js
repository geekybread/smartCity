import axios from 'axios';

const API_URL = 'http://localhost:8000/api';  // Backend URL

export const getTrafficData = async () => {
  const response = await axios.get(`${API_URL}/traffic/`);
  return response.data;
};

export const getWeatherData = async () => {
  const response = await axios.get(`${API_URL}/weather/`);
  return response.data;
};

export const getTrafficDirections = async (origin, destination) => {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&departure_time=now&traffic_model=best_guess&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    );
    return response.data;
  };