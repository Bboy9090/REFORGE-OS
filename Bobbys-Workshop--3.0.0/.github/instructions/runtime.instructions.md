---
applyTo: "**/*.{ts,tsx,js,py}"
---

# Runtime Rules (NO PLACEHOLDERS)

- No placeholder/mock/stub logic in runtime paths.
- No fake success returns.
- Errors must be explicit and actionable.
- Platform-specific behavior must be guarded.

If implementation isn't ready:

- hide/disable OR gate behind EXPERIMENTAL (OFF by default)
- return a hard error explaining why unavailable
