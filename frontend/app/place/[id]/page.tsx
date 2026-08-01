"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth';
import { api } from '../../../lib/api';
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  Star, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  AlertTriangle, 
  Plus, 
  X, 
  Check, 
  Loader2,
  Camera,
  Image,
  Send
} from 'lucide-react';

export default function PlaceDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user, setLoginSheetOpen } = useAuth();

  // State
  const [place, setPlace] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'claims'>('reviews');
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Review Sheet State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [foodRating, setFoodRating] = useState(3);
  const [serviceRating, setServiceRating] = useState(3);
  const [cleanlinessRating, setCleanlinessRating] = useState(3);
  const [valueRating, setValueRating] = useState(3);
  const [reviewText, setReviewText] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Preset Unsplash street food photos for mock photo-adding cycle
  const MOCK_FOOD_PHOTOS = [
    'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80', // Samosa
    'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80', // Chai
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', // Idli/Vada
    'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80', // Kachori
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80', // Paneer tikka
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80', // Coffee
  ];

  const handleAddMockPhoto = () => {
    const nextPhoto = MOCK_FOOD_PHOTOS[reviewPhotos.length % MOCK_FOOD_PHOTOS.length];
    setReviewPhotos(prev => [...prev, nextPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setReviewPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  // Claim Form State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimType, setClaimType] = useState('does_not_exist'); // does_not_exist, relocated, duplicate, incorrect_info
  const [claimDescription, setClaimDescription] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');

  // General Messages/Toasts
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch Place Details
  const loadData = async () => {
    try {
      const placeData = await api.getPlaceDetails(id);
      setPlace(placeData);

      const reviewsData = await api.getPlaceReviews(id);
      setReviews(reviewsData);

      const claimsData = await api.getPlaceClaims(id);
      setClaims(claimsData);
    } catch (err) {
      console.error("Error loading place details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <span className="text-xs text-muted-text font-bold">Loading stall details...</span>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 gap-4">
        <span className="text-5xl">🤷🏽‍♂️</span>
        <h3 className="font-heading text-lg font-extrabold text-foreground">Stall Not Found</h3>
        <p className="text-xs text-muted-text max-w-[280px]">
          We couldn&apos;t find this food joint. It might have been deleted or the link is incorrect.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-btn shadow-md hover:bg-orange-600 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  // Bookmarking / Saved Toggle
  const handleSaveToggle = async () => {
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }
    try {
      if (place.is_saved) {
        await api.unsavePlace(place.id);
        setPlace({ ...place, is_saved: false });
        showToast("Removed from saved places");
      } else {
        await api.savePlace(place.id);
        setPlace({ ...place, is_saved: true });
        showToast("Saved to your places!");
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  // Share link
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    showToast("Link copied to clipboard!");
  };

  // Review Voting
  const handleReviewVote = async (reviewId: string, voteType: 'agree' | 'disagree') => {
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }

    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    // Optimistic UI updates
    const currentVote = review.user_vote;
    let newVote: 'agree' | 'disagree' | null = voteType;
    let agreeDiff = 0;
    let disagreeDiff = 0;

    if (currentVote === voteType) {
      // User is removing their vote
      newVote = null;
      if (voteType === 'agree') agreeDiff = -1;
      else disagreeDiff = -1;
    } else {
      // User is changing or adding vote
      if (voteType === 'agree') {
        agreeDiff = 1;
        if (currentVote === 'disagree') disagreeDiff = -1;
      } else {
        disagreeDiff = 1;
        if (currentVote === 'agree') agreeDiff = -1;
      }
    }

    // Update state locally first
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        return {
          ...r,
          user_vote: newVote,
          agree_count: Math.max(0, (parseInt(r.agree_count, 10) || 0) + agreeDiff),
          disagree_count: Math.max(0, (parseInt(r.disagree_count, 10) || 0) + disagreeDiff)
        };
      }
      return r;
    }));

    try {
      if (currentVote === voteType) {
        await api.removeVote(reviewId);
      } else {
        await api.castVote(reviewId, voteType);
      }
    } catch (err) {
      console.error("Error voting:", err);
      // Revert in case of API failure
      loadData();
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }
    if (!itemName.trim() || !reviewText.trim()) {
      setReviewError("Please fill in the item name and write a brief review.");
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      await api.writeReview(place.id, {
        item_name: itemName,
        overall_rating: overallRating,
        food_rating: foodRating,
        service_rating: serviceRating,
        cleanliness_rating: cleanlinessRating,
        value_rating: valueRating,
        review_text: reviewText,
        photo_urls: reviewPhotos
      });

      // Reload reviews and place stats
      await loadData();
      
      // Reset & Close
      setItemName('');
      setOverallRating(5);
      setFoodRating(3);
      setServiceRating(3);
      setCleanlinessRating(3);
      setValueRating(3);
      setReviewText('');
      setReviewPhotos([]);
      setShowReviewModal(false);
      showToast("Review submitted successfully!");
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Claim Voting
  const handleClaimVote = async (claimId: string, voteType: 'agree' | 'disagree') => {
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }

    try {
      // Simplified: directly vote and reload
      await api.voteOnClaim(claimId, voteType);
      showToast("Vote registered");
      loadData();
    } catch (err: any) {
      if (err.message && err.message.includes("already voted")) {
        // Option to remove vote
        try {
          await api.removeClaimVote(claimId);
          showToast("Vote removed");
          loadData();
        } catch (e) {
          console.error("Error removing claim vote:", e);
        }
      } else {
        console.error("Error voting on claim:", err);
      }
    }
  };

  // Raise Claim
  const handleRaiseClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLoginSheetOpen(true);
      return;
    }
    if (!claimDescription.trim()) {
      setClaimError("Please provide a description of the issue.");
      return;
    }

    setSubmittingClaim(true);
    setClaimError('');

    try {
      await api.raiseClaim(place.id, claimType, claimDescription);
      await loadData();
      
      setClaimDescription('');
      setShowClaimModal(false);
      showToast("Report submitted to community moderation");
    } catch (err: any) {
      setClaimError(err.message || "Failed to raise claim.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Highlights
  const highlightItemName = (text: string, itName: string) => {
    if (!itName) return text;
    const escaped = itName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === itName.toLowerCase() ? (
            <strong key={i} className="font-extrabold text-primary not-italic">{part}</strong>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Dynamic tags generated from rating & details
  const tags: string[] = [];
  if (place.category === 'chai') {
    tags.push('Chai Point', 'Evening Spot');
  } else if (place.category === 'snacks') {
    tags.push('Best Samosas', 'Quick Bite');
  } else if (place.category === 'cafe') {
    tags.push('Café & Coffee', 'Good Hangout', 'Work Vibe');
  } else if (place.category === 'smoking_allowed') {
    tags.push('Smoking Zone', 'Hangout Spot');
  }
  if (parseFloat(place.avg_rating) >= 4.5) {
    tags.push('Student Favorite', 'Highly Rated');
  } else if (parseFloat(place.avg_rating) > 0) {
    tags.push('Popular choice');
  }

  // Google Maps navigation url
  const navUrl = place.maps_url || `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  const ratingVal = parseFloat(place.avg_rating) || 0;
  const ratingText = ratingVal > 0 ? ratingVal.toFixed(1) : '0.0';

  const breakdown = place.ratings_breakdown || { food: 0, service: 0, cleanliness: 0, value: 0 };
  const getPercent = (val: number) => {
    const num = parseFloat(val as any) || 0;
    return (num / 3) * 100;
  };

  const getClaimLabel = (type: string) => {
    switch (type) {
      case 'does_not_exist': return "Doesn't Exist";
      case 'relocated': return "Relocated / Moved";
      case 'duplicate': return "Duplicate Listing";
      case 'incorrect_info': return "Incorrect Stall Info";
      default: return type;
    }
  };

  const photos = place.photos || [];

  return (
    <div className="flex flex-col min-h-screen pb-24 text-foreground bg-background relative">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-surface-container-low text-foreground transition-colors"
          title="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <span className="font-heading text-lg font-extrabold tracking-wide text-primary">
          Chaska
        </span>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-surface-container-low text-foreground transition-colors"
            title="Share joint"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={handleSaveToggle}
            className={`p-1.5 rounded-full hover:bg-surface-container-low transition-colors ${
              place.is_saved ? 'text-primary' : 'text-foreground'
            }`}
            title={place.is_saved ? "Unsave stall" : "Save stall"}
          >
            <Bookmark size={18} className={place.is_saved ? 'fill-primary' : ''} />
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-1.5 animate-in fade-in duration-200">
          <Check size={14} className="text-primary-container" />
          {toastMessage}
        </div>
      )}

      {/* 2. Photo Banner Section with Overlay */}
      <div className="relative aspect-[16/9] w-full bg-surface-container-low overflow-hidden">
        {photos.length > 0 ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={photos[currentPhotoIdx].photo_url} 
              alt={place.name} 
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentPhotoIdx(prev => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                  title="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={() => setCurrentPhotoIdx(prev => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
                  title="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center text-muted-text bg-[#F5EFE6]">
            <span className="font-heading text-xl text-primary font-bold">{place.name}</span>
            <span className="text-xs font-semibold mt-1">No Stall Photos Yet</span>
          </div>
        )}

        {/* Shadow Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent pointer-events-none" />

        {/* Details Overlay on Banner */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end text-white">
          <div>
            <h2 className="font-body text-xl font-extrabold tracking-wide leading-tight">
              {place.name}
            </h2>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white/95 mt-0.5">
              <MapPin size={11} className="text-primary-container" />
              <span>{place.area}</span>
            </div>
          </div>
          {photos.length > 1 && (
            <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded-full select-none font-bold text-white/90">
              {currentPhotoIdx + 1}/{photos.length}
            </span>
          )}
        </div>
      </div>

      {/* Body Area */}
      <div className="px-4 py-4 flex flex-col gap-4">
        
        {/* 3. Open Now + Ratings Meta-Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-extrabold px-3 py-1 rounded-full select-none ${
                place.is_open
                  ? 'bg-status-open/10 border border-status-open/30 text-status-open'
                  : 'bg-status-closed/10 border border-status-closed/30 text-status-closed'
              }`}
            >
              ● {place.is_open ? 'Open Now' : 'Closed'}
            </span>
            <span className="text-xs text-muted-text font-bold">
              {place.price_range || '₹'} • {place.category === 'chai' ? 'Chai' : place.category === 'snacks' ? 'Street Food' : place.category === 'smoking_allowed' ? 'Smoking Allowed' : 'Café'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-extrabold select-none">
            <Star size={13} className="fill-[#B45309] stroke-none" />
            <span className="text-foreground">{ratingText}</span>
            <span className="text-muted-text font-normal">({place.review_count})</span>
          </div>
        </div>

        {/* 4. Recommendation Tags */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3.5 py-1.5 rounded-full border border-border bg-white text-[11px] font-bold text-muted-text whitespace-nowrap shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 5. Ratings Breakdown Card */}
        <div className="bg-surface-container-low border border-border/30 rounded-card p-4 flex gap-5 items-center shadow-warm">
          <div className="flex flex-col items-center gap-1 px-2">
            <span className="text-3xl font-extrabold text-foreground">{ratingText}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.round(ratingVal) ? "fill-[#B45309] stroke-none" : "text-border fill-none"} 
                />
              ))}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-1.5 border-l border-border/40 pl-5 text-[11px] font-bold">
            {[
              { label: 'Food', val: breakdown.food },
              { label: 'Service', val: breakdown.service },
              { label: 'Cleanliness', val: breakdown.cleanliness },
              { label: 'Value', val: breakdown.value },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 text-muted-text">
                <span className="w-16 text-left">{item.label}</span>
                <div className="flex-1 h-2 bg-border/40 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-container"
                    style={{ width: `${getPercent(item.val)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Tabs Segment Navigation */}
        <div className="flex border-b border-border/50">
          {(['overview', 'reviews', 'claims'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-extrabold text-center border-b-2 capitalize transition-colors ${
                activeTab === tab
                  ? 'border-primary-container text-foreground'
                  : 'border-transparent text-muted-text hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 7. Tab Panel Content */}
        <div>
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              {/* Description */}
              <div className="bg-white border border-border/40 rounded-card p-4 shadow-warm flex flex-col gap-2">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted-text">
                  About the Stall
                </h4>
                <p className="text-xs text-foreground/90 leading-relaxed font-semibold">
                  {place.description || "No description provided for this stall yet. Add one to help the community!"}
                </p>
              </div>

              {/* Operating Hours / Shifts */}
              <div className="bg-white border border-border/40 rounded-card p-4 shadow-warm flex flex-col gap-3">
                <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
                  <Clock size={14} className="text-primary" />
                  <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted-text">
                    Operating Shifts
                  </h4>
                </div>
                {place.shifts && place.shifts.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {place.shifts.map((shift: any) => (
                      <div key={shift.id} className="flex justify-between items-center text-xs font-semibold text-foreground">
                        <div className="flex flex-col">
                          <span>{shift.shift_label || 'Shift'}</span>
                          <span className="text-[10px] text-muted-text capitalize">
                            {shift.day_type === 'all_days' ? 'All Days' : shift.day_type}
                          </span>
                        </div>
                        <span className="font-extrabold bg-surface-container/60 px-3 py-1 rounded-full text-[11px]">
                          {shift.opens_at} - {shift.closes_at}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs italic text-muted-text select-none">
                    No operating hours specified.
                  </div>
                )}
              </div>

              {/* Location Directions Block */}
              <div className="bg-white border border-border/40 rounded-card p-4 shadow-warm flex flex-col gap-3">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted-text">
                  Stall Location
                </h4>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-extrabold text-foreground">{place.name}</span>
                  <span className="text-[11px] text-muted-text font-semibold">{place.area}</span>
                </div>
                <a
                  href={navUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 w-full py-2.5 bg-background border border-border text-foreground hover:bg-surface-container-low transition-colors rounded-btn text-xs font-extrabold flex items-center justify-center gap-1 shadow-sm"
                >
                  <MapPin size={12} className="text-primary" />
                  Get Live Directions
                </a>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              {/* Header and Write CTA */}
              <div className="flex justify-between items-center">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted-text">
                  Community Reviews
                </h4>
                <button
                  onClick={() => {
                    if (!user) {
                      setLoginSheetOpen(true);
                    } else {
                      setShowReviewModal(true);
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-primary hover:text-orange-600 transition-colors"
                >
                  <Plus size={13} />
                  Write a Review
                </button>
              </div>

              {/* Reviews List */}
              {reviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {reviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="bg-white border border-border/40 rounded-card p-4 flex flex-col gap-3 shadow-warm"
                    >
                      {/* Item and stars */}
                      <div className="flex justify-between items-start">
                        <h5 className="font-body text-sm font-extrabold text-foreground">
                          {review.item_name}
                        </h5>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={11} 
                              className={i < review.overall_rating ? "fill-[#B45309] stroke-none" : "text-border fill-none"} 
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-xs text-foreground/90 italic leading-relaxed font-semibold">
                        &ldquo;{highlightItemName(review.review_text, review.item_name)}&rdquo;
                      </p>

                      {/* Bottom Info & Voting */}
                      <div className="flex justify-between items-center mt-1 border-t border-border/20 pt-2">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={review.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                            alt={review.user_name} 
                            className="w-7 h-7 rounded-full object-cover border border-border"
                          />
                          <div className="flex flex-col items-start">
                            <span className="text-[10px] font-bold text-foreground leading-tight">
                              {review.user_name}
                            </span>
                            {review.is_chator ? (
                              <span className="inline-flex items-center gap-0.5 bg-[#FFF2E0] text-chator border border-[#FEE2C3] px-1 rounded-sm text-[8px] font-extrabold tracking-wider mt-0.5 leading-none">
                                चटोर
                              </span>
                            ) : (
                              <span className="text-[8px] text-muted-text font-bold tracking-wider leading-none">REGULAR</span>
                            )}
                          </div>
                        </div>

                        {/* Votes triggers */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReviewVote(review.id, 'agree')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              review.user_vote === 'agree'
                                ? 'bg-primary-container/10 border-primary-container text-primary-container'
                                : 'bg-surface-container-low border-border/30 text-muted-text hover:bg-surface-container/20'
                            }`}
                          >
                            <ThumbsUp size={11} className={review.user_vote === 'agree' ? 'fill-primary-container/20' : ''} />
                            <span>{review.agree_count || 0}</span>
                          </button>
                          <button
                            onClick={() => handleReviewVote(review.id, 'disagree')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                              review.user_vote === 'disagree'
                                ? 'bg-status-closed/10 border-status-closed/40 text-status-closed'
                                : 'bg-surface-container-low border-border/30 text-muted-text hover:bg-surface-container/20'
                            }`}
                          >
                            <ThumbsDown size={11} className={review.user_vote === 'disagree' ? 'fill-status-closed/20' : ''} />
                            <span>{review.disagree_count || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 bg-white border border-border/40 rounded-card shadow-warm flex flex-col gap-2 items-center select-none">
                  <span className="text-3xl">☕</span>
                  <h5 className="font-heading text-xs font-extrabold text-foreground">No reviews yet</h5>
                  <p className="text-[11px] text-muted-text max-w-[200px]">
                    Be the first one to recommend your favorite item here!
                  </p>
                  <button
                    onClick={() => {
                      if (!user) {
                        setLoginSheetOpen(true);
                      } else {
                        setShowReviewModal(true);
                      }
                    }}
                    className="mt-1.5 bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-btn shadow-sm hover:bg-orange-600 transition-colors"
                  >
                    Write First Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: CLAIMS */}
          {activeTab === 'claims' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              
              <div className="flex justify-between items-center">
                <h4 className="font-heading text-xs font-extrabold uppercase tracking-wider text-muted-text">
                  Crowdsourced Verifications
                </h4>
                <button
                  onClick={() => {
                    if (!user) {
                      setLoginSheetOpen(true);
                    } else {
                      setShowClaimModal(true);
                    }
                  }}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-status-closed hover:opacity-85 transition-colors"
                >
                  <AlertTriangle size={13} />
                  Report Issue
                </button>
              </div>

              {/* Claims List */}
              {claims.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {claims.map((claim) => (
                    <div 
                      key={claim.id}
                      className="bg-white border border-status-closed/20 rounded-card p-4 shadow-warm flex flex-col gap-2.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-status-closed" />
                        <span className="text-xs font-extrabold text-status-closed bg-status-closed/5 border border-status-closed/10 px-2 py-0.5 rounded-sm">
                          {getClaimLabel(claim.claim_type)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-foreground/90 font-semibold leading-relaxed">
                        {claim.description}
                      </p>

                      <div className="flex justify-between items-center border-t border-border/20 pt-2.5 mt-0.5">
                        <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider">
                          Verify this report:
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleClaimVote(claim.id, 'agree')}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-border/20 rounded-full text-[10px] font-bold text-muted-text hover:bg-primary-container/10 hover:text-primary-container transition-all"
                          >
                            <span>Agree</span>
                            <span className="bg-[#FFF2E0] text-chator px-1 rounded-sm font-extrabold">{claim.agree_count}</span>
                          </button>
                          <button
                            onClick={() => handleClaimVote(claim.id, 'disagree')}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-border/20 rounded-full text-[10px] font-bold text-muted-text hover:bg-status-closed/10 hover:text-status-closed transition-all"
                          >
                            <span>Disagree</span>
                            <span className="bg-red-50 text-status-closed px-1 rounded-sm font-extrabold">{claim.disagree_count}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-border/40 rounded-card p-5 text-center shadow-warm flex flex-col gap-2.5 items-center select-none">
                  <div className="w-9 h-9 rounded-full bg-status-open/10 border border-status-open/35 flex items-center justify-center text-status-open">
                    <Check size={18} />
                  </div>
                  <h5 className="font-heading text-xs font-extrabold text-foreground">Stall details verified</h5>
                  <p className="text-[11px] text-muted-text max-w-[220px]">
                    No active issues have been reported for this stall. Details are up to date!
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 8. Sticky CTA Direction Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-t border-border/40 p-4 shadow-[0_-8px_24px_rgba(44,24,16,0.06)]">
        <div className="max-w-md mx-auto">
          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full h-12 bg-primary-container hover:bg-primary active:scale-[0.98] hover:scale-[1.02] text-white rounded-btn shadow-md hover:shadow-lg text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            Take me there
            <span className="text-lg leading-none mt-[-1px] transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* 9. WRITE REVIEW MODAL SHEET */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 backdrop-blur-[2px] transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setShowReviewModal(false)}></div>
          
          <form 
            onSubmit={handleSubmitReview}
            className="relative z-10 w-full max-w-md bg-[#FFFBF5] border-t border-[#E8E0D5] rounded-t-[24px] shadow-2xl p-5 pb-8 max-h-[92vh] overflow-y-auto flex flex-col gap-4 text-[#2C1810] animate-in slide-in-from-bottom duration-250 font-body"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E8E0D5]/30 pb-3">
              {/* Left Close Button */}
              <button 
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1.5 rounded-full hover:bg-[#FFFBF5] text-[#2C1810]/75 transition-colors"
              >
                <X size={20} className="stroke-[2.5]" />
              </button>
              
              {/* Centered Brand Title */}
              <span 
                className="text-[#F47C2B] font-extrabold tracking-wide text-xl"
                style={{ fontFamily: 'Baloo 2, sans-serif' }}
              >
                Chaska
              </span>

              {/* Right User Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#F47C2B] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                  alt={user?.name || 'User'}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {reviewError && (
              <div className="bg-[#C62828]/5 border border-[#C62828]/25 text-[#C62828] text-xs rounded-card p-3 font-semibold">
                {reviewError}
              </div>
            )}

            {/* Inputs - What did you eat? */}
            <div className="flex flex-col gap-1 w-full border-b border-[#E8E0D5] pb-2 mt-2">
              <input
                type="text"
                required
                placeholder="What did you eat?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-transparent text-xl font-medium placeholder-[#C6B6A5] text-[#2C1810] focus:outline-none border-none font-heading"
                style={{ fontFamily: 'Baloo 2, sans-serif' }}
              />
            </div>

            {/* Overall Rating Selection */}
            <div className="flex items-center justify-center gap-2.5 py-2 w-full">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setOverallRating(star)}
                  className="p-1 focus:outline-none hover:scale-105 active:scale-95 transition-transform"
                >
                  <Star 
                    size={36} 
                    className={`transition-colors stroke-[1.5] ${
                      star <= overallRating 
                        ? 'fill-[#F47C2B] text-[#F47C2B]' 
                        : 'text-[#C6B6A5] fill-none'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Sub-Ratings Parameters */}
            <div className="bg-[#FAF2E8] border border-[#E8E0D5]/35 rounded-[20px] p-4 flex flex-col gap-1 shadow-sm">
              {[
                { label: 'Food', value: foodRating, setter: setFoodRating },
                { label: 'Service', value: serviceRating, setter: setServiceRating },
                { label: 'Cleanliness', value: cleanlinessRating, setter: setCleanlinessRating },
                { label: 'Value', value: valueRating, setter: setValueRating },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2 border-b border-[#E8E0D5]/20 last:border-b-0">
                  <span className="text-sm font-semibold text-[#2C1810]">{item.label}</span>
                  <div className="flex items-center gap-3">
                    {[
                      { val: 1, emoji: '😐' },
                      { val: 2, emoji: '😊' },
                      { val: 3, emoji: '😍' },
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => item.setter(opt.val)}
                        className={`w-9 h-9 rounded-full border text-base flex items-center justify-center transition-all duration-200 ${
                          item.value === opt.val
                            ? 'bg-[#F47C2B]/10 border-[#F47C2B] scale-105 shadow-sm'
                            : 'border-[#E8E0D5]/50 bg-white hover:bg-[#FFFBF5]'
                        }`}
                      >
                        {opt.emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Review Comment Textarea */}
            <div className="w-full">
              <textarea
                required
                rows={4}
                placeholder="Describe your experience..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full border border-[#E8E0D5] rounded-[16px] p-4 text-xs font-semibold focus:outline-none focus:border-[#F47C2B] resize-none bg-white placeholder-[#C6B6A5] text-[#2C1810] shadow-sm leading-relaxed"
              />
            </div>

            {/* Add Photos Section */}
            <div className="flex flex-col gap-2 w-full">
              <span className="text-[11px] font-bold text-[#6B6B6B]">Add Photos</span>
              
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {/* ADD BUTTON */}
                <button
                  type="button"
                  onClick={handleAddMockPhoto}
                  className="w-20 h-20 rounded-[16px] border border-dashed border-[#F47C2B]/35 bg-[#FFF0E2] hover:bg-[#FFE5CD] transition-colors flex flex-col items-center justify-center gap-1.5 flex-shrink-0"
                >
                  <div className="text-[#F47C2B] flex items-center justify-center relative">
                    <Camera size={20} className="stroke-[2]" />
                    <Plus size={10} className="absolute -bottom-1 -right-1 bg-[#FFF0E2] rounded-full stroke-[3]" />
                  </div>
                  <span className="text-[9px] font-extrabold text-[#F47C2B] tracking-wider uppercase">ADD</span>
                </button>

                {/* UPLOADED PHOTO THUMBNAILS */}
                {reviewPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-[16px] overflow-hidden border border-[#E8E0D5] flex-shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrl}
                      alt={`Review upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors border border-white/20"
                    >
                      <X size={10} className="stroke-[3]" />
                    </button>
                  </div>
                ))}

                {/* DOTTED PLACEHOLDERS FOR AESTHETICS */}
                {Array.from({ length: Math.max(0, 3 - reviewPhotos.length) }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className="w-20 h-20 rounded-[16px] border border-[#E8E0D5]/40 bg-white flex items-center justify-center text-[#C6B6A5]/55 flex-shrink-0"
                  >
                    <Image size={20} className="stroke-[1.5]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Post Review Action Button */}
            <button
              type="submit"
              disabled={submittingReview}
              className="group w-full h-12 bg-primary-container hover:bg-primary active:scale-[0.98] hover:scale-[1.02] text-white rounded-btn shadow-md hover:shadow-lg text-sm font-bold flex justify-center items-center gap-2 transition-all duration-200 mt-2"
            >
              {submittingReview ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <span>Post Review</span>
                  <Send size={13} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 mt-[-1px] ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 10. FILE CLAIM MODAL SHEET */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setShowClaimModal(false)}></div>
          
          <form 
            onSubmit={handleRaiseClaim}
            className="relative z-10 w-full max-w-md bg-white border-t border-border rounded-t-[24px] shadow-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col gap-4 text-foreground animate-in slide-in-from-bottom duration-250"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <h3 className="font-heading text-base font-bold text-foreground flex items-center gap-1.5">
                <AlertTriangle size={18} className="text-status-closed" />
                Report Stall Issue
              </h3>
              <button 
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="p-1 rounded-full hover:bg-surface-container-low text-muted-text transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {claimError && (
              <div className="bg-status-closed/5 border border-status-closed/20 text-status-closed text-xs rounded-card p-3 font-semibold">
                {claimError}
              </div>
            )}

            {/* Issue Select Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">
                Issue Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'does_not_exist', label: "Doesn't Exist" },
                  { id: 'relocated', label: "Stall Moved" },
                  { id: 'duplicate', label: "Duplicate Listing" },
                  { id: 'incorrect_info', label: "Incorrect Info" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setClaimType(opt.id)}
                    className={`py-2 px-3 border text-xs font-bold rounded-card transition-all text-left flex items-center justify-between ${
                      claimType === opt.id
                        ? 'bg-status-closed/5 border-status-closed/45 text-status-closed'
                        : 'border-border bg-white text-muted-text hover:bg-surface-container-low/30'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {claimType === opt.id && <span className="text-status-closed">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-text">
                Detail Description
              </label>
              <textarea
                required
                rows={4}
                placeholder="Please describe the issue in detail to help community moderators verify your report (e.g. 'This stall has relocated to opposite the railway station' or 'Closed down 2 weeks ago')."
                value={claimDescription}
                onChange={(e) => setClaimDescription(e.target.value)}
                className="border border-border rounded-card p-3 text-xs font-semibold focus:outline-none focus:border-status-closed resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClaimModal(false)}
                className="flex-1 py-3 border border-border rounded-btn text-xs font-bold hover:bg-surface-container-low text-muted-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingClaim}
                className="flex-1 py-3 bg-status-closed hover:bg-red-700 text-white rounded-btn text-xs font-bold shadow-sm transition-colors flex justify-center items-center gap-1.5"
              >
                {submittingClaim ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
