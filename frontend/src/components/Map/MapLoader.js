import React from 'react';
import { GoogleMap, useLoadScript, TrafficLayer, Marker } from '@react-google-maps/api';
import { GOOGLE_MAPS_CONFIG } from './configs/maps';

export default function MapLoader({
  center,
  zoom,
  markers,
  showTraffic,
  getMarkerIcon,
  onLoad,
  onUnmount,
  onMapClick,
  onMarkerClick
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: GOOGLE_MAPS_CONFIG.libraries
  });

  if (loadError) return <div className="map-error">Error loading map</div>;
  if (!isLoaded) return <div className="map-loading">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}           // ✅ sets mapRef.current
      onUnmount={onUnmount}
      onClick={onMapClick}
      options={{
        disableDefaultUI: false,
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
      }}
    >
      {showTraffic && <TrafficLayer />}
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={marker.position}
          icon={{
            url: getMarkerIcon(marker.type, marker.severity),
            scaledSize: new window.google.maps.Size(32, 32)
          }}
          onClick={() => onMarkerClick(marker.id)}
        />
      ))}
    </GoogleMap>
  );
}
