import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[ip] || now > store[ip].resetTime) {
      store[ip] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    store[ip].count++;

    if (store[ip].count > limit) {
      const remainingMs = store[ip].resetTime - now;
      res.setHeader('Retry-After', Math.ceil(remainingMs / 1000));
      return res.status(429).json({
        error: `Too many requests. Please try again in ${Math.ceil(remainingMs / 1000)} seconds.`
      });
    }

    next();
  };
}

// 5 requests per minute limit for sensitive endpoints
export const authRateLimiter = createRateLimiter(5, 60 * 1000);

// 15 requests per minute limit for writing reviews
export const reviewRateLimiter = createRateLimiter(15, 60 * 1000);
