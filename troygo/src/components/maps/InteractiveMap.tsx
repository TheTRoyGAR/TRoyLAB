'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface MapPin {
  lat: number;
  lon: number;
  label: string;
}

// Leaflet's default marker icon references image files by a relative path
// that bundlers like Next.js/webpack don't resolve — the standard fix is to
// point the icon at Leaflet's own CDN-hosted assets instead of trying to
// bundle the PNGs locally.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface InteractiveMapProps {
  pins: MapPin[];
  className?: string;
}

export default function InteractiveMap({ pins, className }: InteractiveMapProps) {
  if (pins.length === 0) return null;

  const center: [number, number] = [
    pins.reduce((sum, p) => sum + p.lat, 0) / pins.length,
    pins.reduce((sum, p) => sum + p.lon, 0) / pins.length,
  ];
  const zoom = pins.length === 1 ? 5 : 3;
  const routeLine: [number, number][] = pins.map((p) => [p.lat, p.lon]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className={className}
      style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pins.length > 1 && (
        <Polyline positions={routeLine} pathOptions={{ color: '#00B4D8', weight: 3, dashArray: '6 8' }} />
      )}
      {pins.map((pin, i) => (
        <Marker key={`${pin.label}-${i}`} position={[pin.lat, pin.lon]} icon={markerIcon}>
          <Popup>{pin.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
