"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import FeedCard from '../components/FeedCard';
import { Flame, Search, MapPin, SlidersHorizontal, Plus, Loader2 } from 'lucide-react';

export default function FeedScreen() {
  const { user, setLoginSheetOpen } = useAuth();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all'); // all, chai, snacks, cafe
  const [openNow, setOpenNow] = useState(false);
  const [under30, setUnder30] = useState(false);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('rating'); // rating, recent, most_reviewed
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const data = await api.getPlaces({
        category: activeCategory === 'all' ? undefined : activeCategory,
        open_now: openNow,
        sort: sortBy
      });
      setPlaces(data);
    } catch (error) {
      console.error("Error loading places:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [activeCategory, openNow, sortBy]);

  // Client-side search and additional filtering (like Under ₹30)
  const filteredPlaces = places.filter(place => {
    const matchesSearch = 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.area.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesUnder30 = under30 
      ? (place.category === 'chai' || place.category === 'snacks') // chai & snacks are typical under-30 spots
      : true;

    return matchesSearch && matchesUnder30;
  });

  const categoryFilters = [
    { id: 'all', label: '🍟 All Food' },
    { id: 'chai', label: '☕ Chai Tapri' },
    { id: 'snacks', label: '🍢 Snacks' },
    { id: 'cafe', label: '🍰 Café' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/80 px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-primary">
          <Flame size={24} fill="currentColor" />
          <span className="font-heading text-2xl font-extrabold tracking-wide">Chaska</span>
        </Link>

        {/* Location Pill */}
        <div className="flex items-center gap-1 bg-[#FFF2E0] border border-[#FEE2C3] px-3 py-1.5 rounded-tag text-xs font-bold text-primary select-none">
          <MapPin size={12} fill="currentColor" />
          <span>Rajnandgaon</span>
        </div>

        {/* Avatar / Profile Trigger */}
        {user ? (
          <Link 
            href="/profile" 
            className="w-9 h-9 rounded-full overflow-hidden border border-primary shadow-sm hover:scale-105 transition-transform"
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

      {/* Main Feed Content Area */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        
        {/* 2. Search & Sort Layout */}
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-text" size={16} />
            <input
              type="text"
              placeholder="Search stalls, areas, chaat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-none focus:border-primary shadow-sm placeholder-muted-text"
            />
          </div>

          {/* Sort Button */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`w-11 h-11 border border-border rounded-xl flex items-center justify-center transition-colors shadow-sm bg-card hover:bg-orange-50 ${
                sortBy !== 'rating' ? 'text-primary border-primary/50' : 'text-foreground'
              }`}
              title="Sort items"
            >
              <SlidersHorizontal size={16} />
            </button>

            {/* Sort Dropdown Drawer */}
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden text-xs py-1">
                <p className="px-3 py-1.5 font-bold text-muted-text text-[10px] uppercase border-b border-border/60">
                  Sort Places By
                </p>
                <button
                  onClick={() => { setSortBy('rating'); setShowSortDropdown(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-orange-50 font-semibold flex items-center justify-between ${
                    sortBy === 'rating' ? 'text-primary bg-orange-50/40' : 'text-foreground'
                  }`}
                >
                  ⭐ Top Rated
                </button>
                <button
                  onClick={() => { setSortBy('recent'); setShowSortDropdown(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-orange-50 font-semibold flex items-center justify-between ${
                    sortBy === 'recent' ? 'text-primary bg-orange-50/40' : 'text-foreground'
                  }`}
                >
                  🕒 Newly Added
                </button>
                <button
                  onClick={() => { setSortBy('most_reviewed'); setShowSortDropdown(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-orange-50 font-semibold flex items-center justify-between ${
                    sortBy === 'most_reviewed' ? 'text-primary bg-orange-50/40' : 'text-foreground'
                  }`}
                >
                  💬 Most Reviewed
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Horizontal Categories Scroll */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-tag text-xs font-bold whitespace-nowrap border transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white border-primary shadow-sm scale-102'
                  : 'bg-card text-foreground border-border hover:bg-orange-50/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 4. Filter Pills (Open Now & Under ₹30) */}
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => setOpenNow(!openNow)}
            className={`px-3 py-1 rounded-full border font-bold flex items-center gap-1 transition-all ${
              openNow
                ? 'bg-[#E8F5E9] text-status-open border-[#A5D6A7]'
                : 'bg-card text-muted-text border-border'
            }`}
          >
            <span className={openNow ? 'text-status-open' : 'text-muted-text'}>●</span>
            Open Now
          </button>

          <button
            onClick={() => setUnder30(!under30)}
            className={`px-3 py-1 rounded-full border font-bold transition-all ${
              under30
                ? 'bg-[#E0F2F1] text-emerald-800 border-[#80CBC4]'
                : 'bg-card text-muted-text border-border'
            }`}
          >
            Under ₹30
          </button>
        </div>

        {/* 5. Card Feed List */}
        <div className="flex flex-col gap-4 mt-1">
          {loading ? (
            // Skeleton Loader States
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-card overflow-hidden shadow-warm animate-pulse">
                <div className="aspect-[16/9] w-full bg-border/40"></div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-5 bg-border/60 rounded-md w-3/4"></div>
                  <div className="h-4 bg-border/40 rounded-md w-1/2"></div>
                  <div className="h-12 bg-border/30 rounded-xl mt-1"></div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="h-6 bg-border/40 rounded-md w-16"></div>
                    <div className="h-8 bg-border/60 rounded-full w-24"></div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <FeedCard key={place.id} place={place} />
            ))
          ) : (
            // Empty Search Results
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
              <Loader2 className="animate-spin text-primary hidden" />
              <div className="text-4xl">🤷🏽‍♂️</div>
              <h4 className="font-heading text-lg text-foreground font-extrabold">No Spots Found</h4>
              <p className="text-xs text-muted-text max-w-[240px]">
                We couldn&apos;t find any matching food joints in Rajnandgaon. Try changing filters or add it to Chaska!
              </p>
              <Link
                href="/add-place"
                className="mt-2 bg-primary text-white font-bold px-4 py-2 rounded-btn shadow-md hover:bg-orange-600 transition-colors text-xs"
              >
                + Add a New Stall
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Floating Add Button for Quick Shortcut */}
      <Link
        href="/add-place"
        className="fixed bottom-20 right-4 z-40 w-12 h-12 bg-primary hover:bg-orange-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all"
        title="Add spot"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
