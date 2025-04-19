import React, { useState, useEffect, useRef, useCallback} from 'react';
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
  const [location, setLocation] = useState({ city: 'New Delhi', country: 'India' });
  const [searchQuery, setSearchQuery] = useState({ city: '', country: '' });
  const [notification, setNotification] = useState(null);
  const [lastValidSearch, setLastValidSearch] = useState({ city: 'New Delhi', country: 'India' });
  //const prevSearchRef = useRef('');
  const mapRef = useRef();
  


  const handleMapResult = useCallback((result) => {
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  
    if (result.mapRef) {
      mapRef.current = result.mapRef;
    }
  }, []);



  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [notification]);


  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }


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
  
      // 🔁 Check if same as current location
      if (
        newLocation.city.toLowerCase() === location.city.toLowerCase() &&
        newLocation.country.toLowerCase() === location.country.toLowerCase()
      ) {
        // ✅ Same location → refocus map
        if (mapRef.current?.refocus) {
          mapRef.current.refocus();
          toast.info(`Refocusing on ${newLocation.city || newLocation.country}`);
        } else {
          toast.info('Already showing this location');
        }
        return;
      }
  
      // New location → set and trigger fetch
      setLocation(newLocation);
      setLastValidSearch(newLocation);
      toast.info('Searching for location...');
    } catch (error) {
      toast.error(error.message);
    }
  };
  

  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery(prev => ({ ...prev, [name]: value }));
  };

  const refocusOnLastSearch = () => {
    if (mapRef.current && lastValidSearch) {
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

        {/* {notification && (
          <div className={`notification-banner ${notification.type}`}>
            <span>{notification.message}</span>
          </div>
        )} */}
        <ToastContainer position="top-center" autoClose={2000} hideProgressBar />


        <div className="auth-controls">
          <GoogleAuth />
        </div>

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
