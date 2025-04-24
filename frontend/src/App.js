// src/App.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import GoogleAuth from './components/Auth/GoogleLogin';
import Map from './components/Map';
import './App.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EmergencyBanner from './components/Alerts/EmergencyBanner';

axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL;
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

function App() {
  const { loading } = useAuth();
  const [location, setLocation] = useState(null);
  const [pendingLocation, setPendingLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState({ city: '', country: '' });
  const mapRef = useRef();

  const fetchCityFromCoordinates = async (lat, lng) => {
    const apiKey = process.env.REACT_APP_GOOGLE_GEOCODE_API_KEY; // make sure it's set in .env
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.status === 'OK') {
        const result = data.results.find(r =>
          r.types.includes('locality') || r.types.includes('administrative_area_level_2')
        );
  
        if (result) {
          const cityComp = result.address_components.find(c =>
            c.types.includes('locality') || c.types.includes('administrative_area_level_2')
          );
          return cityComp?.long_name;
        }
      } else {
        console.warn('🧭 Geocode error:', data.status, data.error_message);
      }
    } catch (error) {
      console.error('❌ Failed to fetch city name:', error);
    }
  
    return null;
  };
  
  

  // 📍 Determine user's location only once
  useEffect(() => {
    if (location) return;
  
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = await fetchCityFromCoordinates(latitude, longitude);
  
        setLocation({
          city: city || 'Unknown',
          country: 'India',
          coordinates: { lat: latitude, lng: longitude },
          isUserLocation: true
        });
      },
      (err) => {
        console.warn("⚠️ Geolocation failed. Using fallback location:", err.message);
        setLocation({
          city: 'New Delhi',
          country: 'India',
          coordinates: { lat: 28.6139, lng: 77.209 },
          isUserLocation: false
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [location]);
  


  // Sync pending location from search
  useEffect(() => {
    if (pendingLocation) {
      setLocation(pendingLocation);
      setPendingLocation(null);
    }
  }, [pendingLocation]);

  const handleMapResult = useCallback(result => {
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
    if (result.mapRef) {
      mapRef.current = result.mapRef;
    }
  }, []);

  const handleSearch = e => {
    e.preventDefault();
    const city = searchQuery.city.trim();
    const country = searchQuery.country.trim();
    if (!city && !country) {
      toast.error('Please enter a city or country');
      return;
    }

    const newLoc = { city, country };

    if (
      newLoc.city.toLowerCase() === location?.city?.toLowerCase() &&
      newLoc.country.toLowerCase() === location?.country?.toLowerCase()
    ) {
      if (mapRef.current?.refocus) {
        mapRef.current.refocus();
        toast.info(`Refocusing on ${newLoc.city || newLoc.country}`);
      } else {
        toast.info('Already showing this location');
      }
    } else {
      setPendingLocation(newLoc);
      toast.info('Searching for location...');
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  if (loading || !location) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <h1>Smart City Dashboard</h1>
      </div>

      <ToastContainer position="top-center" autoClose={2000} hideProgressBar />

      <div className="auth-controls">
        <GoogleAuth />
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-container">
          <div className="search-controls">
            <input
              type="text"
              name="city"
              placeholder="City (e.g. Delhi)"
              value={searchQuery.city}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="country"
              placeholder="Country (e.g. India)"
              value={searchQuery.country}
              onChange={handleInputChange}
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </div>
      </form>

      <EmergencyBanner city={location.city} />

      <Map
        city={location.city}
        country={location.country}
        coordinates={location.coordinates}
        isUserLocation={location.isUserLocation}
        onResult={handleMapResult}
        ref={mapRef}
        mapRef={mapRef}
      />
    </div>
  );
}

export default App;
