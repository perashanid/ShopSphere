'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export function StoreMap() {
  // Dhaka, Bangladesh coordinates (Gulshan area)
  const position: [number, number] = [23.7808, 90.4156];

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-center">
              <strong className="text-earth-dark">ShopSphere Flagship Store</strong>
              <p className="text-sm text-earth-olive mt-1">
                House 45, Road 11, Gulshan-1<br />
                Dhaka 1212, Bangladesh
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
