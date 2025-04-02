import axios from 'axios';
import { getCountryCode } from '../utils/countryCodes';

const apiKey = process.env.REACT_APP_OPENWEATHERMAP_API_KEY || '';
if (!apiKey) throw new Error('Missing API key configuration');

const weatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org',
  params: {
    appid: apiKey
  },
  timeout: 10000
});

const countriesApi = axios.create({
  baseURL: 'https://restcountries.com/v3.1',
  timeout: 10000
});

const requestCache = new Map();

export const getCityCoordinates = async (city, country = '') => {
  const cacheKey = `coords_${city}_${country}`;
  
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey);
  }

  try {
    const countryCode = country ? getCountryCode(country) : '';
    
    if (country && !countryCode) {
      throw new Error('INVALID_COUNTRY');
    }

    let result;
    
    if (!city && countryCode) {
      const capital = await getCountryCapital(countryCode);
      result = await searchCityInCountry(capital, countryCode);
    } else if (city && countryCode) {
      result = await searchCityInCountry(city, countryCode);
    } else if (city) {
      const { data } = await weatherApi.get('/geo/1.0/direct', {
        params: { q: city, limit: 1 }
      });
      if (!data.length) throw new Error('CITY_NOT_FOUND');
      result = { lat: data[0].lat, lon: data[0].lon };
    } else {
      throw new Error('INVALID_INPUT');
    }

    requestCache.set(cacheKey, result);
    return result;

  } catch (error) {
    requestCache.set(cacheKey, { error: error.message });
    throw error;
  }
};

const searchCityInCountry = async (city, countryCode) => {
  const { data } = await weatherApi.get('/geo/1.0/direct', {
    params: { q: `${city},${countryCode}`, limit: 1 }
  });
  
  if (!data.length) throw new Error('CITY_NOT_IN_COUNTRY');
  return { lat: data[0].lat, lon: data[0].lon };
};

export const getCountryCapital = async (countryCode) => {
  const { data } = await countriesApi.get(`/alpha/${countryCode.toLowerCase()}`);
  
  if (!data.length || !data[0].capital) {
    throw new Error('COUNTRY_NOT_FOUND');
  }
  
  return data[0].capital[0];
};

export const getWeatherData = async (lat, lon) => {
  const { data } = await weatherApi.get('/data/2.5/weather', {
    params: { lat, lon, units: 'metric' }
  });
  return data;
};