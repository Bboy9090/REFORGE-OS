# 🧪 Running E2E Tests - Quick Guide

## Prerequisites

1. **Node.js** installed (v18+)
2. **npm** installed
3. **Project dependencies** installed (`npm install`)

## Step-by-Step Instructions

### Step 1: Install Playwright Browsers (First Time Only)

Open a terminal and run:
```bash
npx playwright install
```

Or install just Chromium (faster):
```bash
npx playwright install chromium
```

This will download the browser binaries needed for testing. This only needs to be done once.

### Step 2: Start the Development Server

In a **separate terminal window**, start the dev server:
```bash
npm run dev
```

Wait for the server to be ready. You should see:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5000/
  ➜  Network: use --host to expose
```

**Keep this terminal window open!** The dev server must stay running while tests execute.

### Step 3: Run E2E Tests

In **another terminal window** (or the same one if you started the server in the background), run:
```bash
npm run test:e2e
```

This will:
- Run all E2E test suites
- Generate test reports
- Take screenshots on failures
- Show results in the terminal

### Alternative: Run Tests in Interactive Mode

For a better debugging experience:
```bash
npm run test:e2e:ui
```

This opens Playwright's interactive UI where you can:
- See tests run in real-time
- Step through tests
- View test traces
- Debug failures easily

### Alternative: Run Tests with Visible Browser

To see the browser while tests run:
```bash
npm run test:e2e:headed
```

### View Test Report

After tests complete, view the HTML report:
```bash
npm run test:e2e:report
```

This opens a detailed test report with:
- Test results
- Screenshots
- Video recordings
- Test traces

## Troubleshooting

### "ECONNREFUSED" Error
- **Solution:** Make sure the dev server is running on port 5000
- Check if another process is using port 5000: `netstat -ano | findstr :5000`
- Kill any process using the port if needed

### "playwright: command not found"
- **Solution:** Run `npx playwright install` first
- Or use `npx playwright test` instead of `npm run test:e2e`

### Tests Timeout
- **Solution:** Increase timeout in `playwright.config.ts`
- Or check if the dev server is responding: `curl http://localhost:5000`

### Browser Not Found
- **Solution:** Run `npx playwright install` to install browsers
- Check installed browsers: `npx playwright --version`

### Tests Fail with "Element not found"
- **Solution:** Add `data-testid` attributes to components
- Or update selectors in test files
- Check if the page loaded correctly

## Test Structure

Tests are located in `tests/e2e/`:
- `01-authentication.spec.ts` - Authentication flow
- `02-sonic-codex.spec.ts` - Sonic Codex workflows
- `03-ghost-codex.spec.ts` - Ghost Codex workflows
- `04-pandora-codex.spec.ts` - Pandora Codex workflows
- `05-mobile-responsive.spec.ts` - Mobile responsiveness

## Quick Test Run (Single File)

To run just one test file:
```bash
npx playwright test tests/e2e/01-authentication.spec.ts
```

## Debug Mode

To debug a specific test:
```bash
npm run test:e2e:debug
```

This opens Playwright Inspector where you can:
- Step through each action
- Inspect the page
- View console logs
- Test selectors

## CI/CD Integration

For CI/CD pipelines, tests run automatically. Make sure to:
1. Install dependencies: `npm install`
2. Install Playwright browsers: `npx playwright install --with-deps`
3. Start dev server: `npm run dev` (in background)
4. Run tests: `npm run test:e2e`

## Expected Results

On successful run, you should see:
```
Running 15 tests using 3 workers

  15 passed (30s)
```

Test reports will be generated in:
- HTML: `playwright-report/index.html`
- JSON: `playwright-results.json`

## Need Help?

If tests fail:
1. Check the error messages in the terminal
2. View screenshots in `test-results/` directory
3. Open the HTML report: `npm run test:e2e:report`
4. Check the dev server is running and responsive
5. Verify Playwright browsers are installed

---

**Happy Testing! 🚀**
