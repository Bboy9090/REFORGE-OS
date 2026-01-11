/**
 * Trapdoor Authentication Middleware
 * 
 * Validates Secret Room passcode for protected endpoints
 * 
 * @module trapdoor-auth
 */

/**
 * Get trapdoor passcode from environment
 */
function getTrapdoorPasscode() {
  return process.env.SECRET_ROOM_PASSCODE || process.env.TRAPDOOR_PASSCODE || null;
}

/**
 * Middleware to require trapdoor passcode authentication
 */
export function requireTrapdoorPasscode(req, res, next) {
  const required = getTrapdoorPasscode();
  if (!required) {
    return res.status(503).json({
      ok: false,
      error: {
        code: 'TRAPDOOR_NOT_CONFIGURED',
        message: 'Trapdoor passcode not configured'
      },
      meta: {
        ts: new Date().toISOString(),
        correlationId: req.correlationId || 'unknown',
        apiVersion: 'v1'
      }
    });
  }

  const provided =
    req.get('X-Secret-Room-Passcode') ||
    req.get('X-Trapdoor-Passcode') ||
    (typeof req.query?.passcode === 'string' ? req.query.passcode : null);

  if (!provided || provided !== required) {
    return res.status(401).json({
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing Secret Room passcode.'
      },
      meta: {
        ts: new Date().toISOString(),
        correlationId: req.correlationId || 'unknown',
        apiVersion: 'v1',
        requiredHeader: 'X-Secret-Room-Passcode'
      }
    });
  }

  return next();
}

export { getTrapdoorPasscode };

