import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const attempts = new Map<string, RateLimitRecord>();

/**
 * Basic in-memory rate limiter for authentication endpoints
 * Max 20 requests per 15 minutes per IP
 */
export function authRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown-client';
  const key = String(ip);
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 30;

  const current = attempts.get(key);

  if (!current || now > current.resetTime) {
    attempts.set(key, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= maxAttempts) {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
    return;
  }

  current.count += 1;
  next();
}
