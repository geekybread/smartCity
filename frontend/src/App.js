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
  const prevSearchRef = useRef('');

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

      const currentSearch = `${searchQuery.city}|${searchQuery.country}`;
      if (prevSearchRef.current === currentSearch) {
        return; // Skip if same search
      }
      prevSearchRef.current = currentSearch;

      setLocation({
        city: searchQuery.city.trim(),
        country: searchQuery.country.trim()
      });

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="App">
      <h1>Smart City Dashboard</h1>

      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-bar">
        <div className="search-fields">
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
          <button type="submit">Search</button>
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