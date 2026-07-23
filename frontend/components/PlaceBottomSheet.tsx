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
        !(e.target as Element).closest('.map-marker')
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
      className="fixed bottom-[80px] left-0 right-0 z-[2000] w-full max-w-md mx-auto bg-[#FFFFFF] border-t border-[#E8E0D5] rounded-t-[24px] shadow-[0_-8px_30px_rgba(44,24,16,0.12)] p-4 pb-6 flex flex-col gap-3 transition-transform duration-300"
      style={{
        height: '42%',
        fontFamily: 'Nunito, sans-serif',
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
                className="font-heading text-lg font-extrabold text-[#2C1810] leading-snug truncate"
                style={{ fontFamily: 'Baloo 2, sans-serif' }}
              >
                {place.name}
              </h3>
              <button
                onClick={(e) => onToggleSave(place.id, e)}
                className={`p-1.5 rounded-full border transition-transform flex-shrink-0 hover:scale-105 active:scale-95 ${
                  isSaved
                    ? 'bg-[#F47C2B]/10 text-[#F47C2B] border-[#F47C2B]/20'
                    : 'bg-white text-[#6B6B6B] border-[#E8E0D5]'
                }`}
              >
                <Heart size={16} className={isSaved ? 'fill-[#F47C2B] stroke-[#F47C2B]' : 'stroke-current'} />
              </button>
            </div>

            {/* Area */}
            <p className="text-xs text-[#6B6B6B] mt-0.5">{place.area}, Rajnandgaon</p>

            {/* Status indicators and Rating */}
            <div className="flex items-center gap-2 mt-2">
              {/* Rating */}
              <div className="flex items-center gap-0.5 text-xs font-bold text-[#2C1810]">
                <Star size={12} className="fill-[#F47C2B] stroke-[#F47C2B]" />
                <span>{ratingVal > 0 ? ratingVal.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-[#E8E0D5] text-[10px]">•</span>
              {/* Open tag */}
              <span
                className="text-[10px] font-bold tracking-wide"
                style={{ color: place.is_open ? '#2E7D32' : '#C62828' }}
              >
                ● {place.is_open ? 'OPEN NOW' : 'CLOSED NOW'}
              </span>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] font-bold text-[#2C1810] px-2 py-0.5 rounded-full border border-[#E8E0D5] bg-[#FFFBF5]"
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
              className="flex-1 text-center py-2.5 px-3 border border-[#F47C2B] text-[#F47C2B] hover:bg-[#FFFBF5] transition-colors rounded-[24px] text-xs font-bold shadow-sm active:scale-[0.98]"
            >
              View Details
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 px-3 bg-[#F47C2B] hover:bg-[#d8661e] text-white transition-colors rounded-[24px] text-xs font-bold flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
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
