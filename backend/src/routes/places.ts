import { Router, Request, Response } from 'express';
import { db } from '../db/client';
import { requireAuth, optionalAuth } from '../middleware/auth';

const router = Router();

// IST Time Helper to determine Open/Closed status
export function getIstDateTime() {
  const utcDate = new Date();
  // Adjust to IST (UTC + 5:30)
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
  
  const hours = String(istDate.getUTCHours()).padStart(2, '0');
  const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
  
  const day = istDate.getUTCDay(); // 0 is Sunday, 1-5 is weekdays, 6 is Saturday
  return {
    timeStr: `${hours}:${minutes}:${seconds}`,
    day
  };
}

export function isPlaceOpen(shifts: any[]): boolean {
  if (!shifts || shifts.length === 0) return false;
  
  const { timeStr, day } = getIstDateTime();
  const isWeekend = (day === 0 || day === 6);

  for (const shift of shifts) {
    // Check if day type matches
    let dayMatch = false;
    if (shift.day_type === 'all_days') {
      dayMatch = true;
    } else if (shift.day_type === 'weekdays' && !isWeekend) {
      dayMatch = true;
    } else if (shift.day_type === 'weekends' && isWeekend) {
      dayMatch = true;
    }

    if (!dayMatch) continue;

    const opens = shift.opens_at;
    const closes = shift.closes_at;

    // Support shifts that cross midnight (e.g. 18:00 - 02:00)
    if (opens < closes) {
      if (timeStr >= opens && timeStr <= closes) {
        return true;
      }
    } else { // crosses midnight
      if (timeStr >= opens || timeStr <= closes) {
        return true;
      }
    }
  }

  return false;
}

/**
 * GET /api/places
 * Query parameters:
 * - category: chai | coffee | snacks | cafe
 * - open_now: true | false
 * - sort: rating | recent | most_reviewed
 */
router.get('/', optionalAuth, async (req: any, res: Response) => {
  const { category, open_now, sort } = req.query;

  try {
    // Build SQL Query
    let queryText = `
      SELECT p.*,
        (SELECT photo_url FROM place_photos WHERE place_id = p.id AND is_cover = TRUE LIMIT 1) as cover_photo,
        (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE place_id = p.id) as avg_rating,
        (SELECT COUNT(*) FROM reviews WHERE place_id = p.id) as review_count
      FROM places p
      WHERE 1=1
    `;
    const queryParams: any[] = [];

    if (category) {
      queryParams.push(category);
      queryText += ` AND p.category = $${queryParams.length}`;
    }

    const placesRes = await db.query(queryText, queryParams);
    let places = placesRes.rows;

    // Fetch shifts for each place to compute open/closed status
    for (let place of places) {
      const shiftsRes = await db.query(`SELECT * FROM place_hours WHERE place_id = $1`, [place.id]);
      place.is_open = isPlaceOpen(shiftsRes.rows);

      // Fetch top review (highest agree count)
      const topReviewRes = await db.query(
        `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar, u.is_chator,
           (SELECT COUNT(*) FROM votes v WHERE v.review_id = r.id AND v.vote = 'agree') as agree_count
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.place_id = $1
         ORDER BY agree_count DESC
         LIMIT 1`,
        [place.id]
      );
      place.top_review = topReviewRes.rows[0] || null;

      // Check if saved by current user
      if (req.user) {
        const savedRes = await db.query(
          `SELECT 1 FROM saved_places WHERE user_id = $1 AND place_id = $2`,
          [req.user.id, place.id]
        );
        place.is_saved = savedRes.rowCount > 0;
      } else {
        place.is_saved = false;
      }
    }

    // Filter by open_now if true
    if (open_now === 'true') {
      places = places.filter(p => p.is_open);
    }

    // Sort
    if (sort === 'rating') {
      places.sort((a, b) => parseFloat(b.avg_rating) - parseFloat(a.avg_rating));
    } else if (sort === 'recent') {
      places.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'most_reviewed') {
      places.sort((a, b) => b.review_count - a.review_count);
    }

    return res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/places/map
 * Lightweight list for map pins
 */
router.get('/map', async (req: Request, res: Response) => {
  try {
    const placesRes = await db.query(`SELECT id, name, category, lat, lng, is_verified FROM places`);
    const places = placesRes.rows;

    for (let place of places) {
      const shiftsRes = await db.query(`SELECT * FROM place_hours WHERE place_id = $1`, [place.id]);
      place.is_open = isPlaceOpen(shiftsRes.rows);

      // Fetch cover photo and rating
      const extraRes = await db.query(
        `SELECT 
          (SELECT photo_url FROM place_photos WHERE place_id = $1 AND is_cover = TRUE LIMIT 1) as cover_photo,
          (SELECT COALESCE(AVG(overall_rating), 0) FROM reviews WHERE place_id = $1) as avg_rating,
          (SELECT COUNT(*) FROM reviews WHERE place_id = $1) as review_count,
          area
         `,
        [place.id]
      );
      if (extraRes.rows[0]) {
        place.cover_photo = extraRes.rows[0].cover_photo;
        place.avg_rating = extraRes.rows[0].avg_rating;
        place.review_count = extraRes.rows[0].review_count;
        place.area = extraRes.rows[0].area;
      }
    }

    return res.json(places);
  } catch (error) {
    console.error('Error fetching map places:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/places/:id
 * Full place detail
 */
router.get('/:id', optionalAuth, async (req: any, res: Response) => {
  const { id } = req.params;

  try {
    const placeRes = await db.query(`SELECT * FROM places WHERE id = $1`, [id]);
    if (placeRes.rowCount === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    const place = placeRes.rows[0];

    // Ratings breakdown and stats
    const statsRes = await db.query(
      `SELECT 
         COALESCE(AVG(overall_rating), 0) as avg_overall,
         COALESCE(AVG(food_rating), 0) as avg_food,
         COALESCE(AVG(service_rating), 0) as avg_service,
         COALESCE(AVG(cleanliness_rating), 0) as avg_cleanliness,
         COALESCE(AVG(value_rating), 0) as avg_value,
         COUNT(*) as review_count
       FROM reviews 
       WHERE place_id = $1`,
      [id]
    );

    const stats = statsRes.rows[0];
    place.avg_rating = stats.avg_overall;
    place.ratings_breakdown = {
      food: stats.avg_food,
      service: stats.avg_service,
      cleanliness: stats.avg_cleanliness,
      value: stats.avg_value
    };
    place.review_count = parseInt(stats.review_count, 10);

    // Shifts
    const shiftsRes = await db.query(`SELECT * FROM place_hours WHERE place_id = $1`, [id]);
    place.shifts = shiftsRes.rows;
    place.is_open = isPlaceOpen(place.shifts);

    // Photos
    const photosRes = await db.query(`SELECT * FROM place_photos WHERE place_id = $1 ORDER BY is_cover DESC, created_at DESC`, [id]);
    place.photos = photosRes.rows;

    // Check if saved
    if (req.user) {
      const savedRes = await db.query(
        `SELECT 1 FROM saved_places WHERE user_id = $1 AND place_id = $2`,
        [req.user.id, id]
      );
      place.is_saved = savedRes.rowCount > 0;
    } else {
      place.is_saved = false;
    }

    return res.json(place);
  } catch (error) {
    console.error('Error fetching place details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/places
 * Add place (auth)
 */
router.post('/', requireAuth, async (req: any, res: Response) => {
  const { name, category, area, description, lat, lng, maps_url, shifts, cover_photo_url } = req.body;
  const userId = req.user.id;

  if (!name || !category || !area || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Name, category, area, latitude, and longitude are required' });
  }

  try {
    const finalMapsUrl = maps_url || `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    const insertRes = await db.query(
      `INSERT INTO places (name, category, area, description, lat, lng, maps_url, is_verified, added_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, category, area, description, lat, lng, finalMapsUrl, false, userId]
    );

    const newPlace = insertRes.rows[0];

    // Insert shifts if provided
    if (shifts && Array.isArray(shifts)) {
      for (const shift of shifts) {
        await db.query(
          `INSERT INTO place_hours (place_id, day_type, shift_label, opens_at, closes_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [newPlace.id, shift.day_type, shift.shift_label, shift.opens_at, shift.closes_at]
        );
      }
    }

    // Insert cover photo if provided
    if (cover_photo_url) {
      await db.query(
        `INSERT INTO place_photos (place_id, uploaded_by, photo_url, is_cover)
         VALUES ($1, $2, $3, $4)`,
        [newPlace.id, userId, cover_photo_url, true]
      );
    }

    return res.status(201).json(newPlace);
  } catch (error) {
    console.error('Error adding place:', error);
    return res.status(500).json({ error: 'Internal server error adding place' });
  }
});

/**
 * PATCH /api/places/:id
 * Edit place (auth, own only)
 */
router.patch('/:id', requireAuth, async (req: any, res: Response) => {
  const { id } = req.params;
  const { name, category, area, description, lat, lng, maps_url } = req.body;
  const userId = req.user.id;

  try {
    // Check if the place belongs to the user
    const placeRes = await db.query(`SELECT added_by FROM places WHERE id = $1`, [id]);
    if (placeRes.rowCount === 0) {
      return res.status(404).json({ error: 'Place not found' });
    }

    if (placeRes.rows[0].added_by !== userId) {
      return res.status(403).json({ error: 'You can only edit places that you added' });
    }

    const updateRes = await db.query(
      `UPDATE places 
       SET name = COALESCE($1, name), 
           category = COALESCE($2, category), 
           area = COALESCE($3, area), 
           description = COALESCE($4, description), 
           lat = COALESCE($5, lat), 
           lng = COALESCE($6, lng), 
           maps_url = COALESCE($7, maps_url)
       WHERE id = $8 RETURNING *`,
      [name, category, area, description, lat, lng, maps_url, id]
    );

    return res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('Error editing place:', error);
    return res.status(500).json({ error: 'Internal server error editing place' });
  }
});

// Simple subroutes to fetch related data (can be merged or fetched inside GET detail)
router.get('/:id/hours', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`SELECT * FROM place_hours WHERE place_id = $1`, [req.params.id]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/photos', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`SELECT * FROM place_photos WHERE place_id = $1 ORDER BY is_cover DESC`, [req.params.id]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/reviews', optionalAuth, async (req: any, res: Response) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.name as user_name, u.avatar_url as user_avatar, u.is_chator,
         (SELECT COUNT(*) FROM votes WHERE review_id = r.id AND vote = 'agree') as agree_count,
         (SELECT COUNT(*) FROM votes WHERE review_id = r.id AND vote = 'disagree') as disagree_count
       FROM reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.place_id = $1
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    const reviews = result.rows;

    // Attach active user's vote
    if (req.user) {
      for (let r of reviews) {
        const voteRes = await db.query(`SELECT vote FROM votes WHERE review_id = $1 AND user_id = $2`, [r.id, req.user.id]);
        r.user_vote = voteRes.rows[0]?.vote || null;
      }
    } else {
      for (let r of reviews) {
        r.user_vote = null;
      }
    }

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching place reviews:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/claims', async (req: Request, res: Response) => {
  try {
    const result = await db.query(`SELECT * FROM claims WHERE place_id = $1 AND status = 'open'`, [req.params.id]);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
