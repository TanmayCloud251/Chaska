import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

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
  category: 'chai' | 'coffee' | 'snacks' | 'cafe' | 'smoking_allowed';
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
  price_range?: string;
  avg_price?: number;
}

const highlightItemName = (text: string, itemName: string) => {
  if (!itemName) return text;
  const escaped = itemName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === itemName.toLowerCase() ? (
          <strong key={i} className="font-extrabold text-primary not-italic">{part}</strong>
        ) : (
          part
        )
      )}
    </>
  );
};

interface FeedCardProps {
  place: Place;
}

export default function FeedCard({ place }: FeedCardProps) {
  // Format rating to 1 decimal place
  const ratingVal = parseFloat(place.avg_rating as string) || 0;
  const ratingText = ratingVal > 0 ? ratingVal.toFixed(1) : '0.0';

  // Google Maps navigation link
  const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="bg-white border border-border/40 rounded-card overflow-hidden shadow-warm transition-all duration-300 hover:translate-y-[-2px] hover:shadow-lg">
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
          className={`absolute top-3 right-3 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-sm select-none backdrop-blur-md ${
            place.is_open
              ? 'bg-status-open/10 border border-status-open/30 text-status-open'
              : 'bg-status-closed/10 border border-status-closed/30 text-status-closed'
          }`}
        >
          {place.is_open ? 'Open Now' : 'Closed'}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col gap-3">
        {/* Name and Area */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-body text-xl leading-tight text-foreground font-extrabold hover:text-primary transition-colors">
              <Link href={`/place/${place.id}`}>{place.name}</Link>
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-text text-xs font-semibold">
              <span>{place.area}</span>
            </div>
          </div>
          {/* Rating Pill Badge */}
          <div className="flex items-center gap-1 bg-[#FEF3C7] text-[#B45309] px-2.5 py-1 rounded-lg text-xs font-extrabold shadow-sm select-none">
            <Star size={12} className="fill-[#B45309] stroke-none" />
            <span>{ratingText}</span>
          </div>
        </div>

        {/* Top Review Snippet */}
        {place.top_review ? (
          <div className="bg-surface-container-low p-4 rounded-2xl text-[13px] leading-relaxed text-foreground/95 italic font-medium">
            &ldquo;{highlightItemName(place.top_review.review_text, place.top_review.item_name)}&rdquo;
          </div>
        ) : (
          <div className="text-xs text-muted-text italic bg-surface-container-low p-4 rounded-2xl text-center select-none">
            No reviews yet. Be the first to share your experience!
          </div>
        )}

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1">
          {/* Pricing Text */}
          <div className="text-xs font-medium text-muted-text select-none leading-[1.3]">
            <div>{place.price_range || '₹'} • {place.category === 'chai' ? 'Chai' : place.category === 'snacks' ? 'Street Food' : place.category === 'smoking_allowed' ? 'Smoking Allowed' : 'Café'}</div>
            <div className="font-extrabold text-base text-foreground mt-0.5">₹{place.avg_price || 30}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/place/${place.id}`}
              className="text-xs font-bold bg-background text-foreground border border-border px-4 py-2.5 rounded-full hover:bg-surface-container-low/80 transition-colors shadow-sm"
            >
              Details
            </Link>
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold bg-primary-container text-white border border-primary-container px-4 py-2.5 rounded-full shadow-sm hover:bg-primary transition-all flex items-center gap-1"
            >
              Take me there
              <ArrowRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
