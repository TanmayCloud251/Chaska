-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  avatar_url TEXT,
  is_chator BOOLEAN DEFAULT FALSE,
  chator_since TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Places Table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category VARCHAR(20) CHECK (category IN ('chai','coffee','snacks','cafe')),
  area TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  maps_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  added_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Place Hours Table (multiple shifts per place)
CREATE TABLE IF NOT EXISTS place_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  day_type VARCHAR(20) CHECK (day_type IN ('all_days','weekdays','weekends')),
  shift_label TEXT,
  opens_at TIME NOT NULL,
  closes_at TIME NOT NULL
);

-- Place Photos Table
CREATE TABLE IF NOT EXISTS place_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 3),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 3),
  cleanliness_rating INTEGER CHECK (cleanliness_rating BETWEEN 1 AND 3),
  value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 3),
  review_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Review Photos Table
CREATE TABLE IF NOT EXISTS review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Votes Table (agree/disagree on reviews)
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote VARCHAR(10) CHECK (vote IN ('agree','disagree')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  raised_by UUID REFERENCES users(id) ON DELETE SET NULL,
  claim_type VARCHAR(30) CHECK (claim_type IN ('does_not_exist','relocated','duplicate','incorrect_info')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','resolved','expired')),
  agree_count INTEGER DEFAULT 0,
  disagree_count INTEGER DEFAULT 0,
  chator_agree_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Claim Votes Table
CREATE TABLE IF NOT EXISTS claim_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote VARCHAR(10) CHECK (vote IN ('agree','disagree')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(claim_id, user_id)
);

-- Saved Places Table
CREATE TABLE IF NOT EXISTS saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, place_id)
);
