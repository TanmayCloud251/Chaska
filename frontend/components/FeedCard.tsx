import Link from 'next/link';
import { Star, MapPin, ArrowUpRight } from 'lucide-react';
import ChatorBadge from './ChatorBadge';

interface ReviewSnippet {
  id: string;
  item_name: string;
  review_text: string;
  user_name: string;
  is_chator: boolean;
}

interface Place {
  id: string;
  name: string;
  category: 'chai' | 'coffee' | 'snacks' | 'cafe';
  area: string;
  description: string;
  lat: number;
  lng: number;
  maps_url: string;
  is_verified: boolean;
  cover_photo: string | null;
  avg_rating: string | number;
  review_count: number;
  is_open: boolean;
  top_review: ReviewSnippet | null;
}

interface FeedCardProps {
  place: Place;
}

export default function FeedCard({ place }: FeedCardProps) {
  // Format rating to 1 decimal place
  const ratingVal = parseFloat(place.avg_rating as string) || 0;
  const ratingText = ratingVal > 0 ? ratingVal.toFixed(1) : 'No reviews';

  // Dynamic colors for category tags
  const categoryColors = {
    chai: 'bg-orange-50 text-orange-700 border-orange-200',
    coffee: 'bg-amber-50 text-amber-900 border-amber-200',
    snacks: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    cafe: 'bg-red-50 text-red-800 border-red-200',
  };

  // Maps Category Name to Display Name
  const categoryDisplay = {
    chai: 'Chai Tapri',
    coffee: 'Café Coffee',
    snacks: 'Snacks Stall',
    cafe: 'Café & Chill',
  };

  // Google Maps navigation link
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="bg-card border border-border rounded-card overflow-hidden shadow-warm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
      {/* 16:9 Card Media Section */}
      <div className="relative aspect-[16/9] w-full bg-[#F5EFE6]">
        {place.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={place.cover_photo}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center text-muted-text">
            <span className="font-heading text-lg text-amber-800">{place.name}</span>
            <span className="text-xs">No Cover Photo</span>
          </div>
        )}

        {/* Overlaid Open/Closed Status Badge */}
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold tracking-wider px-2 py-1 rounded-tag shadow-md uppercase select-none ${
            place.is_open
              ? 'bg-[#E8F5E9] text-status-open border border-[#C8E6C9]'
              : 'bg-[#FFEBEE] text-status-closed border border-[#FFCDD2]'
          }`}
        >
          {place.is_open ? '● Open Now' : '○ Closed'}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Name and Area */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-heading text-lg leading-tight tracking-wide text-foreground font-extrabold hover:text-primary transition-colors">
              <Link href={`/place/${place.id}`}>{place.name}</Link>
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-text">
              <MapPin size={12} className="text-primary" />
              <span className="text-xs font-semibold">{place.area}</span>
              {place.is_verified && (
                <span className="bg-sky-50 text-sky-600 border border-sky-200 text-[9px] px-1 rounded-sm ml-1 select-none font-bold">
                  Verified
                </span>
              )}
            </div>
          </div>
          {/* Category Tag */}
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-tag border capitalize select-none ${
              categoryColors[place.category]
            }`}
          >
            {categoryDisplay[place.category]}
          </span>
        </div>

        {/* Rating and Reviews count */}
        <div className="flex items-center gap-1.5 text-sm">
          <div className="flex items-center text-amber-500 fill-amber-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= ratingVal ? 'fill-amber-500 stroke-amber-500' : 'stroke-amber-300 fill-none'}
              />
            ))}
          </div>
          <span className="font-bold text-foreground ml-1">{ratingText}</span>
          <span className="text-muted-text text-xs">({place.review_count} reviews)</span>
        </div>

        {/* Top Review Snippet */}
        {place.top_review ? (
          <div className="bg-[#FAF6F0] border-l-2 border-primary/50 p-2.5 rounded-r-xl text-xs flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <span className="font-bold text-foreground">{place.top_review.user_name}</span>
                {place.top_review.is_chator && <ChatorBadge />}
              </div>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-semibold select-none">
                Best Review
              </span>
            </div>
            <p className="text-foreground">
              Must Try: <span className="font-bold text-primary">{place.top_review.item_name}</span>
            </p>
            <p className="italic text-muted-text">
              &ldquo;{place.top_review.review_text.length > 75 
                ? `${place.top_review.review_text.substring(0, 75)}...` 
                : place.top_review.review_text}&rdquo;
            </p>
          </div>
        ) : (
          <div className="text-xs text-muted-text italic bg-[#FAF6F0] p-2 rounded-xl text-center select-none">
            No reviews yet. Be the first to share your experience!
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-2 mt-1 border-t border-border/60 pt-3">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-tag border border-emerald-100 select-none">
            {place.category === 'chai' ? 'Under ₹15' : 'Under ₹60'}
          </span>
          <div className="flex items-center gap-2">
            <Link
              href={`/place/${place.id}`}
              className="text-xs font-bold border border-primary text-primary px-3.5 py-1.5 rounded-btn hover:bg-orange-50 transition-colors"
            >
              Details
            </Link>
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold bg-primary text-white border border-primary px-3.5 py-1.5 rounded-btn shadow-md hover:bg-orange-600 transition-all flex items-center gap-0.5"
            >
              Go Now
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
