# Chaska Project Roadmap & Progress Memory

This document tracks completed screens, implemented features, and upcoming roadmap screens for the Chaska application.

## Implemented Screens & Features

### 1. 📋 Feed Screen (Home)
- **Overview**: The main listing page for discovering food stalls and cafés in Rajnandgaon.
- **Key Features**:
  - **Category Pills**: Quick filtering by Chai, Snacks, Café, and Smoking Allowed.
  - **Advanced Filters**: Modal drawer supporting sorting (Rating, Recent, Popular), operational status toggling (Open Now), and budget limit ranges (Max ₹30, ₹50, or ₹100).
  - **Text Search**: Real-time searching by stall name or neighborhood.
  - **Feed Cards**: Layout showing rating values, cover photos, price levels, and top review snippets.

### 2. 🏠 Shop Details Screen (`/place/[id]`)
- **Overview**: A detailed review and metadata dashboard for individual stalls.
- **Key Features**:
  - **Banner Carousel**: Multi-photo slider showing stall snapshots.
  - **Metadata Summary**: Live rating scores, open/closed flags, and location tags.
  - **Score Breakdown**: Multi-dimensional averages for Food, Service, Cleanliness, and Value.
  - **Tab Navigator**: Dynamic toggles between overview, reviews, and community moderation claims.
  - **Interactive Feedback**: Upvoting/downvoting reviews with validation counters.

### 3. ✍️ Write a Review Screen (Modal)
- **Overview**: A highly visual, emoji-driven review writer matching Chaska's warm terracotta palette.
- **Key Features**:
  - **Underlined Input**: A borderless name input field ("What did you eat?").
  - **5-Star Bar**: An overall rating selector.
  - **Emoji Sub-Ratings**: Multi-dimensional selectors utilizing custom emojis:
    - 😐 (value 1)
    - 😊 (value 2)
    - 😍 (value 3)
  - **Photo Carousel**: A scroll bar where clicking "ADD" cycles mock street food uploads, alongside active previews with close handlers for deleting photos.
  - **Send Trigger**: A full-width orange action button with paper plane decorations.

### 4. 🗺️ Map Screen (`/map`)
- **Overview**: Geospatial exploration interface using Leaflet + OpenStreetMap.
- **Key Features**:
  - **Vintage Theme**: Styled OSM map tiles using sepia and contrast filters.
  - **Custom Markers**: CSS-based teardrop markers carrying category specific icons (🍵, ☕, 🍽️, 🏠).
  - **Dynamic Recenter**: Smoothly centers and zooms to place coordinates on select.
  - **Sync Filter Overlay**: Floating pill bar that filters active map markers on the fly.
  - **Details Drawer**: Slide-up bottom sheet showing selected vendor summaries.

---

## Roadmap: Remaining Screens

### 1. ➕ Add a Place Screen (`/add-place`)
- **Description**: Form allowing users to add new street stalls or dining joints.
- **Features Needed**: Location coordinates picker (map tap integration), shift scheduler component, cover photo URL handler, and categories tag selector.

### 2. 🔐 Auth Screen / Flow
- **Description**: Standardizing user login status.
- **Features Needed**: OTP send and verify form simulation, Google login workflow hooks, and session checks.

### 3. 👤 Profile Screen (`/profile`)
- **Description**: User profile, saved bookmarks, and statistics.
- **Features Needed**: Written reviews index, saved/favorited list, avatar update, and चटोर (Chator) progression metrics.
