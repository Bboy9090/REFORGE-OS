/**
 * Rate Limiting Middleware
 * In-memory rate limiter for sensitive endpoints
 */

const rateLimitStore = new Map();

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  // Trapdoor endpoints - very strict
  trapdoor: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many requests to trapdoor endpoint. Please try again later.'
  },
  // Authorization triggers - moderate
  authorization: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many authorization trigger requests. Please try again later.'
  },
  // Flash operations - moderate
  flash: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Too many flash operation requests. Please try again later.'
  },
  // Fastboot destructive operations - strict
  fastboot: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many fastboot operation requests. Please try again later.'
  },
  // Default rate limit
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please try again later.'
  }
};

/**
 * Get client identifier from request
 */
function getClientId(req) {
  // Use IP address as client identifier
  return req.ip || req.connection.remoteAddress || 'unknown';
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Create rate limiting middleware
 */
export function rateLimiter(limitType = 'default') {
  const config = RATE_LIMITS[limitType] || RATE_LIMITS.default;

  return (req, res, next) => {
    cleanupExpiredEntries();

    const clientId = getClientId(req);
    const key = `${limitType}:${clientId}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // Create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return next();
    }

    // Increment count
    record.count++;

    if (record.count > config.maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.status(429).json({
        ok: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: config.message,
          details: {
            limit: config.maxRequests,
            windowMs: config.windowMs,
            retryAfter
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          correlationId: req.correlationId || null,
          apiVersion: 'v1'
        }
      });
      return;
    }

    next();
  };
}

