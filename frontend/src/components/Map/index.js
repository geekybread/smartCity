import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import MapLoader from './MapLoader';
import ControlPanel from './ControlPanel';
import Sidebar from './Sidebar';
import useMapData from './hooks/useMapData';
import useAccidentZones from './hooks/useAccidentZones';
import useAlerts from './hooks/useAlerts';
import './Map.css';

export default React.forwardRef(function Map({ city, country, coordinates, isUserLocation, onResult }, ref) {
  const { user } = useAuth();
  const { weather, airQuality, feedbacks, markers, fetchData, addFeedback } = useMapData(city, country, user);
  const { zones: accidentZones } = useAccidentZones(city);
  const { alerts } = useAlerts(city);

  const [center, setCenter] = useState(coordinates || null);
  const [zoom, setZoom] = useState(city ? 14 : 6);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showZones, setShowZones] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  const mapRef = useRef();
  const currentLocationRef = useRef({ city, country });

  useEffect(() => {
    currentLocationRef.current = { city, country };
    setActiveSidebar(null);
    setShowZones(false);
    setShowAlerts(false);
    setShowTraffic(false);
    setShowFeedbackForm(false);
    if (coordinates) {
      setCenter(coordinates);
      setZoom(14);
    }
  }, [city, country, coordinates]);

  const onToggle = name => {
    const next = activeSidebar === name ? null : name;
    setActiveSidebar(next);
    setShowTraffic(next === 'traffic');
    setShowZones(next === 'zones');
    setShowAlerts(next === 'alerts');
    setShowFeedbackForm(false);
  };

  const handleReportClick = () => {
    if (!user) return alert('Please login to submit feedback');
    const c = mapRef.current.getCenter();
    setSelectedLocation({
      name: `${currentLocationRef.current.city} (${c.lat().toFixed(4)}, ${c.lng().toFixed(4)})`,
      lat: c.lat(),
      lng: c.lng(),
      city: currentLocationRef.current.city
    });
    setShowFeedbackForm(true);
    setActiveSidebar('feedback');
  };

  const handleFeedbackSubmit = async feedback => {
    if (!user) return alert('Please login to submit feedback');
    try {
      await addFeedback({
        ...feedback,
        id: `feedback-${Date.now()}`,
        location_name: selectedLocation.name,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        city: selectedLocation.city
      });
      setShowFeedbackForm(false);
      alert('Thank you for your report!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback');
    }
  };

  const onMarkerClick = id => {
    const fb = feedbacks.find(f => f.id === id);
    if (!fb) return;
    setSelectedLocation({
      name: fb.location || fb.location_name,
      lat: fb.latitude,
      lng: fb.longitude,
      city: fb.city || currentLocationRef.current.city
    });
    setShowFeedbackForm(true);
    setActiveSidebar('feedback');
  };

  const onLoad = map => {
    mapRef.current = map;
    map.addListener('click', e => {
      if (!showFeedbackForm) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const label = currentLocationRef.current.city
        ? `${currentLocationRef.current.city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`
        : `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setSelectedLocation({
        name: label,
        lat,
        lng,
        city: currentLocationRef.current.city
      });
    });
  };

  const onUnmount = () => {
    mapRef.current = null;
  };

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
          setZoom(14);
          mapRef.current?.panTo(result.center);
          mapRef.current?.setZoom(14);
        }
        onResult?.({
          success: true,
          message: city,
          mapRef: {
            refocus: () => {
              if (result.center) {
                setCenter(result.center);
                setZoom(14);
                mapRef.current?.panTo(result.center);
                mapRef.current?.setZoom(14);
              }
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
      <ControlPanel active={activeSidebar} onToggle={onToggle} />
      <div className={`map-container ${activeSidebar ? 'sidebar-open' : ''}`}>
        {isLoading && <div className="map-loading-overlay"><div className="spinner" /></div>}
        {center && (
          <MapLoader
            center={center}
            zoom={zoom || 14}
            showTraffic={showTraffic}
            showZones={showZones}
            showAlerts={showAlerts}
            setSelectedZoneId={setSelectedZoneId}
            accidentZones={accidentZones}
            selectedZoneId={selectedZoneId}
            alerts={alerts}
            markers={markers}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onMarkerClick={onMarkerClick}
          />
        )}
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
        setSelectedZoneId={setSelectedZoneId}
        alerts={alerts}
      />
    </div>
  );
});