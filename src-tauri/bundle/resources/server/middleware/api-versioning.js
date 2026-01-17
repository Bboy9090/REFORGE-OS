/**
 * API Versioning Middleware
 * 
 * Routes /api/* to /api/v1/* with deprecation warnings
 */

import { createErrorEnvelope, getCorrelationId } from './api-envelope.js';

const API_VERSION = 'v1';
const DEPRECATION_WARN_DAYS = 14; // Warn for 2 weeks before removing

/**
 * Create v1 router wrapper
 */
export function createV1Router() {
  return (req, res, next) => {
    // Store original path for logging
    req.originalApiPath = req.path;
    next();
  };
}

/**
 * Deprecation warning middleware for /api/* routes (non-v1)
 */
export function deprecationWarningMiddleware(req, res, next) {
  // Only warn on non-v1 routes
  if (!req.path.startsWith('/v1/')) {
    const correlationId = req.correlationId || getCorrelationId(req);
    
    // Add deprecation warning header
    res.setHeader('X-API-Deprecated', 'true');
    res.setHeader('X-API-Version', API_VERSION);
    res.setHeader('X-API-Migration-Notice', `Use /api/${API_VERSION}${req.path} instead`);
    
    // Log warning (don't block, just warn)
    console.warn(`[API] Deprecated endpoint accessed: ${req.method} ${req.path} (correlation: ${correlationId})`);
  }
  
  next();
}

