"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import MapPlaceCard from '../../components/MapPlaceCard';
import { MapPin, Loader2 } from 'lucide-react';

// Dynamically import Leaflet Map Component with SSR disabled to prevent "window is not defined" error
const MapComponent = dynamic(
  () => import('../../components/MapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low/40 gap-3 min-h-[450px]">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs font-bold text-muted-text">Drawing map canvas...</span>
      </div>

    )
  }
);

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

export default function MapScreen() {
  const { user, setLoginSheetOpen } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtering & Selection state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());

  // Fetch places on mount
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await api.getMapPlaces();
        setPlaces(data);
      } catch (error) {
        console.error("Error fetching map places:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, []);

  // Fetch user's saved place IDs to show correct heart icon states
  useEffect(() => {
    if (user) {
      api.getUserSavedPlaces()
        .then((data: any[]) => {
          setSavedPlaces(new Set(data.map(p => p.id)));
        })
        .catch(err => console.error("Error fetching saved places:", err));
    } else {
      setSavedPlaces(new Set());
    }
  }, [user]);

  // Handle bookmark toggle
  const handleToggleSave = async (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }
    const isCurrentlySaved = savedPlaces.has(placeId);
    try {
      if (isCurrentlySaved) {
        await api.unsavePlace(placeId);
        setSavedPlaces(prev => {
          const next = new Set(prev);
          next.delete(placeId);
          return next;
        });
      } else {
        await api.savePlace(placeId);
        setSavedPlaces(prev => {
          const next = new Set(prev);
          next.add(placeId);
          return next;
        });
      }
    } catch (err) {
      console.error("Error toggling saved place from map drawer:", err);
    }
  };

  // Filter list of places based on active category
  const filteredPlaces = places.filter(place => {
    if (activeCategory === 'all') return true;
    return place.category === activeCategory;
  });

  const categoryFilters = [
    { id: 'all', label: 'All' },
    { id: 'chai', label: 'Chai' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'cafe', label: 'Café' },
    { id: 'smoking_allowed', label: 'Smoking Allowed' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-background">

      {/* 1. Header component (matching standard look) */}
      <header className="z-30 bg-background/95 border-b border-border/30 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-1.5 text-primary">
          <span className="font-heading text-xl font-extrabold tracking-wide text-primary">Chaska</span>
        </Link>

        <div className="flex items-center gap-1 bg-surface-container-low border border-border/30 px-3.5 py-1.5 rounded-full text-xs font-bold select-none shadow-sm">
          <MapPin size={12} className="text-primary" />
          <span className="text-black">Rajnandgaon</span>
        </div>

        {user ? (
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full overflow-hidden border border-border shadow-sm hover:scale-105 transition-transform"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={user.name || 'User'}
              className="w-full h-full object-cover"
            />
          </Link>
        ) : (
          <button
            onClick={() => setLoginSheetOpen(true)}
            className="text-xs font-bold bg-primary text-white px-3.5 py-1.5 rounded-btn shadow-sm hover:bg-orange-600 transition-colors"
          >
            Log In
          </button>
        )}
      </header>

      {/* 2. Map Container & Overlay Area */}
      <div className="flex-1 relative w-full h-full">

        {/* Floating Categories Bar overlayed on top of map */}
        <div className="absolute top-4 inset-x-0 z-20 px-4 pointer-events-none">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto bg-background/85 backdrop-blur-md p-2 rounded-2xl border border-border/40 shadow-warm">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  // Dismiss drawer if category changes and the selected place is filtered out
                  if (selectedPlace && cat.id !== 'all' && selectedPlace.category !== cat.id) {
                    setSelectedPlace(null);
                  }
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${activeCategory === cat.id
                    ? 'bg-primary-container text-white border-primary-container shadow-sm scale-102'
                    : 'bg-white text-muted-text border-border hover:bg-surface-container-low/50'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Small location label overlay */}
        <div className="absolute top-[80px] left-4 z-20 bg-black/60 backdrop-blur-[2px] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm pointer-events-none">
          Rajnandgaon City Center
        </div>

        {/* Interactive Leaflet Map */}
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low/40 gap-3 min-h-[450px]">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-xs font-bold text-muted-text">Fetching food joint coordinates...</span>
          </div>
        ) : (
          <MapComponent
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => setSelectedPlace(place)}
          />
        )}

        {/* Sliding Bottom Drawer details card */}
        {selectedPlace && (
          <div className="absolute bottom-4 inset-x-4 z-20 transition-all duration-300">
            <MapPlaceCard
              place={selectedPlace}
              isSaved={savedPlaces.has(selectedPlace.id)}
              onToggleSave={handleToggleSave}
              onClose={() => setSelectedPlace(null)}
            />
          </div>
        )}

      </div>

    </div>
  );
}
