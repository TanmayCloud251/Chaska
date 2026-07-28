"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default icon assets issue in Next.js bundle compilation
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPlace {
  id: string;
  name: string;
  category: string;
  area: string;
  lat: number;
  lng: number;
  is_open: boolean;
  cover_photo: string | null;
  avg_rating: string | number;
  review_count: number;
  is_verified?: boolean;
}

interface MapViewProps {
  places: MapPlace[];
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
}

// Custom Pin Icon Builder matching the teardrop design specs
const createPin = (category: string) => {
  const colors: Record<string, string> = {
    chai:   '#E8862A',
    coffee: '#6B3F1A',
    snacks: '#F4A227',
    cafe:   '#2C1810',
  };
  
  const icons: Record<string, string> = {
    chai:   '🍵',
    coffee: '☕',
    snacks: '🍽️',
    cafe:   '🏠',
  };

  const pinColor = colors[category] || '#F47C2B';
  const pinIcon = icons[category] || '📍';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        background: ${pinColor};
        width: 36px; height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">
          ${pinIcon}
        </span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

// Map Recenter Component to pan smooth when a place details is opened
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15, {
        animate: true,
        duration: 0.5
      });
    }
  }, [center, map]);
  return null;
}

export default function MapView({ places, selectedPlace, onSelectPlace }: MapViewProps) {
  const RAJNANDGAON_CENTER: [number, number] = [21.0972, 81.0354];
  const DEFAULT_ZOOM = 14;

  const mapCenter: [number, number] = selectedPlace
    ? [selectedPlace.lat, selectedPlace.lng]
    : RAJNANDGAON_CENTER;

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#FFFBF5]">
      {/* Custom styled Leaflet zoom controls in Terracotta theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .vintage-map .leaflet-tile-container {
          filter: sepia(0.8) contrast(1.1) brightness(1.02) saturate(0.85);
        }
        .vintage-map {
          background-color: #FFFBF5 !important;
        }
        .vintage-map .leaflet-bar {
          border: 1px solid #E8E0D5 !important;
          box-shadow: 0 2px 12px rgba(44, 24, 16, 0.08) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .vintage-map .leaflet-bar a {
          background-color: #FFFFFF !important;
          color: #2C1810 !important;
          border-bottom: 1px solid #E8E0D5 !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 18px !important;
          transition: background-color 0.2s;
        }
        .vintage-map .leaflet-bar a:hover {
          background-color: #FFFBF5 !important;
          color: #F47C2B !important;
        }
        .vintage-map .leaflet-bar a:last-child {
          border-bottom: none !important;
        }
        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}} />

      <MapContainer
        center={RAJNANDGAON_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full vintage-map z-10"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        {/* Recenter helper when selectedPlace shifts */}
        {selectedPlace && (
          <RecenterMap center={mapCenter} />
        )}

        {/* Place Markers */}
        {places.map((place) => {
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPin(place.category)}
              eventHandlers={{
                click: () => {
                  onSelectPlace(place);
                },
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
