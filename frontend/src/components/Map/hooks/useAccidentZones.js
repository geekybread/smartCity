// src/components/Map/hooks/useAccidentZones.js
import { useState, useEffect } from 'react';
import api from '../../../services/api';

export default function useAccidentZones(city) {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    if (!city) return setZones([]);
    api
      .get(`/api/accident-zones/?city=${encodeURIComponent(city)}`)
      .then(res => setZones(res.data))
      .catch(() => setZones([]));
  }, [city]);

  return { zones };
}
