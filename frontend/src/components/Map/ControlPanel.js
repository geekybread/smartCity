// src/components/Map/ControlPanel.js

import React from 'react'

const controls = [
  { name: 'weather',   icon: '☀️', label: 'Weather' },
  { name: 'airQuality',icon: '🌫️', label: 'Air Quality' },
  { name: 'traffic',   icon: '🚦', label: 'Traffic' },
  { name: 'feedback',  icon: '📝', label: 'Reports' },
  { name: 'alerts',    icon: '🚨', label: 'Alerts' },
  { name: 'zones',     icon: '🚧', label: 'Accident Zones' },
]

export default function ControlPanel({ active, onToggle }) {
  return (
    <div className="left-panel">
      <div className="panel-title">Menu</div>
      {controls.map(c => (
        <div
          key={c.name}
          className={`control-card ${active === c.name ? 'active' : ''}`}
          onClick={() => onToggle(c.name)}
        >
          <div className="control-icon">{c.icon}</div>
          <div className="control-label">{c.label}</div>
        </div>
      ))}
    </div>
  )
}
