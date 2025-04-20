// src/components/Map/hooks/useAlerts.js

import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { useAuth } from '../../../context/AuthContext'

export default function useAlerts(city) {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    if (!city) {
      setAlerts([])
      return
    }

    const fetchAlerts = async () => {
      const { data } = await api.get(`/api/emergency-alerts/?city=${encodeURIComponent(city)}`)
      const now = new Date()
      let list = data.filter(a => new Date(a.expiry_time) > now)

      if (user) {
        list = list.filter(a => !a.is_seen)
        for (const a of list) {
          try {
            await api.post(`/emergency-alerts/${a.id}/mark_seen/`)
          } catch {}
        }
      }

      setAlerts(list)
    }

    fetchAlerts()
  }, [city, user])

  return { alerts }
}
