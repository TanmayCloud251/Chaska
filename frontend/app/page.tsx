"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import FeedCard from '../components/FeedCard';
import { Search, MapPin, SlidersHorizontal, Plus, Loader2, X } from 'lucide-react';

export default function FeedScreen() {
  const { user, setLoginSheetOpen } = useAuth();
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all'); // all, chai, snacks, cafe
  const [openNow, setOpenNow] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string>('all'); // all, 30, 50, 100

  // Sorting & Modal state
  const [sortBy, setSortBy] = useState<string>('rating'); // rating, recent, most_reviewed
  const [showFilterModal, setShowFilterModal] = useState(false);
  const isAnyFilterActive = sortBy !== 'rating' || openNow || priceFilter !== 'all' || activeCategory !== 'all';

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

  // Client-side search and additional filtering (like price ranges)
  const filteredPlaces = places.filter(place => {
    const matchesSearch = 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.area.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesPrice = priceFilter === 'all'
      ? true
      : (place.avg_price 
          ? place.avg_price <= parseInt(priceFilter, 10) 
          : (priceFilter === '30' && (place.category === 'chai' || place.category === 'snacks')));

    return matchesSearch && matchesPrice;
  });

  const categoryFilters = [
    { id: 'all', label: 'All' },
    { id: 'chai', label: 'Chai' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'cafe', label: 'Café' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Sticky Top Bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1.5 text-foreground">
          <span className="font-heading text-xl font-extrabold tracking-wide text-foreground">Chaska</span>
        </Link>

        {/* Location Pill */}
        <div className="flex items-center gap-1 bg-surface-container-low border border-border/30 px-3.5 py-1.5 rounded-full text-xs font-bold select-none shadow-sm">
          <MapPin size={12} className="text-primary" />
          <span className="text-black">Rajnandgaon</span>
        </div>

        {/* Avatar / Profile Trigger */}
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

      {/* Main Feed Content Area */}
      <div className="flex-1 p-4 flex flex-col gap-4">
        
        {/* 2. Search Bar Layout */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-container" size={16} />
          <input
            type="text"
            placeholder="Search for chai, snacks, or cafes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-white border border-border rounded-card pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary-container focus:ring-0 focus:border-2 shadow-warm placeholder-muted-text/80 text-foreground transition-all"
          />
        </div>

        {/* 3. Horizontal Categories Scroll & Filter Button */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar py-1">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary-container text-white border-primary-container shadow-sm'
                    : 'bg-white text-muted-text border-border hover:bg-surface-container-low/50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFilterModal(true)}
              className={`w-11 h-11 border border-border rounded-card flex items-center justify-center transition-colors shadow-warm bg-white hover:bg-surface-container/20 ${
                isAnyFilterActive ? 'text-primary border-primary/50' : 'text-foreground'
              }`}
              title="Filter items"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
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

      {/* Filters & Sort Modal Drawer */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setShowFilterModal(false)}></div>
          
          <div className="relative z-10 w-full max-w-md bg-white border-t border-border rounded-t-[24px] shadow-2xl p-6 max-h-[85vh] overflow-y-auto flex flex-col gap-5 text-foreground animate-in slide-in-from-bottom duration-250">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-heading text-lg font-bold text-foreground">Filters & Sort</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="p-1.5 rounded-full hover:bg-surface-container-low text-muted-text hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sort Section */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">Sort By</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rating', label: '⭐ Rating' },
                  { id: 'recent', label: '🕒 Recent' },
                  { id: 'most_reviewed', label: '💬 Popular' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={`py-2 rounded-card border text-xs font-bold transition-all ${
                      sortBy === opt.id
                        ? 'bg-primary-container/10 border-primary-container text-primary-container'
                        : 'border-border bg-white text-muted-text hover:bg-surface-container-low/30'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Operational Status */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">Status</h4>
              <button
                type="button"
                onClick={() => setOpenNow(!openNow)}
                className={`w-full py-2.5 rounded-card border text-xs font-bold flex items-center justify-between px-4 transition-all ${
                  openNow
                    ? 'bg-primary-container/10 border-primary-container text-primary-container'
                    : 'border-border bg-white text-muted-text hover:bg-surface-container-low/30'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-status-open">●</span>
                  Show Open Now Only
                </span>
                <span className={`w-4 h-4 rounded border flex items-center justify-center ${openNow ? 'bg-primary-container border-primary-container text-white' : 'border-border bg-white'}`}>
                  {openNow && '✓'}
                </span>
              </button>
            </div>

            {/* Price Limit Section */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">Budget (Max Price)</h4>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Any' },
                  { id: '30', label: '₹30' },
                  { id: '50', label: '₹50' },
                  { id: '100', label: '₹100' },
                ].map((opt) => {
                  const isActive = priceFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPriceFilter(opt.id)}
                      className={`py-2 rounded-card border text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary-container/10 border-primary-container text-primary-container'
                          : 'border-border bg-white text-muted-text hover:bg-surface-container-low/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Place Type Section */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">Category (Place Type)</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All Places' },
                  { id: 'chai', label: 'Chai / Cafe' },
                  { id: 'snacks', label: 'Snacks Stalls' },
                  { id: 'cafe', label: 'Cafés & Dining' },
                ].map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`py-2 px-3 rounded-card border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        isActive
                          ? 'bg-primary-container/10 border-primary-container text-primary-container'
                          : 'border-border bg-white text-muted-text hover:bg-surface-container-low/30'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isActive && <span className="text-primary-container">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center gap-3 border-t border-border/50 pt-4 mt-2">
              <button
                type="button"
                onClick={() => {
                  setSortBy('rating');
                  setOpenNow(false);
                  setPriceFilter('all');
                  setActiveCategory('all');
                }}
                className="flex-1 py-3 border border-border rounded-btn text-xs font-bold hover:bg-surface-container-low text-muted-text transition-colors"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-3 bg-primary-container hover:bg-primary text-white rounded-btn text-xs font-bold shadow-sm transition-colors"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
