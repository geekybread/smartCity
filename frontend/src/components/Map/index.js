import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MapLoader from './MapLoader';
import ControlPanel from './ControlPanel';
import Sidebar from './Sidebar';
import useMapData from './hooks/useMapData';
import './Map.css';

export default React.forwardRef(function Map({ city, country, onResult }, ref) {
  const { user } = useAuth();
  const { weather, airQuality, feedbacks, fetchData, addFeedback } = useMapData(city, country, user);
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.209 });
  const [zoom, setZoom] = useState(city ? 13 : 6);
  const [showTraffic, setShowTraffic] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const currentLocationRef = useRef({ city: 'New Delhi', country: 'India' });

  const mapRef = useRef();

  // Sync searched location with internal state
  useEffect(() => {
    console.log("📍 Updating currentLocation to:", city);
    currentLocationRef.current = { city, country };
  }, [city, country]);
  

  // Show feedback form on map click
  const handleReportClick = () => {
    if (!user) return alert('Please login to submit feedback');
    const c = mapRef.current.getCenter();
    setSelectedLocation(`${currentLocationRef.current.city} (${c.lat().toFixed(4)}, ${c.lng().toFixed(4)})`);
    setShowFeedbackForm(true);
  };

  // Submit feedback to backend
  const handleFeedbackSubmit = async feedback => {
    try {
      if (!user) {
        alert('Please login to submit feedback');
        return;
      }
      const c = mapRef.current.getCenter();
      await addFeedback({
        ...feedback,
        id: `feedback-${Date.now()}`,
        location_name: selectedLocation || `${city} (${c.lat().toFixed(4)}, ${c.lng().toFixed(4)})`,
        latitude: c.lat(),
        longitude: c.lng()
      });
      setShowFeedbackForm(false);
      alert('Thank you for your report!');
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback');
    }
  };

  // Marker icon logic
  const getMarkerIcon = (type, severity) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    const colors = { low: 'green', medium: 'orange', high: 'red' };
    const icons = {
      pothole: `${baseUrl}construction.png`,
      streetlight: `${baseUrl}streetlight.png`,
      intersection: `${baseUrl}traffic.png`,
      garbage: `${baseUrl}trash.png`,
      other: `${baseUrl}info.png`
    };
    return icons[type] || `${baseUrl}${colors[severity]}-dot.png`;
  };

  // Sidebar toggler
  const onToggle = name => {
    const next = activeSidebar === name ? null : name;
    setActiveSidebar(next);
    setShowTraffic(next === 'traffic');
    setShowFeedbackForm(false);
  };

  // Marker click handler
  const onMarkerClick = id => {
    if (!Array.isArray(feedbacks)) {
      console.warn("⚠️ Feedbacks not loaded yet");
      return;
    }
  
    const fb = feedbacks.find(f => f.id === id);
    if (fb) {
    setSelectedLocation(fb.location || fb.location_name);
    setShowFeedbackForm(true);
    setActiveSidebar('feedback');

    setTimeout(() => {
        const el = document.getElementById(`feedback-${fb.id}`);
        if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight');
        setTimeout(() => el.classList.remove('highlight'), 2000);  // remove after 2s
        }
    }, 0);
    }
  };
  
  

  // Map load and click handling
  const onLoad = map => {
    mapRef.current = map;
    map.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const formatted = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
        const label = currentLocationRef.current.city
          ? `${currentLocationRef.current.city} (${formatted})`
          : `(${formatted})`;
      
        console.log("🖱️ Map click — using city:", currentLocationRef.current.city);
      
        setSelectedLocation(label);
      });
      
      
      
      
  };
  const onUnmount = () => { mapRef.current = null; };

  // Fetch data when city/country changes
  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then((result) => {
        if (result?.error) {
          onResult?.({ success: false, message: result.message });
          return;
        }
        if (!result?.center || !result?.zoom) return;

        const { center: ctr, zoom: zm } = result;
        setCenter(ctr);
        setZoom(zm);
        mapRef.current?.panTo(ctr);
        mapRef.current?.setZoom(zm);

        onResult?.({
          success: true,
          message: city,
          mapRef: {
            refocus: () => {
              setCenter(ctr);
              setZoom(zm);
              mapRef.current?.panTo(ctr);
              mapRef.current?.setZoom(zm);
            }
          }
        });
      })
      .catch(err => {
        onResult?.({ success: false, message: 'Unexpected error: ' + err.message });
      })
      .finally(() => setIsLoading(false));
  }, [city, country, fetchData, onResult]);


  return (
    <div className="map-page-container">
      <ControlPanel active={activeSidebar} onToggle={onToggle}/>
      
      <div className={`map-container ${activeSidebar ? 'sidebar-open' : ''}`}>
        {isLoading && (
          <div className="map-loading-overlay">
            <div className="spinner" />
          </div>
        )}
        <MapLoader
          center={center}
          zoom={zoom}
          showTraffic={showTraffic}
          markers={[]}
          getMarkerIcon={getMarkerIcon}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onMapClick={() => {}}
          onMarkerClick={onMarkerClick}
        />
      </div>

      <Sidebar
        active={activeSidebar}
        onToggle={onToggle}
        weather={weather}
        airQuality={airQuality}
        city={currentLocationRef.current.city}
        currentLocation={currentLocationRef.current}
        showFeedbackForm={showFeedbackForm}
        selectedLocation={selectedLocation}
        onReportClick={handleReportClick}
        onFeedbackSubmit={handleFeedbackSubmit}
      />
    </div>
  );
});
