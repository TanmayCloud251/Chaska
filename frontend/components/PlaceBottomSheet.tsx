"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Star, Navigation, ArrowRight } from 'lucide-react';

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

interface PlaceBottomSheetProps {
  place: MapPlace | null;
  sheetOpen: boolean;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onClose: () => void;
}

export default function PlaceBottomSheet({
  place,
  sheetOpen,
  isSaved,
  onToggleSave,
  onClose,
}: PlaceBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close sheet when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        sheetOpen &&
        sheetRef.current &&
        !sheetRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.leaflet-marker-icon')
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [sheetOpen, onClose]);

  if (!place) return null;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const ratingVal = parseFloat(place.avg_rating as string) || 0;

  // Generate category tags matching mock data/design specs
  const getTagsForCategory = (cat: string) => {
    if (cat === 'chai') return ['Masala Chai', 'Cutting Chai'];
    if (cat === 'snacks') return ['Samosa', 'Kachori'];
    if (cat === 'cafe') return ['Burgers', 'Shakes'];
    return ['Highly Rated', 'Popular Choice'];
  };

  const tags = getTagsForCategory(place.category);

  return (
    <div
      ref={sheetRef}
      className="fixed bottom-[80px] left-0 right-0 z-[2000] w-full max-w-md mx-auto bg-white border-t border-border rounded-t-[24px] shadow-warm p-4 pb-6 flex flex-col gap-3 transition-transform duration-300 font-body"
      style={{
        height: '42%',
        transform: `translateY(${sheetOpen ? '0%' : '100%'})`,
      }}
    >
      {/* Drag handle line decoration */}
      <div 
        className="w-12 h-1 bg-[#E8E0D5] rounded-full mx-auto cursor-pointer" 
        onClick={onClose} 
      />

      {/* Main content grid */}
      <div className="flex gap-4 items-stretch flex-1 overflow-hidden mt-1">
        {/* Left cover photo (80x80 rounded square) */}
        <div className="relative w-20 h-20 rounded-[16px] overflow-hidden bg-[#FFFBF5] border border-[#E8E0D5] shadow-sm flex-shrink-0">
          {place.cover_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.cover_photo}
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#FFFBF5] text-[#F47C2B] font-bold text-[10px] uppercase text-center p-1">
              {place.name.substring(0, 10)}
            </div>
          )}
        </div>

        {/* Right Info pane */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* Title block & Heart Save button */}
            <div className="flex justify-between items-start gap-2">
              <h3 
                className="font-heading text-lg font-extrabold text-foreground leading-snug truncate"
              >
                {place.name}
              </h3>
              <button
                onClick={(e) => onToggleSave(place.id, e)}
                className={`p-1.5 rounded-full border transition-transform flex-shrink-0 hover:scale-105 active:scale-95 ${
                  isSaved
                    ? 'bg-primary-container/10 text-primary-container border-primary-container/20'
                    : 'bg-white text-muted-text border-border'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-primary-container stroke-primary-container' : 'stroke-current'} />
              </button>
            </div>
 
            {/* Area */}
            <p className="text-xs text-muted-text mt-0.5">{place.area}, Rajnandgaon</p>

            {/* Status indicators and Rating */}
            <div className="flex items-center gap-2 mt-2">
              {/* Rating */}
              <div className="flex items-center gap-0.5 text-xs font-bold text-foreground">
                <Star size={12} className="fill-primary-container stroke-primary-container" />
                <span>{ratingVal > 0 ? ratingVal.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-border text-[10px]">•</span>
              {/* Open tag */}
              <span
                className={`text-[10px] font-bold tracking-wide ${
                  place.is_open ? 'text-status-open' : 'text-status-closed'
                }`}
              >
                ● {place.is_open ? 'OPEN NOW' : 'CLOSED NOW'}
              </span>
            </div>
 
            {/* Category Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold text-foreground px-2 py-0.5 rounded-full border border-border bg-surface-container-low/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-auto">
            <Link
              href={`/place/${place.id}`}
              className="flex-1 text-center py-2.5 px-3 border border-primary-container text-primary-container hover:bg-surface-container-low/40 transition-colors rounded-btn text-xs font-bold shadow-sm active:scale-[0.98]"
            >
              View Details
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 px-3 bg-primary-container hover:bg-primary text-white transition-colors rounded-btn text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
            >
              <span>Take me there</span>
              <ArrowRight size={12} className="stroke-[3]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
