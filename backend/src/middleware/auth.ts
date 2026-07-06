import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chaska-fallback-secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    phone?: string;
    email?: string;
    name?: string;
    is_chator: boolean;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(418).json({ error: 'Auth required (login needed)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      phone: decoded.phone,
      email: decoded.email,
      name: decoded.name,
      is_chator: decoded.is_chator || false
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth that doesn't block the request if user is not logged in
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = {
        id: decoded.id,
        phone: decoded.phone,
        email: decoded.email,
        name: decoded.name,
        is_chator: decoded.is_chator || false
      };
    } catch (error) {
      // Ignore invalid token and proceed anonymously
    }
  }
  next();
}
