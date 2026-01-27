'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface GpsPickerProps {
  lat: number | null
  lng: number | null
  radius?: number
  onChange: (lat: number, lng: number) => void
}

function LocationMarker({ position, onChange }: { position: [number, number], onChange: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  // If we have a position, update map view to it on load (or change)
  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      // map.flyTo(position, map.getZoom())
    }
  }, [position, map])

  return position[0] === 0 ? null : (
    <Marker position={position}></Marker>
  )
}

export default function GpsPicker({ lat, lng, radius, onChange }: GpsPickerProps) {
  // Default to St. Petersburg, FL if null
  const defaultCenter: [number, number] = [27.7676, -82.6403]
  const position: [number, number] = lat && lng ? [lat, lng] : defaultCenter

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-white/10 z-0 relative">
      <MapContainer 
        center={position} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onChange={onChange} />
        {radius && lat && lng && (
           <Circle center={[lat, lng]} radius={radius} pathOptions={{ color: 'purple', fillColor: 'purple', fillOpacity: 0.2 }} />
        )}
      </MapContainer>
    </div>
  )
}
