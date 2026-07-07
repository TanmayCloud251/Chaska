import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Seed data from prompt
const SEED_PLACES = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Sharma Ji Ki Tapri",
    category: "chai",
    area: "Cinema Square, Main Road",
    description: "Famous kulhad chai and freshly made bun-muska. The ultimate hangout spot for students and tea lovers.",
    lat: 21.0972,
    lng: 81.0354,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0972,81.0354",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹₹",
    avg_price: 50
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Bikaner Sweets & Snacks",
    category: "snacks",
    area: "Bus Stand Market",
    description: "Crispy hot samosas served with their signature spicy green chutney and sweet tamarind chutney.",
    lat: 21.0956,
    lng: 81.0341,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0956,81.0341",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹",
    avg_price: 40
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Café Chaska Corner",
    category: "cafe",
    area: "Model Town, East Gate",
    description: "Modern cafe with artisanal coffee, sandwiches, and a great workspace vibe.",
    lat: 21.0981,
    lng: 81.0368,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0981,81.0368",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹",
    avg_price: 30
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    name: "Laxmi Fast Food Corner",
    category: "snacks",
    area: "Circular Road",
    description: "Quick, tasty, and budget-friendly street snacks, momos, and manchurian.",
    lat: 21.0963,
    lng: 81.0378,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0963,81.0378",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹₹",
    avg_price: 60
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    name: "Chhattisgarhi Tadka Dhaba",
    category: "snacks",
    area: "Digvijay Nagar",
    description: "Authentic local Chhattisgarhi flavors and fast snacks. Try the special chana chaat.",
    lat: 21.0948,
    lng: 81.0325,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0948,81.0325",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹",
    avg_price: 25
  },
  {
    id: "66666666-6666-6666-6666-666666666666",
    name: "Sunrise Poha House",
    category: "snacks",
    area: "Telipara",
    description: "Steam poha loaded with sev, pomegranate, and paired with hot jalebis. Best morning breakfast place.",
    lat: 21.0989,
    lng: 81.0362,
    maps_url: "https://www.google.com/maps/dir/?api=1&destination=21.0989,81.0362",
    is_verified: true,
    added_by: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    price_range: "₹",
    avg_price: 15
  }
];


const SEED_USERS = [
  {
    id: "99999999-9999-9999-9999-999999999999",
    name: "Aman Sahu",
    phone: "+919876543210",
    email: "aman.sahu@chaska.in",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    is_chator: true,
    chator_since: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "88888888-8888-8888-8888-888888888888",
    name: "Priya Dewangan",
    phone: "+918888888888",
    email: "priya.d@chaska.in",
    avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    is_chator: false,
    chator_since: null,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_HOURS = [
  // Sharma Ji ki Chai: 06:00 - 11:30 and 16:00 - 22:00
  {
    id: "h1",
    place_id: "11111111-1111-1111-1111-111111111111",
    day_type: "all_days",
    shift_label: "Morning Tea",
    opens_at: "06:00",
    closes_at: "11:30"
  },
  {
    id: "h2",
    place_id: "11111111-1111-1111-1111-111111111111",
    day_type: "all_days",
    shift_label: "Evening Hangout",
    opens_at: "16:00",
    closes_at: "22:00"
  },
  // Baba Samosa Wala: 12:00 - 21:00
  {
    id: "h3",
    place_id: "22222222-2222-2222-2222-222222222222",
    day_type: "all_days",
    shift_label: "Lunch & Snacks",
    opens_at: "12:00",
    closes_at: "21:00"
  },
  // The Café Hub: 10:00 - 23:00
  {
    id: "h4",
    place_id: "33333333-3333-3333-3333-333333333333",
    day_type: "all_days",
    shift_label: "Full Day Vibe",
    opens_at: "10:00",
    closes_at: "23:00"
  },
  // Laxmi Fast Food: 15:00 - 22:30
  {
    id: "h5",
    place_id: "44444444-4444-4444-4444-444444444444",
    day_type: "all_days",
    shift_label: "Evening Fast Food",
    opens_at: "15:00",
    closes_at: "22:30"
  },
  // Chhattisgarhi Tadka Dhaba: 11:00 - 23:00
  {
    id: "h6",
    place_id: "55555555-5555-5555-5555-555555555555",
    day_type: "all_days",
    shift_label: "All Day",
    opens_at: "11:00",
    closes_at: "23:00"
  },
  // Sunrise Poha House: 06:00 - 12:00
  {
    id: "h7",
    place_id: "66666666-6666-6666-6666-666666666666",
    day_type: "all_days",
    shift_label: "Breakfast Hours",
    opens_at: "06:00",
    closes_at: "12:00"
  }
];

const SEED_PHOTOS = [
  {
    id: "p1",
    place_id: "11111111-1111-1111-1111-111111111111",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  },
  {
    id: "p2",
    place_id: "22222222-2222-2222-2222-222222222222",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  },
  {
    id: "p3",
    place_id: "33333333-3333-3333-3333-333333333333",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  },
  {
    id: "p4",
    place_id: "44444444-4444-4444-4444-444444444444",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  },
  {
    id: "p5",
    place_id: "55555555-5555-5555-5555-555555555555",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  },
  {
    id: "p6",
    place_id: "66666666-6666-6666-6666-666666666666",
    uploaded_by: "99999999-9999-9999-9999-999999999999",
    photo_url: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=800",
    is_cover: true,
    created_at: new Date().toISOString()
  }
];

const SEED_REVIEWS = [
  // Sharma Ji Ki Tapri (11111111-1111-1111-1111-111111111111): target rating 4.8. (5, 5, 5, 5, 4)
  {
    id: "r1",
    place_id: "11111111-1111-1111-1111-111111111111",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Masala Chai",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "The Masala Chai here is the best in the city, never disappoints after a long day.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r1_2",
    place_id: "11111111-1111-1111-1111-111111111111",
    user_id: "88888888-8888-8888-8888-888888888888",
    item_name: "Bun Maska",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Soft bun and perfectly paired tea.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r1_3",
    place_id: "11111111-1111-1111-1111-111111111111",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Adrak Chai",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Lovely spice mix.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r1_4",
    place_id: "11111111-1111-1111-1111-111111111111",
    user_id: "88888888-8888-8888-8888-888888888888",
    item_name: "Samosa",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Very crispy.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r1_5",
    place_id: "11111111-1111-1111-1111-111111111111",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Ginger Chai",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 2,
    review_text: "Good tea.",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Bikaner Sweets & Snacks (22222222-2222-2222-2222-222222222222): target rating 4.2. (5, 4, 4, 4, 4)
  {
    id: "r2",
    place_id: "22222222-2222-2222-2222-222222222222",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Kachori",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Best Kachori and sweet chai combo in town. Always fresh.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r2_2",
    place_id: "22222222-2222-2222-2222-222222222222",
    user_id: "88888888-8888-8888-8888-888888888888",
    item_name: "Samosa",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Samosas are quite crispy and fresh.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r2_3",
    place_id: "22222222-2222-2222-2222-222222222222",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Jalebi",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Jalebi is hot and sweet.",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r2_4",
    place_id: "22222222-2222-2222-2222-222222222222",
    user_id: "88888888-8888-8888-8888-888888888888",
    item_name: "Dhokla",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 3,
    review_text: "Dhokla is soft.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r2_5",
    place_id: "22222222-2222-2222-2222-222222222222",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Chai",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 2,
    review_text: "Good chai overall.",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Café Chaska Corner (33333333-3333-3333-3333-333333333333): target rating 4.5. (5, 4)
  {
    id: "r3",
    place_id: "33333333-3333-3333-3333-333333333333",
    user_id: "88888888-8888-8888-8888-888888888888",
    item_name: "Elaichi Chai",
    overall_rating: 5,
    food_rating: 3,
    service_rating: 3,
    cleanliness_rating: 3,
    value_rating: 3,
    review_text: "Love the vibe and the Elaichi Chai. Great spot for catching up with friends.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "r3_2",
    place_id: "33333333-3333-3333-3333-333333333333",
    user_id: "99999999-9999-9999-9999-999999999999",
    item_name: "Cold Coffee",
    overall_rating: 4,
    food_rating: 2,
    service_rating: 2,
    cleanliness_rating: 2,
    value_rating: 2,
    review_text: "Nice place, cold coffee was good.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SEED_VOTES = [
  {
    id: "v1",
    review_id: "r1",
    user_id: "88888888-8888-8888-8888-888888888888",
    vote: "agree",
    created_at: new Date().toISOString()
  },
  {
    id: "v2",
    review_id: "r2",
    user_id: "88888888-8888-8888-8888-888888888888",
    vote: "agree",
    created_at: new Date().toISOString()
  },
  {
    id: "v3",
    review_id: "r3",
    user_id: "99999999-9999-9999-9999-999999999999",
    vote: "agree",
    created_at: new Date().toISOString()
  }
];

const MOCK_DB_FILE = path.join(__dirname, '..', '..', 'db_mock.json');

// Interface definition for client
export interface DbClient {
  query(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }>;
}

let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
}

// In-Memory Mock Database Store
interface MockStore {
  users: any[];
  places: any[];
  place_hours: any[];
  place_photos: any[];
  reviews: any[];
  review_photos: any[];
  votes: any[];
  claims: any[];
  claim_votes: any[];
  saved_places: any[];
}

function loadMockData(): MockStore {
  if (fs.existsSync(MOCK_DB_FILE)) {
    try {
      const content = fs.readFileSync(MOCK_DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to read mock db file, resetting", e);
    }
  }

  const initialStore: MockStore = {
    users: SEED_USERS,
    places: SEED_PLACES,
    place_hours: SEED_HOURS,
    place_photos: SEED_PHOTOS,
    reviews: SEED_REVIEWS,
    review_photos: [],
    votes: SEED_VOTES,
    claims: [],
    claim_votes: [],
    saved_places: []
  };

  saveMockData(initialStore);
  return initialStore;
}

function saveMockData(store: MockStore) {
  try {
    fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to save mock DB file", e);
  }
}

// Simple SQL simulator
function simulateQuery(text: string, params: any[] = []): { rows: any[]; rowCount: number } {
  const store = loadMockData();
  const normalizedSql = text.replace(/\s+/g, ' ').trim().toLowerCase();

  // Helper function to substitute variables $1, $2 etc.
  const getParam = (placeholder: string) => {
    const match = placeholder.match(/\$(\d+)/);
    if (!match) return null;
    const index = parseInt(match[1], 10) - 1;
    return params[index];
  };

  // 1. SELECT * FROM users WHERE phone = $1
  if (normalizedSql.startsWith("select * from users where phone =")) {
    const phoneVal = params[0];
    const user = store.users.find(u => u.phone === phoneVal);
    const rows = user ? [user] : [];
    return { rows, rowCount: rows.length };
  }

  // SELECT * FROM users WHERE email = $1
  if (normalizedSql.startsWith("select * from users where email =")) {
    const emailVal = params[0];
    const user = store.users.find(u => u.email === emailVal);
    const rows = user ? [user] : [];
    return { rows, rowCount: rows.length };
  }

  // SELECT * FROM users WHERE id = $1
  if (normalizedSql.startsWith("select * from users where id =")) {
    const idVal = params[0];
    const user = store.users.find(u => u.id === idVal);
    const rows = user ? [user] : [];
    return { rows, rowCount: rows.length };
  }

  // INSERT INTO users (name, phone, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *
  if (normalizedSql.startsWith("insert into users")) {
    const newUser = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `u-${Math.random().toString(36).substr(2, 9)}`,
      name: params[0] || null,
      phone: params[1] || null,
      email: params[2] || null,
      avatar_url: params[3] || null,
      is_chator: false,
      chator_since: null,
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveMockData(store);
    return { rows: [newUser], rowCount: 1 };
  }

  // UPDATE users SET name = $1, avatar_url = $2 WHERE id = $3 RETURNING *
  if (normalizedSql.startsWith("update users set name")) {
    const index = store.users.findIndex(u => u.id === params[2]);
    if (index !== -1) {
      store.users[index].name = params[0];
      store.users[index].avatar_url = params[1];
      saveMockData(store);
      return { rows: [store.users[index]], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // SELECT for map cover photo and rating
  if (normalizedSql.includes("select (select photo_url from place_photos")) {
    const placeId = params[0];
    const place = store.places.find(p => p.id === placeId);
    const reviews = store.reviews.filter(r => r.place_id === placeId);
    const avg_rating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)
      : "0.0";
    const review_count = reviews.length;
    const coverPhotoObj = store.place_photos.find(photo => photo.place_id === placeId && photo.is_cover);
    const cover_photo = coverPhotoObj ? coverPhotoObj.photo_url : null;
    return {
      rows: [{
        cover_photo,
        avg_rating,
        review_count,
        area: place ? place.area : ""
      }],
      rowCount: 1
    };
  }

  // SELECT places from saved_places
  if (normalizedSql.includes("from saved_places")) {
    const userId = params[0];
    const saved = store.saved_places.filter(s => s.user_id === userId);
    const decoratePlace = (p: any) => {
      if (!p) return p;
      const reviews = store.reviews.filter(r => r.place_id === p.id);
      const avg_rating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)
        : "0.0";
      const review_count = reviews.length;
      const coverPhotoObj = store.place_photos.find(photo => photo.place_id === p.id && photo.is_cover);
      const cover_photo = coverPhotoObj ? coverPhotoObj.photo_url : null;
      return {
        ...p,
        avg_rating,
        review_count,
        cover_photo
      };
    };
    const rows = saved.map(s => {
      const p = store.places.find(place => place.id === s.place_id);
      return decoratePlace(p);
    }).filter(x => x !== undefined && x !== null);
    return { rows, rowCount: rows.length };
  }

  // SELECT * FROM places (all places)
  if (normalizedSql.startsWith("select * from places") || normalizedSql.startsWith("select p.*")) {
    const decoratePlace = (p: any) => {
      if (!p) return p;
      const reviews = store.reviews.filter(r => r.place_id === p.id);
      const avg_rating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.overall_rating, 0) / reviews.length).toFixed(1)
        : "0.0";
      const review_count = reviews.length;
      const coverPhotoObj = store.place_photos.find(photo => photo.place_id === p.id && photo.is_cover);
      const cover_photo = coverPhotoObj ? coverPhotoObj.photo_url : null;
      return {
        ...p,
        avg_rating,
        review_count,
        cover_photo
      };
    };

    // If getting single place, e.g. "where id = $1"
    if (normalizedSql.includes("where id = $1") || normalizedSql.includes("where id =")) {
      const idVal = params[0];
      const place = store.places.find(p => p.id === idVal);
      const rows = place ? [decoratePlace(place)] : [];
      return { rows, rowCount: rows.length };
    }
    // Return all places with filter checks inside route handler, or return general list
    const decoratedPlaces = store.places.map(p => decoratePlace(p));
    return { rows: decoratedPlaces, rowCount: decoratedPlaces.length };
  }

  // SELECT * FROM place_hours
  if (normalizedSql.startsWith("select * from place_hours")) {
    if (normalizedSql.includes("where place_id = $1") || normalizedSql.includes("where place_id =")) {
      const placeId = params[0];
      const shifts = store.place_hours.filter(h => h.place_id === placeId);
      return { rows: shifts, rowCount: shifts.length };
    }
    return { rows: store.place_hours, rowCount: store.place_hours.length };
  }

  // SELECT * FROM place_photos
  if (normalizedSql.startsWith("select * from place_photos")) {
    if (normalizedSql.includes("where place_id = $1") || normalizedSql.includes("where place_id =")) {
      const placeId = params[0];
      const photos = store.place_photos.filter(p => p.place_id === placeId);
      return { rows: photos, rowCount: photos.length };
    }
    return { rows: store.place_photos, rowCount: store.place_photos.length };
  }

  // SELECT * FROM reviews
  if (normalizedSql.startsWith("select * from reviews") || normalizedSql.includes("from reviews")) {
    if (normalizedSql.includes("where place_id = $1") || normalizedSql.includes("where place_id =")) {
      const placeId = params[0];
      let reviews = store.reviews.filter(r => r.place_id === placeId);
      // Join mock user info
      reviews = reviews.map(r => {
        const u = store.users.find(user => user.id === r.user_id);
        return {
          ...r,
          user_name: u ? u.name : 'Unknown User',
          user_avatar: u ? u.avatar_url : null,
          is_chator: u ? u.is_chator : false
        };
      });
      return { rows: reviews, rowCount: reviews.length };
    }
    if (normalizedSql.includes("where user_id = $1")) {
      const userId = params[0];
      const reviews = store.reviews.filter(r => r.user_id === userId);
      return { rows: reviews, rowCount: reviews.length };
    }
    if (normalizedSql.includes("where id = $1")) {
      const reviewId = params[0];
      const r = store.reviews.find(rev => rev.id === reviewId);
      return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
    }
    return { rows: store.reviews, rowCount: store.reviews.length };
  }

  // INSERT INTO places
  if (normalizedSql.startsWith("insert into places")) {
    const newPlace = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `p-${Math.random().toString(36).substr(2, 9)}`,
      name: params[0],
      category: params[1],
      area: params[2],
      description: params[3] || null,
      lat: parseFloat(params[4]),
      lng: parseFloat(params[5]),
      maps_url: params[6] || `https://www.google.com/maps/dir/?api=1&destination=${params[4]},${params[5]}`,
      is_verified: false,
      added_by: params[7] || null,
      created_at: new Date().toISOString()
    };
    store.places.push(newPlace);
    saveMockData(store);
    return { rows: [newPlace], rowCount: 1 };
  }

  // INSERT INTO place_hours
  if (normalizedSql.startsWith("insert into place_hours")) {
    const newHour = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `h-${Math.random().toString(36).substr(2, 9)}`,
      place_id: params[0],
      day_type: params[1],
      shift_label: params[2] || null,
      opens_at: params[3],
      closes_at: params[4]
    };
    store.place_hours.push(newHour);
    saveMockData(store);
    return { rows: [newHour], rowCount: 1 };
  }

  // INSERT INTO reviews
  if (normalizedSql.startsWith("insert into reviews")) {
    const newReview = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `r-${Math.random().toString(36).substr(2, 9)}`,
      place_id: params[0],
      user_id: params[1],
      item_name: params[2],
      overall_rating: parseInt(params[3], 10),
      food_rating: parseInt(params[4], 10),
      service_rating: parseInt(params[5], 10),
      cleanliness_rating: parseInt(params[6], 10),
      value_rating: parseInt(params[7], 10),
      review_text: params[8],
      created_at: new Date().toISOString()
    };
    store.reviews.push(newReview);
    saveMockData(store);
    return { rows: [newReview], rowCount: 1 };
  }

  // DELETE FROM reviews WHERE id = $1 AND user_id = $2
  if (normalizedSql.startsWith("delete from reviews")) {
    const reviewId = params[0];
    const userId = params[1];
    const lenBefore = store.reviews.length;
    store.reviews = store.reviews.filter(r => !(r.id === reviewId && r.user_id === userId));
    saveMockData(store);
    return { rows: [], rowCount: lenBefore - store.reviews.length };
  }

  // SELECT * FROM votes WHERE review_id = $1 AND user_id = $2
  if (normalizedSql.startsWith("select * from votes")) {
    if (normalizedSql.includes("review_id = $1 and user_id = $2")) {
      const v = store.votes.find(vote => vote.review_id === params[0] && vote.user_id === params[1]);
      return { rows: v ? [v] : [], rowCount: v ? 1 : 0 };
    }
    if (normalizedSql.includes("where review_id = $1")) {
      const reviewId = params[0];
      const votes = store.votes.filter(vote => vote.review_id === reviewId);
      return { rows: votes, rowCount: votes.length };
    }
  }

  // INSERT INTO votes (review_id, user_id, vote) VALUES ($1, $2, $3) ON CONFLICT ...
  if (normalizedSql.startsWith("insert into votes")) {
    const reviewId = params[0];
    const userId = params[1];
    const voteType = params[2];

    const idx = store.votes.findIndex(v => v.review_id === reviewId && v.user_id === userId);
    const newVote = {
      id: idx !== -1 ? store.votes[idx].id : (crypto?.randomUUID ? crypto.randomUUID() : `v-${Math.random().toString(36).substr(2, 9)}`),
      review_id: reviewId,
      user_id: userId,
      vote: voteType,
      created_at: new Date().toISOString()
    };

    if (idx !== -1) {
      store.votes[idx] = newVote;
    } else {
      store.votes.push(newVote);
    }
    saveMockData(store);
    return { rows: [newVote], rowCount: 1 };
  }

  // DELETE FROM votes WHERE review_id = $1 AND user_id = $2
  if (normalizedSql.startsWith("delete from votes")) {
    const reviewId = params[0];
    const userId = params[1];
    const lenBefore = store.votes.length;
    store.votes = store.votes.filter(v => !(v.review_id === reviewId && v.user_id === userId));
    saveMockData(store);
    return { rows: [], rowCount: lenBefore - store.votes.length };
  }

  // SELECT * FROM saved_places
  if (normalizedSql.startsWith("select * from saved_places")) {
    if (normalizedSql.includes("where user_id = $1")) {
      const saved = store.saved_places.filter(s => s.user_id === params[0]);
      return { rows: saved, rowCount: saved.length };
    }
  }

  // INSERT INTO saved_places
  if (normalizedSql.startsWith("insert into saved_places")) {
    const userId = params[0];
    const placeId = params[1];
    const alreadySaved = store.saved_places.some(s => s.user_id === userId && s.place_id === placeId);
    if (!alreadySaved) {
      const newSaved = {
        id: crypto?.randomUUID ? crypto.randomUUID() : `s-${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        place_id: placeId,
        created_at: new Date().toISOString()
      };
      store.saved_places.push(newSaved);
      saveMockData(store);
      return { rows: [newSaved], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // DELETE FROM saved_places
  if (normalizedSql.startsWith("delete from saved_places")) {
    const userId = params[0];
    const placeId = params[1];
    const lenBefore = store.saved_places.length;
    store.saved_places = store.saved_places.filter(s => !(s.user_id === userId && s.place_id === placeId));
    saveMockData(store);
    return { rows: [], rowCount: lenBefore - store.saved_places.length };
  }

  // SELECT * FROM claims
  if (normalizedSql.startsWith("select * from claims")) {
    if (normalizedSql.includes("where place_id = $1")) {
      const claims = store.claims.filter(c => c.place_id === params[0]);
      return { rows: claims, rowCount: claims.length };
    }
    if (normalizedSql.includes("where id = $1")) {
      const claim = store.claims.find(c => c.id === params[0]);
      return { rows: claim ? [claim] : [], rowCount: claim ? 1 : 0 };
    }
  }

  // INSERT INTO claims
  if (normalizedSql.startsWith("insert into claims")) {
    const newClaim = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `c-${Math.random().toString(36).substr(2, 9)}`,
      place_id: params[0],
      raised_by: params[1],
      claim_type: params[2],
      description: params[3],
      status: 'open',
      agree_count: 0,
      disagree_count: 0,
      chator_agree_count: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    store.claims.push(newClaim);
    saveMockData(store);
    return { rows: [newClaim], rowCount: 1 };
  }

  // INSERT INTO claim_votes
  if (normalizedSql.startsWith("insert into claim_votes")) {
    const claimId = params[0];
    const userId = params[1];
    const voteType = params[2];

    const idx = store.claim_votes.findIndex(v => v.claim_id === claimId && v.user_id === userId);
    const newVote = {
      id: idx !== -1 ? store.claim_votes[idx].id : (crypto?.randomUUID ? crypto.randomUUID() : `cv-${Math.random().toString(36).substr(2, 9)}`),
      claim_id: claimId,
      user_id: userId,
      vote: voteType,
      created_at: new Date().toISOString()
    };

    if (idx !== -1) {
      store.claim_votes[idx] = newVote;
    } else {
      store.claim_votes.push(newVote);
    }
    saveMockData(store);
    return { rows: [newVote], rowCount: 1 };
  }

  // DELETE FROM claim_votes
  if (normalizedSql.startsWith("delete from claim_votes")) {
    const claimId = params[0];
    const userId = params[1];
    const lenBefore = store.claim_votes.length;
    store.claim_votes = store.claim_votes.filter(v => !(v.claim_id === claimId && v.user_id === userId));
    saveMockData(store);
    return { rows: [], rowCount: lenBefore - store.claim_votes.length };
  }

  // SELECT COUNT(*) ... from votes / reviews
  if (normalizedSql.includes("count(*)") || normalizedSql.includes("count(1)")) {
    if (normalizedSql.includes("from reviews r") && normalizedSql.includes("is_chator")) {
      // चटोर checks
      const userId = params[0];
      const userReviews = store.reviews.filter(r => r.user_id === userId);
      let count = 0;
      for (const r of userReviews) {
        const agrees = store.votes.filter(v => v.review_id === r.id && v.vote === 'agree').length;
        if (agrees >= 10) count++;
      }
      return { rows: [{ count: count.toString() }], rowCount: 1 };
    }
  }

  // UPDATE claims
  if (normalizedSql.startsWith("update claims")) {
    if (normalizedSql.includes("set status = $1")) {
      const idx = store.claims.findIndex(c => c.id === params[1]);
      if (idx !== -1) {
        store.claims[idx].status = params[0];
        saveMockData(store);
        return { rows: [store.claims[idx]], rowCount: 1 };
      }
    } else if (normalizedSql.includes("agree_count =") || normalizedSql.includes("disagree_count =")) {
      const idx = store.claims.findIndex(c => c.id === params[3]);
      if (idx !== -1) {
        store.claims[idx].agree_count = params[0];
        store.claims[idx].disagree_count = params[1];
        store.claims[idx].chator_agree_count = params[2];
        saveMockData(store);
        return { rows: [store.claims[idx]], rowCount: 1 };
      }
    }
  }

  // INSERT INTO place_photos
  if (normalizedSql.startsWith("insert into place_photos")) {
    const newPhoto = {
      id: crypto?.randomUUID ? crypto.randomUUID() : `p-${Math.random().toString(36).substr(2, 9)}`,
      place_id: params[0],
      uploaded_by: params[1],
      photo_url: params[2],
      is_cover: params[3] === true || params[3] === 'true',
      created_at: new Date().toISOString()
    };
    store.place_photos.push(newPhoto);
    saveMockData(store);
    return { rows: [newPhoto], rowCount: 1 };
  }

  // Default fallback empty rows
  return { rows: [], rowCount: 0 };
}

export const db: DbClient = {
  query: async (text: string, params?: any[]) => {
    if (pool) {
      const res = await pool.query(text, params);
      return { rows: res.rows, rowCount: res.rowCount ?? 0 };
    } else {
      // Simulate slow DB response to test UI loading states
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(simulateQuery(text, params));
        }, 80);
      });
    }
  }
};
