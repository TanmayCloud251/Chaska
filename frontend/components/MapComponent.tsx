"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for leaflet default marker icons in Next.js bundle compilation
// Although we use custom markers, we delete the default icon config to avoid network warnings
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Place {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  is_verified: boolean;
  is_open: boolean;
  cover_photo: string | null;
  avg_rating: string | number;
  review_count: number;
  area: string;
}

interface MapComponentProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
}

// Map Recenter Helper Component
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Pan smoothly to the target position
      map.setView(center, 15, {
        animate: true,
        duration: 0.6
      });
    }
  }, [center, map]);
  return null;
}

// Generate the HTML pin layout matching the teardrop icon with category icons
const createCustomPinHTML = (category: string, isSelected: boolean) => {
  // Selected pins are larger and saffron-colored; unselected are terracotta (or red for smoking allowed)
  const pinBgColor = isSelected ? '#f47c2b' : (category === 'smoking_allowed' ? '#ef4444' : '#9b4500');
  
  // Icon choice based on categories
  let iconHtml = '';
  if (category === 'chai') {
    // Teacup/Coffee icon
    iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-coffee"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h13Z"/><path d="M6 2v2"/><path d="M17 12h2a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2"/></svg>`;
  } else if (category === 'snacks') {
    // Fork/spoon/food icon
    iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils-cross"><path d="M12 2v20"/><path d="M19 12V2h-3v10"/><path d="M16 6h3"/><path d="M12 2H9v10"/><path d="M9 6h3"/></svg>`;
  } else if (category === 'cafe') {
    // Utensils dining icon
    iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v4"/><path d="M5 2v4"/><path d="M12 18h9"/><path d="M12 14h9"/><path d="M12 22h9"/><path d="M18 2v8a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V2"/></svg>`;
  } else {
    // Custom balance scales icon (matches legal/moderation/smoking allowed indicator)
    iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-scale"><path d="m16 16 3-8 3 8c-.1.2-.3.3-.6.3h-4.8c-.3 0-.5-.1-.6-.3Z"/><path d="m2 16 3-8 3 8c-.1.2-.3.3-.6.3H2.6c-.3 0-.5-.1-.6-.3Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h18"/></svg>`;
  }

  const markerSizeClass = isSelected ? 'scale-120 drop-shadow-md' : 'hover:scale-105 active:scale-95';

  return `
    <div class="relative flex flex-col items-center origin-bottom transition-all duration-250 cursor-pointer ${markerSizeClass}" style="width: 32px; height: 42px;">
      <!-- Teardrop Path -->
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 27.2 14.28 40.56 15.34 41.54C15.72 41.89 16.28 41.89 16.66 41.54C17.72 40.56 32 27.2 32 16C32 7.16 24.84 0 16 0Z" fill="${pinBgColor}" stroke="#ffffff" stroke-width="2"/>
        <circle cx="16" cy="16" r="10" fill="#ffffff" opacity="0.15"/>
      </svg>
      <!-- Inside Icon -->
      <div class="absolute top-[8px] flex items-center justify-center text-white" style="width: 18px; height: 18px;">
        ${iconHtml}
      </div>
    </div>
  `;
};

export default function MapComponent({ places, selectedPlace, onSelectPlace }: MapComponentProps) {
  // Center of Rajnandgaon, Chhattisgarh
  const defaultCenter: [number, number] = [21.0975, 81.0350];
  const mapCenter: [number, number] = selectedPlace 
    ? [selectedPlace.lat, selectedPlace.lng] 
    : defaultCenter;

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Inline styles for custom map filters */}
      <style dangerouslySetInnerHTML={{__html: `
        .vintage-map .leaflet-tile-container {
          filter: sepia(0.85) contrast(1.1) brightness(1.02) saturate(0.85) hue-rotate(-8deg);
        }
        .vintage-map {
          background-color: #fff8f6 !important;
        }
        /* Custom styled Leaflet zoom controls in Terracotta theme */
        .vintage-map .leaflet-bar {
          border: 1px solid #dec1b2 !important;
          box-shadow: 0 2px 12px rgba(44, 24, 16, 0.08) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .vintage-map .leaflet-bar a {
          background-color: #ffffff !important;
          color: #9b4500 !important;
          border-bottom: 1px solid #dec1b2 !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-size: 16px !important;
          transition: background-color 0.2s;
        }
        .vintage-map .leaflet-bar a:hover {
          background-color: #fff1ec !important;
          color: #9b4500 !important;
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
        center={defaultCenter}
        zoom={14}
        className="w-full h-full vintage-map z-10"
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        
        {/* Recenter helper when selectedPlace shifts */}
        {selectedPlace && (
          <RecenterMap center={mapCenter} />
        )}

        {/* Place Markers */}
        {places.map((place) => {
          const isSelected = selectedPlace?.id === place.id;
          
          // Leaflet custom divIcon
          const customIcon = L.divIcon({
            html: createCustomPinHTML(place.category, isSelected),
            iconSize: [32, 42],
            iconAnchor: [16, 42], // anchor at the bottom tip of pin
          });

          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={customIcon}
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
