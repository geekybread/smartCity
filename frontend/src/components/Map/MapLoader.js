// src/components/Map/MapLoader.js
import React from 'react'
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
  alerts,
  onLoad,
  onUnmount
}) {
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
        accidentZones.map(z => {
          const path = (z.polygon || [])
            .map(p => ({
              lat: Number(p[0]),
              lng: Number(p[1])
            }))
            .filter(pt => !isNaN(pt.lat) && !isNaN(pt.lng))
          return path.length ? (
            <Polygon
              key={z.id}
              paths={path}
              options={{
                fillColor: 'red',
                fillOpacity: 0.3,
                strokeColor: 'red',
                strokeOpacity: 0.8
              }}
            />
          ) : null
        })}

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
