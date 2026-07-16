"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, MapPin, ArrowRight, Star } from 'lucide-react';

interface MapPlaceCardProps {
  place: {
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
  };
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onClose?: () => void;
}

export default function MapPlaceCard({ place, isSaved, onToggleSave, onClose }: MapPlaceCardProps) {
  const categoryLabel = 
    place.category === 'chai' 
      ? 'Authentic Chai' 
      : place.category === 'snacks' 
      ? 'Snacks & Street Food' 
      : place.category === 'cafe' 
      ? 'Café & Coffee' 
      : place.category === 'smoking_allowed'
      ? 'Smoking Zone'
      : 'Eatery';

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
  const ratingVal = parseFloat(place.avg_rating as string) || 0;

  return (
    <div className="w-full bg-white border border-border/40 rounded-t-[28px] shadow-[0_-8px_30px_rgba(44,24,16,0.12)] p-4 flex flex-col gap-3 relative transition-all duration-300 animate-in slide-in-from-bottom-5">
      {/* Swipe handle decoration */}
      <div className="w-12 h-1 bg-border/60 rounded-full mx-auto mb-1 cursor-pointer" onClick={onClose} />

      {/* Main card details content */}
      <div className="flex gap-4 items-stretch">
        
        {/* Left side tall image */}
        <div className="relative w-[100px] min-w-[100px] h-[135px] rounded-[14px] overflow-hidden bg-surface-container-low shadow-sm flex-shrink-0">
          {place.cover_photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={place.cover_photo} 
              alt={place.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container text-primary font-bold text-[10px] uppercase text-center p-2">
              {place.name}
            </div>
          )}

          {/* Rating Badge */}
          {ratingVal > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-[2px] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full">
              <Star size={8} className="fill-[#F59E0B] stroke-none" />
              <span>{ratingVal.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Right side info panel */}
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div className="flex flex-col gap-1.5">
            {/* Title & Heart Button */}
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-heading text-[16px] font-extrabold text-foreground leading-tight tracking-wide truncate">
                {place.name}
              </h3>
              <button 
                onClick={(e) => onToggleSave(place.id, e)}
                className={`p-1.5 rounded-full border border-border/20 shadow-sm transition-colors flex-shrink-0 hover:scale-110 active:scale-95 ${
                  isSaved 
                    ? 'bg-primary-container/10 text-primary-container border-primary-container/30' 
                    : 'bg-white text-muted-text hover:text-foreground'
                }`}
                title={isSaved ? "Unsave joint" : "Save joint"}
              >
                <Heart size={15} className={isSaved ? 'fill-primary-container' : ''} />
              </button>
            </div>

            {/* Address Area */}
            <div className="flex items-start gap-1 text-[11px] font-bold text-muted-text leading-tight">
              <MapPin size={12} className="text-primary-container flex-shrink-0 mt-0.5" />
              <span className="truncate">{place.area}</span>
            </div>

            {/* Badges/Tags */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span
                className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  place.is_open
                    ? 'bg-status-open/10 text-status-open border border-status-open/20'
                    : 'bg-status-closed/10 text-status-closed border border-status-closed/20'
                }`}
              >
                {place.is_open ? 'OPEN NOW' : 'CLOSED'}
              </span>
              <span className="text-[9px] font-bold text-muted-text px-2 py-0.5 rounded-full border border-border bg-background">
                {categoryLabel}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2.5 mt-3">
            <Link
              href={`/place/${place.id}`}
              className="flex-1 text-center py-2.5 px-3 border border-primary text-primary hover:bg-surface-container-low transition-colors rounded-[24px] text-[11px] font-extrabold shadow-sm active:scale-[0.98]"
            >
              View Details
            </Link>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 px-3 bg-primary-container hover:bg-primary text-white transition-colors rounded-[24px] text-[11px] font-extrabold flex items-center justify-center gap-1 shadow-sm active:scale-[0.98]"
            >
              <span>Take me there</span>
              <ArrowRight size={11} className="stroke-[3]" />
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
