import React, { useState } from 'react';
import Map from './components/Map';
import './App.css';

function App() {
  const [city, setCity] = useState('Delhi');  // Default city
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setCity(searchQuery);  // Update the city state
  };

  return (
    <div className="App">
      <h1>Smart City Dashboard</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Enter city name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {/* Map Component */}
      <Map city={city} />
    </div>
  );
}

export default App;