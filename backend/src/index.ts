import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { initCronJobs } from './jobs/expireClaims';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Import route modules
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import placesRouter from './routes/places';
import reviewsRouter from './routes/reviews';
import votesRouter from './routes/votes';
import claimsRouter from './routes/claims';
import photosRouter from './routes/photos';
import savedRouter from './routes/saved';

// Configure CORS to work with Next.js dev server on localhost:3000
const allowedOrigins = ['http://localhost:3000', 'https://chaska.in', 'http://127.0.0.1:3000'];
app.use(
  cors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// Trust proxy for rate limits
app.set('trust proxy', 1);

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);
app.use('/api', reviewsRouter); // handles /api/reviews/:id and /api/places/:id/reviews
app.use('/api', votesRouter);   // handles /api/reviews/:id/vote
app.use('/api', claimsRouter);  // handles /api/places/:id/claims and /api/claims/:id/vote
app.use('/api', photosRouter);  // handles /api/places/:id/photos and /api/photos/:id
app.use('/api', savedRouter);   // handles /api/saved/:place_id

// Standard Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Initialize Nightly Cron Jobs
initCronJobs();

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(` Chaska Backend Server running on port ${PORT} `);
  console.log(` Mode: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'JSON Mock DB fallback'} `);
  console.log(`===============================================`);
});
