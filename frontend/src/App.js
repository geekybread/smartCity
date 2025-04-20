// src/App.js

import React, { useState, useRef, useCallback } from 'react';
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
  const [location, setLocation] = useState({
    city: 'New Delhi',
    country: 'India'
  });
  const [searchQuery, setSearchQuery] = useState({
    city: '',
    country: ''
  });
  const mapRef = useRef();

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
      newLoc.city.toLowerCase() === location.city.toLowerCase() &&
      newLoc.country.toLowerCase() === location.country.toLowerCase()
    ) {
      if (mapRef.current?.refocus) {
        mapRef.current.refocus();
        toast.info(`Refocusing on ${newLoc.city || newLoc.country}`);
      } else {
        toast.info('Already showing this location');
      }
    } else {
      setLocation(newLoc);
      toast.info('Searching for location...');
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
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
        onResult={handleMapResult}
        ref={mapRef}
      />
    </div>
  );
}

export default App;
