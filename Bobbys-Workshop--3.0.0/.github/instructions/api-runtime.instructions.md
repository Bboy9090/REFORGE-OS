---
applyTo:
  - "apps/**/src/**/*.ts"
  - "src/**/*.ts"
  - "src-tauri/src/**/*.ts"
  - "libs/**/src/**/*.ts"
  - "server/**/*.ts"
  - "server/**/*.js"
---

# API Runtime Rules

## Prime Directive

**NO PLACEHOLDERS. NO FAKE SUCCESS. NO MOCK DATA IN PRODUCTION PATHS.**

## Core Requirements

### 1. Error Handling

- **All errors must be explicit and actionable**
  ```typescript
  // ❌ BAD
  return { success: true }; // when operation didn't actually run
  
  // ✅ GOOD
  throw new Error("Failed to connect to device: USB port not found");
  ```

- **Use proper HTTP status codes**
  - 200: Success with data
  - 201: Created
  - 400: Bad request (client error)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not found
  - 500: Server error
  - 503: Service unavailable

- **Return structured errors**
  ```typescript
  // ✅ GOOD
  return {
    success: false,
    error: {
      code: "DEVICE_NOT_FOUND",
      message: "No device detected on USB",
      details: { port: "USB3.0", expectedVID: "0x1234" }
    }
  };
  ```

### 2. API Contracts

- **All API endpoints must have TypeScript types**
- **Validate all inputs** (use Zod, Yup, or similar)
- **Document expected request/response shapes**
- **Version your APIs** (if breaking changes expected)

Example:
```typescript
import { z } from 'zod';

const FlashRequestSchema = z.object({
  deviceId: z.string(),
  firmwareUrl: z.string().url(),
  verify: z.boolean().default(true)
});

type FlashRequest = z.infer<typeof FlashRequestSchema>;

export async function flashDevice(req: FlashRequest) {
  // Validate first
  const validated = FlashRequestSchema.parse(req);
  
  // Then execute
  // ...
}
```

### 3. Real Implementation Only

- **If feature isn't ready:**
  - Gate behind `EXPERIMENTAL_FEATURES` flag (OFF by default)
  - OR return clear error: `throw new Error("Feature not implemented")`
  - OR hide the endpoint entirely

- **No "coming soon" returns in production**
  ```typescript
  // ❌ BAD
  return { message: "Coming soon!" };
  
  // ✅ GOOD - Gate behind feature flag
  if (!process.env.EXPERIMENTAL_BATCH_FLASH) {
    throw new Error("Batch flashing requires EXPERIMENTAL_BATCH_FLASH=true");
  }
  ```

### 4. Database Operations

- **Use transactions for multi-step operations**
- **Handle connection errors gracefully**
- **Never expose raw SQL errors to client** (log internally, return sanitized)
- **Use parameterized queries** (prevent SQL injection)

### 5. External API Calls

- **Set reasonable timeouts** (don't hang forever)
- **Retry with exponential backoff** (for transient failures)
- **Log external failures** (for debugging)
- **Cache when appropriate** (reduce external calls)

Example:
```typescript
async function fetchFirmware(url: string, retries = 3): Promise<Buffer> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        timeout: 30000,  // 30 second timeout
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error("Should not reach here");
}
```

### 6. Platform-Specific Code

- **Guard platform-specific code** with runtime checks
  ```typescript
  if (process.platform === 'win32') {
    // Windows-specific implementation
  } else if (process.platform === 'darwin') {
    // macOS-specific implementation
  } else {
    throw new Error(`Platform ${process.platform} not supported`);
  }
  ```

- **Fail early with clear messages** on unsupported platforms
- **Test on target platforms** (or document inability to test)

### 7. Logging Standards

- **Use structured logging** (JSON format preferred)
- **Include correlation IDs** (for request tracing)
- **Log levels:**
  - ERROR: Failures requiring attention
  - WARN: Unexpected but handled
  - INFO: Normal operation milestones
  - DEBUG: Detailed diagnostic info

- **Never log secrets** (API keys, passwords, tokens)
  ```typescript
  // ❌ BAD
  logger.info("User logged in", { username, password });
  
  // ✅ GOOD
  logger.info("User logged in", { username, userId });
  ```

### 8. Async Operations

- **Always handle Promise rejections**
- **Use async/await** (not raw Promises unless needed)
- **Cancel long-running operations** when appropriate
- **Show progress** for long operations (WebSocket, SSE, polling)

### 9. Security

- **Validate all external input** (never trust client)
- **Sanitize output** (prevent XSS in responses)
- **Use HTTPS** for external calls
- **Set security headers** (CORS, CSP, etc.)
- **Rate limit** API endpoints (prevent abuse)

### 10. Testing Requirements

- **Unit tests** for business logic
- **Integration tests** for API endpoints
- **Mock external dependencies** (in tests only!)
- **Test error paths** (not just happy path)

## What to Check Before Committing

- [ ] No TODOs or FIXMEs in runtime code
- [ ] All errors are explicit and actionable
- [ ] All inputs are validated
- [ ] All outputs are properly typed
- [ ] No secrets in logs
- [ ] Platform-specific code is guarded
- [ ] External calls have timeouts
- [ ] Database operations use transactions (if needed)
- [ ] Tests cover new code paths
- [ ] Manual testing completed (for user-facing changes)

## Examples of Good vs Bad

### Bad: Fake Success
```typescript
async function deleteDevice(id: string) {
  // TODO: Implement actual deletion
  return { success: true };
}
```

### Good: Real Implementation or Clear Error
```typescript
async function deleteDevice(id: string) {
  const result = await db.devices.delete({ where: { id } });
  if (!result) {
    throw new Error(`Device ${id} not found`);
  }
  return { success: true, deletedId: id };
}
```

### Bad: Silent Failure
```typescript
async function flashFirmware(device: Device) {
  try {
    await device.flash();
  } catch (err) {
    // Swallow error
  }
  return { success: true };
}
```

### Good: Explicit Error Propagation
```typescript
async function flashFirmware(device: Device) {
  try {
    await device.flash();
    return { success: true };
  } catch (err) {
    logger.error("Flash failed", { deviceId: device.id, error: err });
    throw new Error(`Failed to flash device: ${err.message}`);
  }
}
```

## When in Doubt

1. Check existing code patterns in the repo
2. Ask in PR comments (don't guess)
3. Prefer explicit errors over silent failures
4. Prefer feature flags over commented code
5. Prefer small focused PRs over large refactors
