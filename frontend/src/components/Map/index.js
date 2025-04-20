// src/components/Map/index.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MapLoader from './MapLoader';
import ControlPanel from './ControlPanel';
import Sidebar from './Sidebar';
import useMapData from './hooks/useMapData';
import useAccidentZones from './hooks/useAccidentZones';
import useAlerts from './hooks/useAlerts';
import './Map.css';

export default React.forwardRef(function Map({ city, country, onResult }, ref) {
  const { user } = useAuth();
  const { weather, airQuality, feedbacks, markers, fetchData, addFeedback } =
    useMapData(city, country, user);
  const { zones: accidentZones } = useAccidentZones(city);
  const { alerts } = useAlerts(city);

  const [center, setCenter]             = useState({ lat: 28.6139, lng: 77.209 });
  const [zoom, setZoom]                 = useState(city ? 13 : 6);
  const [showTraffic, setShowTraffic]   = useState(false);
  const [showZones, setShowZones]       = useState(false);
  const [showAlerts, setShowAlerts]     = useState(false);
  const [activeSidebar, setActiveSidebar]       = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const currentLocationRef = useRef({ city: 'New Delhi', country: 'India' });
  const mapRef = useRef();

  // sync currentLocation and reset panels when city changes
  useEffect(() => {
    currentLocationRef.current = { city, country };
    setActiveSidebar(null);
    setShowZones(false);
    setShowAlerts(false);
    setShowTraffic(false);
    setShowFeedbackForm(false);
  }, [city, country]);

  // sidebar toggler
  const onToggle = name => {
    const next = activeSidebar === name ? null : name;
    setActiveSidebar(next);
    setShowTraffic(next === 'traffic');
    setShowZones(next === 'zones');
    setShowAlerts(next === 'alerts');
    setShowFeedbackForm(false);
  };

  // report feedback click
  const handleReportClick = () => {
    if (!user) return alert('Please login to submit feedback');
    const c = mapRef.current.getCenter();
    setSelectedLocation(
      `${currentLocationRef.current.city} (${c.lat().toFixed(4)}, ${c.lng().toFixed(4)})`
    );
    setShowFeedbackForm(true);
    setActiveSidebar('feedback');
  };

  // submit feedback
  const handleFeedbackSubmit = async feedback => {
    if (!user) return alert('Please login to submit feedback');
    try {
      const c = mapRef.current.getCenter();
      await addFeedback({
        ...feedback,
        id: `feedback-${Date.now()}`,
        location_name: selectedLocation,
        latitude: c.lat(),
        longitude: c.lng(),
      });
      setShowFeedbackForm(false);
      alert('Thank you for your report!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback');
    }
  };

  // marker click
  const onMarkerClick = id => {
    const fb = feedbacks.find(f => f.id === id);
    if (!fb) return;
    setSelectedLocation(fb.location || fb.location_name);
    setShowFeedbackForm(true);
    setActiveSidebar('feedback');
  };

  // map load & click
  const onLoad = map => {
    mapRef.current = map;
    map.addListener('click', e => {
      if (activeSidebar !== 'feedback') return;
      const lat = e.latLng.lat(), lng = e.latLng.lng();
      setSelectedLocation(
        `${currentLocationRef.current.city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
      );

      setActiveSidebar('feedback')

      if (activeSidebar === 'feedback') {
        setShowFeedbackForm(true); // ✅ only open if feedback sidebar is active
      }
      ;
    });
  };
  const onUnmount = () => { mapRef.current = null; };

  // fetch data when city/country changes
  useEffect(() => {
    setIsLoading(true);
    fetchData()
      .then(result => {
        if (result.error) {
          onResult?.({ success: false, message: result.message });
          return;
        }
        if (result.center && result.zoom != null) {
          setCenter(result.center);
          setZoom(result.zoom);
          mapRef.current?.panTo(result.center);
          mapRef.current?.setZoom(result.zoom);
          onResult?.({
            success: true,
            message: city,
            mapRef: {
              refocus: () => {
                setCenter(result.center);
                setZoom(result.zoom);
                mapRef.current?.panTo(result.center);
                mapRef.current?.setZoom(result.zoom);
              }
            }
          });
        }
      })
      .catch(err => {
        onResult?.({ success: false, message: 'Unexpected error: ' + err.message });
      })
      .finally(() => setIsLoading(false));
  }, [city, country, fetchData, onResult]);

  return (
    <div className="map-page-container">
      <ControlPanel active={activeSidebar} onToggle={onToggle} />

      <div className={`map-container ${activeSidebar ? 'sidebar-open' : ''}`}>
        {isLoading && (
          <div className="map-loading-overlay"><div className="spinner" /></div>
        )}
        <MapLoader
          center={center}
          zoom={zoom}
          showTraffic={showTraffic}
          showZones={showZones}
          showAlerts={showAlerts}
          accidentZones={accidentZones}
          alerts={alerts}
          markers={markers}
          onLoad={onLoad}
          onUnmount={onUnmount}
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
        accidentZones={accidentZones}
        alerts={alerts}
      />
    </div>
  );
});
