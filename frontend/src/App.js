import React, { useState, useEffect, useRef } from 'react';
import Map from './components/Map';
import './App.css';

function App() {
  const [location, setLocation] = useState({
    city: 'New Delhi',
    country: 'India'
  });
  const [searchQuery, setSearchQuery] = useState({
    city: '',
    country: ''
  });
  const [notification, setNotification] = useState(null);
  const [lastValidSearch, setLastValidSearch] = useState({
    city: 'New Delhi',
    country: 'India'
  }); // Initialize with default values
  const prevSearchRef = useRef('');
  const mapRef = useRef();
  // Auto-dismiss notification after 2 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      if (!searchQuery.city && !searchQuery.country) {
        throw new Error('Please enter a city or country');
      }

      const newLocation = {
        city: searchQuery.city.trim(),
        country: searchQuery.country.trim()
      };

      setLocation(newLocation);
      setLastValidSearch(newLocation); // Always update last valid search

      setNotification({
        type: 'info',
        message: 'Searching for location...'
      });

    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message
      });
    }
  };

  const handleMapResult = (result) => {
    setNotification({
      type: result.success ? 'success' : 'error',
      message: result.message
    });
    if (result.mapRef) {
      mapRef.current = result.mapRef;
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const refocusOnLastSearch = () => {
    if (mapRef.current && lastValidSearch) {
      // Trigger the map to refocus
      mapRef.current.refocus();
      setNotification({
        type: 'info',
        message: `Refocusing on ${lastValidSearch.city || lastValidSearch.country}`
      });
    }
  };

  return (
    <div className="App">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <h1>Smart City Dashboard</h1>
        </div>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-container">
          <div className="search-controls">
            <button 
              type="button"
              className="refocus-button"
              onClick={refocusOnLastSearch}
              title="Refocus on last searched location"
            >
              <span className="refocus-icon">📍</span>
            </button>
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
            <button type="submit" className="search-button">Search</button>
          </div>
        </div>
      </form>

      <Map 
        city={location.city} 
        country={location.country}
        onResult={handleMapResult}
      />
    </div>
  );
}

export default App;