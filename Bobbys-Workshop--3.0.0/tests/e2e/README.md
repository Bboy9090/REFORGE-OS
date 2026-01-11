# E2E Testing with Playwright

## Overview

This directory contains end-to-end (E2E) tests for Bobby's Workshop using Playwright. These tests verify the complete user workflows across all Secret Rooms.

## Prerequisites

1. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **(Optional) Start the backend server:**
   ```bash
   # Python backend (port 8000)
   cd backend && python -m uvicorn main:app --reload

   # Node.js backend (port 3001)
   npm run server:dev
   ```

## Running Tests

### Run All Tests
```bash
npm run test:e2e
```

### Run Tests with UI (Interactive Mode)
```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```

### Debug Tests
```bash
npm run test:e2e:debug
```

### View Test Report
```bash
npm run test:e2e:report
```

## Test Structure

```
tests/e2e/
├── setup.ts                      # Test setup and fixtures
├── playwright.config.ts          # Playwright configuration
├── 01-authentication.spec.ts     # Authentication flow tests
├── 02-sonic-codex.spec.ts        # Sonic Codex workflow tests
├── 03-ghost-codex.spec.ts        # Ghost Codex workflow tests
├── 04-pandora-codex.spec.ts      # Pandora Codex workflow tests
└── 05-mobile-responsive.spec.ts  # Mobile responsiveness tests
```

## Test Coverage

### ✅ Authentication Flow
- Application loading
- Onboarding display
- Phoenix Key authentication
- Secret Rooms access

### ✅ Sonic Codex
- Wizard flow display
- Job library navigation
- File upload interface
- URL extraction interface

### ✅ Ghost Codex
- Dashboard display
- Metadata shredder interface
- Canary tokens dashboard
- Persona vault

### ✅ Pandora Codex
- Dashboard display
- Hardware status
- Legal disclaimers
- Device detection

### ✅ Mobile Responsiveness
- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Touch target sizes
- Layout responsiveness

## Mock Backend

Tests use a `MockBackend` class that intercepts API calls and returns mock responses. This allows tests to run without requiring the actual backend server.

### Mock Routes Available

- Phoenix Key authentication
- Sonic Codex endpoints (upload, jobs, transcript)
- Ghost Codex endpoints (shred, canary, persona)
- Pandora Codex endpoints (hardware, DFU, jailbreak)

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5000`
- Timeout: 30 seconds per test
- Retries: 2 on CI, 0 locally
- Browsers: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- Web server: Auto-starts `npm run dev` before tests

## Debugging Tips

1. **Test Timeouts:** If tests are timing out, increase the timeout in `playwright.config.ts`
2. **Element Selectors:** Use `data-testid` attributes for reliable element selection
3. **Wait for Elements:** Always wait for elements to be visible before interacting
4. **Screenshots:** Screenshots are automatically taken on test failure
5. **Traces:** Traces are collected when tests are retried (CI only)

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import test utilities from `./setup`
3. Use fixtures for authenticated pages and mock backend
4. Follow the existing test patterns
5. Add `data-testid` attributes to UI components for easier selection

## Troubleshooting

### Tests fail with "ECONNREFUSED"
- Ensure the dev server is running on port 5000
- Check if another process is using port 5000
- Try running tests with `--headed` to see what's happening

### Tests fail with "Element not found"
- Check if selectors are correct
- Add `data-testid` attributes to components
- Use more flexible selectors (fallback options)
- Wait for elements with proper timeouts

### Tests are slow
- Run tests in parallel (default)
- Use mock backend instead of real backend
- Reduce test timeouts if appropriate
- Run specific test files instead of all tests

## CI/CD Integration

Tests run automatically in CI/CD pipelines:
- GitHub Actions: Runs on every push and PR
- Tests are retried twice on failure
- Screenshots and traces are uploaded as artifacts
- Test reports are generated and displayed
