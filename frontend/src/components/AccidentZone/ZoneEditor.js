import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  useLoadScript,
  DrawingManager,
  Polygon
} from '@react-google-maps/api';
import api from '../../services/api'; // your axios/fetch wrapper

export default function ZoneEditor({ city }) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['drawing']
  });
  const mapRef = useRef();
  const [zones, setZones] = useState([]);

  // 5.1 Load existing zones
  useEffect(() => {
    api.get(`/api/accident-zones/?city=${city}`)
       .then(res => setZones(res.data));
  }, [city]);

  // 5.2 Save handler (create or update)
  const saveZone = (zoneId, path) => {
    const payload = {
      city,
      name: prompt('Zone name:') || 'Unnamed zone',
      polygon: path.map(pt => [pt.lat(), pt.lng()])
    };
    if (zoneId) {
      return api.put(`/api/accident-zones/${zoneId}/`, payload);
    } else {
      return api.post(`/api/accident-zones/`, payload);
    }
  };

  if (!isLoaded) return <p>Loading map…</p>;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '80vh' }}
      center={{ lat: 28.6139, lng: 77.2090 }}
      zoom={12}
      onLoad={map => (mapRef.current = map)}
    >
      {/* 5.3 Existing polygons (editable) */}
      {zones.map(z => (
        <Polygon
          key={z.id}
          paths={z.polygon}
          editable
          onMouseUp={e => {
            // grab updated coords
            const poly = e.domEvent.srcElement;
            const path = poly.getPath();
            saveZone(z.id, path);
          }}
        />
      ))}

      {/* 5.4 DrawingManager for new zones */}
      <DrawingManager
        drawingMode={null}
        onPolygonComplete={poly => {
          saveZone(null, poly.getPath())
            .then(() => {
              // reload after create
              return api.get(`/api/accident-zones/?city=${city}`);
            })
            .then(res => setZones(res.data));
          poly.setMap(null); // clean up temp
        }}
        options={{
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
          },
          polygonOptions: { editable: true }
        }}
      />
    </GoogleMap>
  );
}
