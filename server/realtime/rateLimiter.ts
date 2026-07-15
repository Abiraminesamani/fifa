import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string | ((req: Request) => object);
}

class InMemoryRateLimiter {
  // Store request timestamps keyed by route:ip
  private hits: Map<string, number[]> = new Map();

  constructor() {
    // Periodically clean up old hit records every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  public limit(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${req.path}:${ip}`;
      const now = Date.now();
      const windowStart = now - config.windowMs;

      // Get existing hits and filter out old ones
      const clientHits = (this.hits.get(key) || []).filter(timestamp => timestamp > windowStart);
      
      if (clientHits.length >= config.maxRequests) {
        // Limit exceeded!
        const responseBody = typeof config.message === 'function' 
          ? config.message(req)
          : { error: config.message, retryAfterSeconds: Math.ceil((clientHits[0] + config.windowMs - now) / 1000) };

        res.status(429).json({
          success: false,
          code: 'RATE_LIMIT_EXCEEDED',
          ...responseBody
        });
        return;
      }

      // Record new hit
      clientHits.push(now);
      this.hits.set(key, clientHits);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', config.maxRequests - clientHits.length);
      
      next();
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      // Keep only timestamps from the last 10 minutes
      const active = timestamps.filter(t => t > now - 10 * 60 * 1000);
      if (active.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, active);
      }
    }
  }

  // Exposed helper for testing
  public reset() {
    this.hits.clear();
  }
}

export const rateLimiter = new InMemoryRateLimiter();
export default rateLimiter;
