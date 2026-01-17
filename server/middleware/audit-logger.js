/**
 * Audit logging middleware
 * Logs all operations to audit trail (console for normal ops, shadow logger for sensitive)
 */

import ShadowLogger from '../../core/lib/shadow-logger.js';

const shadowLogger = new ShadowLogger();

/**
 * Audit logging middleware
 * Logs all operations to audit trail (console for normal ops, shadow logger for sensitive)
 */
export function auditLogMiddleware(req, res, next) {
  const startTime = Date.now();
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.path,
      operation: req.body?.operation || req.query?.operation || req.path,
      deviceSerial: req.body?.serial || req.body?.deviceSerial || req.params?.serial,
      statusCode: res.statusCode,
      duration: Date.now() - startTime,
      success: res.statusCode < 400,
      userId: req.ip, // TODO: Replace with actual user ID/session
      userAgent: req.get('user-agent'),
      requestBody: sanitizeRequestBody(req.body) // Remove sensitive data
    };

    // Log to shadow logger for sensitive operations
    const isSensitive = req.path.includes('/trapdoor') || 
                       req.path.includes('/flash') ||
                       req.path.includes('/unlock') ||
                       req.path.includes('/erase');

    if (isSensitive) {
      shadowLogger.logShadow({
        operation: auditEntry.operation,
        deviceSerial: auditEntry.deviceSerial || 'N/A',
        userId: auditEntry.userId,
        authorization: 'LOGGED',
        success: auditEntry.success,
        metadata: {
          method: auditEntry.method,
          path: auditEntry.path,
          statusCode: auditEntry.statusCode,
          duration: auditEntry.duration
        }
      }).catch(err => console.error('[AUDIT] Shadow log error:', err));
    } else {
      // Log to console for non-sensitive operations
      console.log('[AUDIT]', JSON.stringify(auditEntry));
    }

    return originalJson(data);
  };

  next();
}

/**
 * Sanitize request body to remove sensitive information
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'passcode', 'token', 'secret', 'authorization', 'confirmation'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}

