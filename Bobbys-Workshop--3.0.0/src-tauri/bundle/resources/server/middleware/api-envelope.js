/**
 * API Envelope Middleware
 * 
 * Provides envelope helper functions and correlation ID tracking
 */

const API_VERSION = 'v1';

/**
 * Generate correlation ID (UUID v4-like but simpler)
 */
function generateCorrelationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Get or generate correlation ID from request
 */
export function getCorrelationId(req) {
  return req.headers['x-correlation-id'] || req.correlationId || generateCorrelationId();
}

/**
 * Attach correlation ID to request
 */
export function correlationIdMiddleware(req, res, next) {
  req.correlationId = getCorrelationId(req);
  res.setHeader('X-Correlation-Id', req.correlationId);
  next();
}

/**
 * Create success envelope
 */
export function createSuccessEnvelope(data, req, options = {}) {
  const isDemo = process.env.DEMO_MODE === '1';
  
  return {
    ok: true,
    data,
    meta: {
      ts: new Date().toISOString(),
      correlationId: req.correlationId || getCorrelationId(req),
      apiVersion: API_VERSION,
      ...(isDemo && { demo: true }),
      ...options.meta
    }
  };
}

/**
 * Create error envelope
 */
export function createErrorEnvelope(code, message, req, details = null) {
  const isDemo = process.env.DEMO_MODE === '1';
  
  return {
    ok: false,
    error: {
      code,
      message,
      ...(details && { details })
    },
    meta: {
      ts: new Date().toISOString(),
      correlationId: req.correlationId || getCorrelationId(req),
      apiVersion: API_VERSION,
      ...(isDemo && { demo: true })
    }
  };
}

/**
 * Middleware to wrap responses in envelope
 * Use res.sendEnvelope(data) or res.sendError(code, message, details)
 */
export function envelopeMiddleware(req, res, next) {
  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json to use envelope
  res.json = function(data) {
    // If already an envelope (has ok property), use it as-is
    if (data && typeof data === 'object' && 'ok' in data) {
      return originalJson(data);
    }
    
    // Otherwise wrap in success envelope
    const envelope = createSuccessEnvelope(data, req);
    return originalJson(envelope);
  };
  
  // Add helper methods
  res.sendEnvelope = function(data, options) {
    const envelope = createSuccessEnvelope(data, req, options);
    return originalJson(envelope);
  };
  
  res.sendError = function(code, message, details, statusCode = 400) {
    const envelope = createErrorEnvelope(code, message, req, details);
    res.status(statusCode);
    return originalJson(envelope);
  };
  
  res.sendNotImplemented = function(message = 'This endpoint is not yet implemented', details = null) {
    return res.sendError('NOT_IMPLEMENTED', message, details, 503);
  };
  
  res.sendPolicyBlocked = function(message = 'Operation blocked by policy', details = null) {
    return res.sendError('POLICY_BLOCKED', message, details, 403);
  };
  
  res.sendDeviceLocked = function(message = 'Device is locked by another operation', details = null) {
    return res.sendError('DEVICE_LOCKED', message, details, 423);
  };
  
  res.sendConfirmationRequired = function(message = 'Confirmation required for this operation', details = null) {
    return res.sendError('CONFIRMATION_REQUIRED', message, details, 400);
  };
  
  next();
}

