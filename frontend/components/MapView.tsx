"use client";

import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap } from '@vis.gl/react-google-maps';

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

const RAJNANDGAON_CENTER = { lat: 21.0972, lng: 81.0354 };
const DEFAULT_ZOOM = 14;

// Vintage warm sepia theme style JSON for Google Maps
const VINTAGE_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fbf7f0"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#7e695d"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#fbf7f0"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#e5d9c7"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#ae9e90"
      }
    ]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5edd8"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f3e7cf"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8b766a"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#ebd8be"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#847063"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#fdfbfa"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f8ebd5"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#eacda3"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#948375"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ebd8be"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f3e7cf"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#d6c0ab"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8b7461"
      }
    ]
  }
];

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      if (map.getZoom() !== 15) {
        map.setZoom(15);
      }
    }
  }, [center, map]);
  return null;
}

export default function MapView({ places, selectedPlace, onSelectPlace }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFFBF5] border-2 border-dashed border-[#E8E0D5]/50 p-6 text-center gap-3 min-h-[450px]">
        <div className="text-4xl">📍</div>
        <h3 className="font-heading text-lg font-bold text-[#2C1810]" style={{ fontFamily: 'Baloo 2, sans-serif' }}>
          Google Maps Key Required
        </h3>
        <p className="text-xs text-[#6B6B6B] max-w-xs">
          Please set the <code className="bg-[#E8E0D5]/50 px-1.5 py-0.5 rounded font-mono text-[#F47C2B]">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> environment variable in your <code className="bg-[#E8E0D5]/50 px-1.5 py-0.5 rounded font-mono">.env.local</code> file to run the map interface.
        </p>
      </div>
    );
  }

  const mapCenter = selectedPlace
    ? { lat: selectedPlace.lat, lng: selectedPlace.lng }
    : RAJNANDGAON_CENTER;

  // Custom Pin Element Builder
  const renderPin = (category: string) => {
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

    return (
      <div 
        className="map-marker transition-all duration-200 hover:scale-110 hover:-translate-y-1 cursor-pointer"
        style={{
          background: pinColor,
          width: '36px',
          height: '36px',
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ transform: 'rotate(45deg)', fontSize: '16px' }}>
          {pinIcon}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#FFFBF5]">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={RAJNANDGAON_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId="DEMO_MAP_ID"
          styles={VINTAGE_MAP_STYLE}
          disableDefaultUI={true}
          zoomControl={true}
          gestureHandling="greedy"
          className="w-full h-full"
        >
          {selectedPlace && (
            <RecenterMap center={mapCenter} />
          )}

          {places.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => onSelectPlace(place)}
            >
              {renderPin(place.category)}
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
