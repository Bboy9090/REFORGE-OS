# P0 Fixes - Implementation Guide

Quick reference for implementing the critical P0 fixes identified in the audit.

---

## P0-1: Mount Catalog Router

**File:** `server/index.js`

**Change:** Add after line 9 (after trapdoorRouter import)

```javascript
import catalogRouter from './catalog.js';

// ... existing code ...

// Mount catalog router (around line 2968, before trapdoor router)
app.use('/api/catalog', catalogRouter);

// Trapdoor API - Secure endpoints for sensitive operations (Bobby's Secret Workshop)
app.use('/api/trapdoor', requireTrapdoorPasscode, trapdoorRouter);
```

**Test:**
```bash
curl http://localhost:3001/api/catalog
# Should return envelope-formatted JSON
```

---

## P0-4: Add Device Locks

**File:** `server/locks.js` (create new file)

```javascript
/**
 * Device Lock Manager
 * Prevents multiple operations on the same device simultaneously
 */

const deviceLocks = new Map();

const LOCK_TIMEOUT = 300000; // 5 minutes

/**
 * Acquire a lock for a device
 * @param {string} deviceSerial - Device serial number
 * @param {string} operation - Operation identifier
 * @returns {{acquired: boolean, reason?: string}}
 */
export function acquireDeviceLock(deviceSerial, operation) {
  if (!deviceSerial || typeof deviceSerial !== 'string') {
    return { acquired: false, reason: 'Invalid device serial' };
  }

  const existingLock = deviceLocks.get(deviceSerial);
  
  if (existingLock) {
    // Check if lock expired
    if (Date.now() - existingLock.lockedAt > LOCK_TIMEOUT) {
      deviceLocks.delete(deviceSerial);
    } else {
      return {
        acquired: false,
        reason: `Device locked by operation: ${existingLock.operation}`,
        lockedBy: existingLock.operation,
        lockedAt: existingLock.lockedAt
      };
    }
  }

  deviceLocks.set(deviceSerial, {
    lockedAt: Date.now(),
    operation,
    deviceSerial
  });

  return { acquired: true };
}

/**
 * Release a lock for a device
 * @param {string} deviceSerial - Device serial number
 */
export function releaseDeviceLock(deviceSerial) {
  deviceLocks.delete(deviceSerial);
}

/**
 * Get lock status for a device
 * @param {string} deviceSerial - Device serial number
 * @returns {{locked: boolean, operation?: string, lockedAt?: number}}
 */
export function getDeviceLockStatus(deviceSerial) {
  const lock = deviceLocks.get(deviceSerial);
  
  if (!lock) {
    return { locked: false };
  }

  // Check if expired
  if (Date.now() - lock.lockedAt > LOCK_TIMEOUT) {
    deviceLocks.delete(deviceSerial);
    return { locked: false };
  }

  return {
    locked: true,
    operation: lock.operation,
    lockedAt: lock.lockedAt
  };
}

/**
 * Clear all locks (for cleanup/testing)
 */
export function clearAllLocks() {
  deviceLocks.clear();
}
```

**File:** `server/index.js` - Add middleware

```javascript
import { acquireDeviceLock, releaseDeviceLock } from './locks.js';

// Add middleware function (around line 573, before routes)
function requireDeviceLock(req, res, next) {
  const deviceSerial = req.body?.serial || req.body?.deviceSerial || req.params?.serial;
  
  if (!deviceSerial) {
    // Operations that don't need a device lock can proceed
    return next();
  }

  const operation = req.path.replace('/api/', '').replace(/\//g, '_');
  const lockResult = acquireDeviceLock(deviceSerial, operation);

  if (!lockResult.acquired) {
    return res.status(423).json({
      success: false,
      error: 'Device locked',
      message: lockResult.reason,
      lockedBy: lockResult.lockedBy,
      retryAfter: LOCK_TIMEOUT / 1000 // seconds
    });
  }

  // Release lock when response finishes (success or error)
  const originalEnd = res.end;
  res.end = function(...args) {
    releaseDeviceLock(deviceSerial);
    originalEnd.apply(this, args);
  };

  next();
}

// Apply to destructive operations (around line 1370, before fastboot routes)
app.post('/api/fastboot/flash', requireDeviceLock, async (req, res) => {
  // ... existing code ...
});

app.post('/api/fastboot/unlock', requireDeviceLock, async (req, res) => {
  // ... existing code ...
});

app.post('/api/fastboot/erase', requireDeviceLock, async (req, res) => {
  // ... existing code ...
});
```

---

## P0-5: Add Audit Logging

**File:** `server/middleware/audit-logger.js` (create new file)

```javascript
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
  const sensitiveFields = ['password', 'passcode', 'token', 'secret', 'authorization'];

  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
```

**File:** `server/index.js` - Apply middleware

```javascript
import { auditLogMiddleware } from './middleware/audit-logger.js';

// Add after CORS middleware (around line 18)
app.use(auditLogMiddleware);
```

---

## P0-2: Add Confirmation Gates (Frontend)

**File:** `src/components/ConfirmationDialog.tsx` (create new file)

```typescript
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  requiredText: string; // Text user must type exactly
  warning?: string;
  danger?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  requiredText,
  warning,
  danger = false
}: ConfirmationDialogProps) {
  const [inputText, setInputText] = useState('');
  const isValid = inputText === requiredText;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setInputText('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {warning && (
              <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-900 dark:text-yellow-200">
                <strong>Warning:</strong> {warning}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <label className="text-sm font-medium">
            Type <code className="bg-muted px-1 py-0.5 rounded">{requiredText}</code> to confirm:
          </label>
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="mt-2"
            placeholder={requiredText}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInputText('')}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className={danger ? 'bg-destructive text-destructive-foreground' : ''}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**File:** `src/components/FastbootFlashingPanel.tsx` - Add confirmation

```typescript
// Add import
import { ConfirmationDialog } from './ConfirmationDialog';
import { useState } from 'react';

// In component:
const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
const [pendingUnlock, setPendingUnlock] = useState<() => void>(() => {});

// In unlock handler:
const handleUnlock = () => {
  setPendingUnlock(() => async () => {
    // Your existing unlock logic here
    await api.post('/api/fastboot/unlock', { serial });
  });
  setShowUnlockConfirm(true);
};

// In JSX:
<ConfirmationDialog
  open={showUnlockConfirm}
  onClose={() => setShowUnlockConfirm(false)}
  onConfirm={() => {
    pendingUnlock();
    setShowUnlockConfirm(false);
  }}
  title="Unlock Bootloader"
  description="This will ERASE ALL DATA on the device and void your warranty."
  requiredText="UNLOCK"
  warning="This operation cannot be undone. All user data will be permanently deleted."
  danger
/>
```

**Backend:** Add confirmation token validation

**File:** `server/index.js` - Modify unlock endpoint

```javascript
app.post('/api/fastboot/unlock', requireDeviceLock, async (req, res) => {
  const { serial, confirmation } = req.body;
  
  if (!confirmation || confirmation !== 'UNLOCK') {
    return res.status(400).json({
      success: false,
      error: 'Confirmation required',
      message: 'You must type "UNLOCK" to confirm this operation'
    });
  }

  // ... rest of existing code ...
});
```

---

## Testing Checklist

After implementing P0 fixes:

- [ ] Catalog endpoint works: `curl http://localhost:3001/api/catalog`
- [ ] Device locks prevent concurrent operations
- [ ] Audit logs appear in console/shadow logs for destructive operations
- [ ] Confirmation dialogs appear for flash/unlock/erase
- [ ] Backend rejects operations without confirmation token

---

## Estimated Total Time

- P0-1 (Catalog Router): 5 minutes
- P0-4 (Device Locks): 1 hour
- P0-5 (Audit Logging): 1 hour
- P0-2 (Confirmation Gates): 2 hours (frontend + backend)

**Total: ~4 hours**

