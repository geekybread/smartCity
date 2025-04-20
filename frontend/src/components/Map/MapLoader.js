// src/components/Map/MapLoader.js
import React, {useRef} from 'react'
import {
  GoogleMap,
  useLoadScript,
  TrafficLayer,
  Polygon,
  Marker
} from '@react-google-maps/api'
import { GOOGLE_MAPS_CONFIG } from './configs/maps'


export default function MapLoader({
  center,
  zoom,
  showTraffic,
  showZones,
  showAlerts,
  accidentZones,
  selectedZoneId,
  setSelectedZoneId,
  alerts,
  onLoad,
  onUnmount
}) {

  const mapRef = useRef();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: [
      // spread any existing libs from your config, then add drawing & places
      ...GOOGLE_MAPS_CONFIG.libraries,
      'drawing',
      'places'
    ]
  })

  if (loadError) return <div className="map-error">Error loading map</div>
  if (!isLoaded) return <div className="map-loading">Loading Map…</div>

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        gestureHandling: 'greedy',
        zoomControl: true,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      }}
    >
      {showTraffic && <TrafficLayer />}

      {showZones &&
        accidentZones.map(zone => (
          <Polygon
            key={zone.id}
            paths={zone.polygon.map(p => ({ lat: +p[0], lng: +p[1] }))}
            options={{
              fillColor: zone.id === selectedZoneId ? 'blue' : 'red',
              fillOpacity: 0.3,
              strokeColor: zone.id === selectedZoneId ? 'blue' : 'red',
              strokeOpacity: 0.8,
              strokeWeight: zone.id === selectedZoneId ? 3 : 1.5,
              zIndex: zone.id === selectedZoneId ? 999 : 1,
            }}
            onClick={() => {
              const bounds = new window.google.maps.LatLngBounds();
              zone.polygon.forEach(([lat, lng]) => bounds.extend({ lat: +lat, lng: +lng }));
              mapRef.current?.fitBounds(bounds);
              setSelectedZoneId(zone.id);
            }}
          />
        ))}


      {showAlerts &&
        alerts
          .map(a => {
            const lat = parseFloat(a.latitude)
            const lng = parseFloat(a.longitude)
            if (isNaN(lat) || isNaN(lng)) return null
            return { id: a.id, position: { lat, lng }, title: a.message }
          })
          .filter(m => m)
          .map(m => (
            <Marker
              key={m.id}
              position={m.position}
              title={m.title}
              icon="https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
            />
          ))}
    </GoogleMap>
  )
}
