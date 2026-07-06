import { Router, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { optionalAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'chaska-fallback-secret';

// In-Memory store for temporary verification codes: phone -> code
const mockOtpStore: { [phone: string]: string } = {};

/**
 * POST /api/auth/otp/send
 * Body: { phone: string }
 */
router.post('/otp/send', authRateLimiter, async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Generate a mock 6-digit OTP
  const code = '123456';
  mockOtpStore[phone] = code;

  console.log(`[Developer OTP Logger] Sent verification code ${code} to phone ${phone}`);

  return res.json({
    success: true,
    message: 'Verification code sent successfully (in mock mode, use code 123456)'
  });
});

/**
 * POST /api/auth/otp/verify
 * Body: { phone: string, code: string }
 */
router.post('/otp/verify', authRateLimiter, async (req: Request, res: Response) => {
  const { phone, code } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone and verification code are required' });
  }

  const storedCode = mockOtpStore[phone] || '123456'; // fallback to default developer OTP

  if (code !== storedCode) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  try {
    // Check if user exists
    let userQuery = await db.query(`SELECT * FROM users WHERE phone = $1`, [phone]);
    let user = userQuery.rows[0];

    if (!user) {
      // Create a default name for new users
      const randomId = Math.floor(100 + Math.random() * 900);
      const defaultName = `Foodie #${randomId}`;
      const defaultAvatar = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;

      const insertRes = await db.query(
        `INSERT INTO users (name, phone, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [defaultName, phone, null, defaultAvatar]
      );
      user = insertRes.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, phone: user.phone, name: user.name, is_chator: user.is_chator },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Cleanup OTP
    delete mockOtpStore[phone];

    return res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Error during OTP verification:', error);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
});

/**
 * POST /api/auth/google
 * Body: { email: string, name: string, avatar_url?: string }
 */
router.post('/google', async (req: Request, res: Response) => {
  const { email, name, avatar_url } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    // Check if user exists by email
    let userQuery = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    let user = userQuery.rows[0];

    if (!user) {
      // Create user
      const avatar = avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
      const insertRes = await db.query(
        `INSERT INTO users (name, phone, email, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, null, email, avatar]
      );
      user = insertRes.rows[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, is_chator: user.is_chator },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 */
router.get('/me', optionalAuth, async (req: any, res: Response) => {
  if (!req.user) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    const userRes = await db.query(`SELECT * FROM users WHERE id = $1`, [req.user.id]);
    if (userRes.rowCount === 0) {
      res.clearCookie('token');
      return res.status(401).json({ authenticated: false, user: null });
    }
    return res.json({
      authenticated: true,
      user: userRes.rows[0]
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error checking session' });
  }
});

export default router;
