const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper for sending fetch requests with credentials (cookies)
async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`;
  
  // Set credentials for sending auth cookie
  options.credentials = 'include';
  
  // Set default headers
  if (options.body && !(options.body instanceof FormData)) {
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    let errMsg = 'Network request failed';
    try {
      const errData = await response.json();
      errMsg = errData.error || errMsg;
    } catch (e) {
      // ignore
    }
    throw new Error(errMsg);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  // Auth API
  sendOtp: (phone: string) => 
    request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }),

  verifyOtp: (phone: string, code: string) => 
    request('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    }),

  googleLogin: (email: string, name: string, avatarUrl?: string) => 
    request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ email, name, avatar_url: avatarUrl })
    }),

  logout: () => 
    request('/auth/logout', { method: 'POST' }),

  getCurrentUser: () => 
    request('/auth/me'),

  // Users API
  getUserProfile: (id: string) => 
    request(`/users/${id}`),

  updateUserProfile: (name?: string, avatarUrl?: string) => 
    request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ name, avatar_url: avatarUrl })
    }),

  getUserReviews: () => 
    request('/users/me/reviews'),

  getUserSavedPlaces: () => 
    request('/users/me/saved'),

  getUserChatorProgress: () => 
    request('/users/me/chator'),

  // Places API
  getPlaces: (filters: { category?: string; open_now?: boolean; sort?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.open_now) params.append('open_now', 'true');
    if (filters.sort) params.append('sort', filters.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/places${query}`);
  },

  getMapPlaces: () => 
    request('/places/map'),

  getPlaceDetails: (id: string) => 
    request(`/places/${id}`),

  addPlace: (data: {
    name: string;
    category: string;
    area: string;
    description?: string;
    lat: number;
    lng: number;
    maps_url?: string;
    shifts?: Array<{ day_type: string; shift_label?: string; opens_at: string; closes_at: string }>;
    cover_photo_url?: string;
  }) => 
    request('/places', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  editPlace: (id: string, data: any) => 
    request(`/places/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  getPlaceHours: (id: string) => 
    request(`/places/${id}/hours`),

  getPlacePhotos: (id: string) => 
    request(`/places/${id}/photos`),

  getPlaceReviews: (id: string) => 
    request(`/places/${id}/reviews`),

  getPlaceClaims: (id: string) => 
    request(`/places/${id}/claims`),

  // Reviews API
  writeReview: (placeId: string, data: {
    item_name: string;
    overall_rating: number;
    food_rating: number;
    service_rating: number;
    cleanliness_rating: number;
    value_rating: number;
    review_text: string;
    photo_urls?: string[];
  }) => 
    request(`/places/${placeId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteReview: (reviewId: string) => 
    request(`/reviews/${reviewId}`, { method: 'DELETE' }),

  getSingleReview: (reviewId: string) => 
    request(`/reviews/${reviewId}`),

  // Photos API
  uploadPlacePhoto: (placeId: string, photoUrl: string, isCover?: boolean) => 
    request(`/places/${placeId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ photo_url: photoUrl, is_cover: isCover })
    }),

  deletePhoto: (photoId: string) => 
    request(`/photos/${photoId}`, { method: 'DELETE' }),

  uploadReviewPhoto: (reviewId: string, photoUrl: string) => 
    request(`/reviews/${reviewId}/photos`, {
      method: 'POST',
      body: JSON.stringify({ photo_url: photoUrl })
    }),

  // Review Votes API
  castVote: (reviewId: string, vote: 'agree' | 'disagree') => 
    request(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote })
    }),

  removeVote: (reviewId: string) => 
    request(`/reviews/${reviewId}/vote`, { method: 'DELETE' }),

  // Claims API
  raiseClaim: (placeId: string, claimType: string, description: string) => 
    request(`/places/${placeId}/claims`, {
      method: 'POST',
      body: JSON.stringify({ claim_type: claimType, description })
    }),

  voteOnClaim: (claimId: string, vote: 'agree' | 'disagree') => 
    request(`/claims/${claimId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote })
    }),

  removeClaimVote: (claimId: string) => 
    request(`/claims/${claimId}/vote`, { method: 'DELETE' }),

  // Saved API
  savePlace: (placeId: string) => 
    request(`/saved/${placeId}`, { method: 'POST' }),

  unsavePlace: (placeId: string) => 
    request(`/saved/${placeId}`, { method: 'DELETE' }),
};
