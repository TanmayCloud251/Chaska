"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import MapFilterPills from '../../components/MapFilterPills';
import PlaceBottomSheet from '../../components/PlaceBottomSheet';
import { MapPin, Loader2 } from 'lucide-react';

// Dynamically import Leaflet Map Component with SSR disabled to prevent "window is not defined" error
const MapView = dynamic(
  () => import('../../components/MapView'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFFBF5] gap-3 min-h-[450px]">
        <Loader2 className="animate-spin text-[#F47C2B]" size={32} />
        <span className="text-xs font-bold text-[#6B6B6B]">Drawing map canvas...</span>
      </div>
    )
  }
);

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

export default function MapScreen() {
  const { user, setLoginSheetOpen } = useAuth();
  
  // Data State
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState<Set<string>>(new Set());

  // Filter & Bottom Sheet UI states
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Fetch user's saved places
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
      console.error("Error toggling saved place from map sheet:", err);
    }
  };

  // Filter change handler with toast display if result is empty
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    // Check if any places match
    const filtered = places.filter(place => {
      if (filter === 'All') return true;
      if (filter === 'Open Now') return place.is_open;
      // Map filter display tags to database categories
      const categoryMap: Record<string, string> = {
        'Chai': 'chai',
        'Snacks': 'snacks',
        'Café': 'cafe'
      };
      const targetCat = categoryMap[filter];
      return place.category === targetCat;
    });

    if (filtered.length === 0) {
      setToastMessage("No places found for this filter");
      setTimeout(() => setToastMessage(null), 3000);
    }

    // Dismiss drawer if category changes and the selected place is filtered out
    if (selectedPlace) {
      const match = filtered.some(p => p.id === selectedPlace.id);
      if (!match) {
        setSheetOpen(false);
        setSelectedPlace(null);
      }
    }
  };

  // Filter list of places based on activeFilter
  const filteredPlaces = places.filter(place => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Open Now') return place.is_open;
    const categoryMap: Record<string, string> = {
      'Chai': 'chai',
      'Snacks': 'snacks',
      'Café': 'cafe'
    };
    return place.category === categoryMap[activeFilter];
  });

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden bg-[#FFFBF5]">
      {/* 1. Header (📍 Chaska [avatar]) */}
      <header className="z-30 bg-[#FFFBF5] border-b border-[#E8E0D5]/50 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-1.5">
          <span 
            className="text-[#F47C2B] font-extrabold tracking-wide text-2xl"
            style={{ fontFamily: 'Baloo 2, sans-serif' }}
          >
            📍 Chaska
          </span>
        </Link>

        {user ? (
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full overflow-hidden border border-[#E8E0D5] shadow-sm hover:scale-105 transition-transform"
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
            className="text-xs font-bold bg-[#F47C2B] text-white px-4 py-2 rounded-[24px] shadow-sm hover:bg-orange-600 transition-colors"
          >
            Log In
          </button>
        )}
      </header>

      {/* 2. Map Container & Overlay Area */}
      <div className="flex-1 relative w-full h-full">
        {/* Floating Categories Bar overlayed on top of map */}
        <MapFilterPills 
          activeFilter={activeFilter} 
          onFilterChange={handleFilterChange} 
        />

        {/* Small location label overlay */}
        <div className="absolute top-[65px] left-4 z-20 bg-black/60 backdrop-blur-[2px] text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm pointer-events-none">
          Rajnandgaon City Center
        </div>

        {/* Interactive Leaflet Map */}
        {loading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFFBF5]/40 gap-3 min-h-[450px]">
            <Loader2 className="animate-spin text-[#F47C2B]" size={32} />
            <span className="text-xs font-bold text-[#6B6B6B]">Fetching food joint coordinates...</span>
          </div>
        ) : (
          <MapView
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={(place) => {
              setSelectedPlace(place);
              setSheetOpen(true);
            }}
          />
        )}

        {/* Subtle Toast message when filter returns empty results */}
        {toastMessage && (
          <div className="absolute bottom-[20%] left-1/2 transform -translate-x-1/2 z-[3000] bg-[#2C1810] text-[#FFFBF5] px-4 py-2.5 rounded-full text-xs font-bold shadow-md tracking-wide animate-in fade-in slide-in-from-bottom-2 duration-200">
            {toastMessage}
          </div>
        )}

        {/* Sliding Bottom Drawer details card */}
        <PlaceBottomSheet
          place={selectedPlace}
          sheetOpen={sheetOpen}
          isSaved={selectedPlace ? savedPlaces.has(selectedPlace.id) : false}
          onToggleSave={handleToggleSave}
          onClose={() => {
            setSheetOpen(false);
            setSelectedPlace(null);
          }}
        />
      </div>
    </div>
  );
}
