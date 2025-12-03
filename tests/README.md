# FVU Request System - Playwright End-to-End Tests

This directory contains comprehensive Playwright end-to-end tests for the Forensic Video Unit (FVU) Request System. The tests automate ALL items from the Manual QA Checklist and cover validation, conditional fields, form submission, draft management, and cross-form behavior.

## Quick Start

### Prerequisites

- Node.js (v14+) and npm
- The FVU application running locally

### Installation

Install Playwright dependencies:

```bash
npm install -D @playwright/test
```

### Running Tests

**Run all tests across all browsers (Chromium, Firefox, WebKit):**

```bash
npm test
```

**Run tests in UI mode (interactive):**

```bash
npm run test:ui
```

**Run tests in headed mode (see browser windows):**

```bash
npm run test:headed
```

**Debug tests with Playwright Inspector:**

```bash
npm run test:debug
```

### Running Specific Tests

**Run only Upload form tests:**

```bash
npm run test:upload
```

**Run only Analysis form tests:**

```bash
npm run test:analysis
```

**Run only Recovery form tests:**

```bash
npm run test:recovery
```

**Run only cross-form tests:**

```bash
npm run test:cross
```

**Run tests in specific browser:**

```bash
npm run test:chrome    # Chromium only
npm run test:firefox   # Firefox only
npm run test:safari    # WebKit (Safari)
```

**Run a single test file with pattern:**

```bash
npx playwright test upload-form.spec.js
npx playwright test upload-form.spec.js -g "1.1"  # Tests matching pattern
```

### View Test Report

After running tests, view the HTML report:

```bash
npm run report
```

This opens an interactive report showing:
- Test results and timings
- Screenshots on failure
- Video recordings of failures
- Detailed error messages

## Test Structure

### Files and Organization

```
tests/
├── upload-form.spec.js          # 95+ tests for Upload form
├── analysis-form.spec.js        # 60+ tests for Analysis form
├── recovery-form.spec.js        # 75+ tests for Recovery form
├── cross-form.spec.js           # 35+ tests for cross-form behavior
├── fixtures/
│   ├── test-data.js             # Reusable test data and fixtures
│   └── form-helpers.js          # Helper functions for common operations
└── README.md                     # This file
```

### Test Data (fixtures/test-data.js)

Provides pre-configured test data:

- `validOfficerData` - Standard officer information for all forms
- `invalidOfficerData` - Invalid data for testing validation
- `uploadFormValidData` - Complete valid Upload form data
- `analysisFormValidData` - Complete valid Analysis form data
- `recoveryFormValidData` - Complete valid Recovery form data
- `dateHelpers` - Utilities for generating date strings

**Example Usage:**

```javascript
import { validOfficerData, uploadFormValidData } from './fixtures/test-data.js';

await fillOfficerInfo(page, validOfficerData);
await fillUploadForm(page, uploadFormValidData);
```

### Helper Functions (fixtures/form-helpers.js)

**Form Filling Functions:**

```javascript
await fillOfficerInfo(page, officerData);
await fillUploadForm(page, formData);
await fillAnalysisForm(page, formData);
await fillRecoveryForm(page, formData);
```

**Common Test Operations:**

```javascript
await toggleTheme(page);                    // Toggle dark/light theme
await loadDraft(page);                      // Load saved draft
await waitForAutoSave(page);                // Wait for 2-second auto-save
await getProgressPercentage(page);          // Get progress bar %
await addLocation(page, count);             // Add location groups (Upload)
await addDVRSystem(page, count);            // Add DVR systems (Recovery)
await addTimeFrame(page, dvrIndex, count);  // Add time frames (Recovery)
await clearLocalStorage(page);              // Clear all localStorage
await setOfflineMode(page, true);           // Simulate offline
```

## Test Coverage

### Upload Form (95+ tests)

- Page load and error checking
- All required field validation (11 fields)
- Email validation (4 scenarios)
- Phone validation (4 scenarios)
- Occurrence number validation (4 scenarios)
- Media Type "Other" field (6 tests)
- City "Other" field (5 tests)
- Time & Date Correct radio buttons (6 tests)
- DVR retention calculation (4 tests)
- Date range validation (2 tests)
- Add/Remove location functionality (8 tests)
- Progress bar behavior (6 tests)
- Locker number validation (5 tests)
- Theme toggle (4 tests)
- Draft auto-save (3 tests)
- Clear form button (4 tests)
- Successful submission (3 tests)
- Officer info persistence (5 tests)

### Analysis Form (60+ tests)

- Page load tests (5 tests)
- Required field validation (12 tests)
- Offence Type "Other" field (5 tests)
- Video Location "Other" field (5 tests)
- City "Other" field (4 tests)
- Service Required "Other" field (5 tests)
- Recording date validation (4 tests)
- File names field (2 tests)
- Progress bar (3 tests)
- Draft auto-save (1 test)
- Officer info persistence (2 tests)
- Successful submission (2 tests)

### Recovery Form (75+ tests)

- Page load tests (5 tests)
- Required field validation (16 tests)
- Offence Type "Other" field (4 tests)
- City "Other" field (1 test)
- Location contact phone validation (3 tests)
- DVR Time & Date Correct special behavior (4 tests)
- DVR Retention field (6 tests)
- Video extraction time range (2 tests)
- Time Period Type radio buttons (3 tests)
- Add Additional Time Frame (4 tests)
- Add Another DVR System (4 tests)
- Multiple DVRs with time frames (2 tests)
- DVR optional vs required fields (4 tests)
- Camera details field (1 test)
- Incident description (2 tests)
- Progress bar (3 tests)
- Draft auto-save (1 test)
- Remove DVR functionality (1 test)
- Successful submission (2 tests)

### Cross-Form Tests (35+ tests)

- Officer info persistence across forms (4 tests)
- Draft independence (3 tests)
- Theme persistence (4 tests)
- Session and storage management (2 tests)
- Offline behavior (2 tests)
- Field validation consistency (3 tests)

## Configuration

### playwright.config.js

Key settings:

```javascript
baseURL: 'http://localhost:3000'           // Base URL for tests
webServer: 'npx serve -l 3000 .'           // Auto-starts static server (without -s flag!)
timeout: 30000                             // Test timeout
```

**IMPORTANT:** The `-s` flag should NOT be used. This flag makes serve behave like a Single Page Application server, always returning index.html for non-existent routes. Your application has multiple HTML files (upload.html, analysis.html, recovery.html) that need to be served directly.

### Modifying Configuration

Edit `playwright.config.js` to:

- Change baseURL if application is hosted elsewhere
- Adjust timeouts for slower CI/CD environments
- Modify browser list or add mobile testing
- Change reporter output format

### Server Requirements

The tests automatically start a serve server on `http://localhost:3000` before running. The server:
- Serves static HTML files directly
- Does NOT use SPA routing (no `-s` flag)
- Requires Node.js and npm installed
- Uses `npx serve` for simple HTTP serving

## Debugging Failed Tests

### Option 1: Interactive UI Mode

```bash
npm run test:ui
```

Provides a GUI to:
- Run tests one at a time
- Step through test execution
- Inspect DOM at each step
- View source code

### Option 2: Debug Mode

```bash
npm run test:debug
```

Launches Playwright Inspector where you can:
- Set breakpoints
- Step through execution
- Evaluate expressions
- Continue execution

### Option 3: Headed Mode with Slowmo

```bash
npx playwright test --headed --workers=1 -g "test name"
```

Run test in visible browser with slow execution:

```bash
npx playwright test upload-form.spec.js:12 --headed --debug
```

### Option 4: Check Screenshots and Videos

After test failure, check:

- `test-results/` directory for screenshots
- `test-results/` directory for videos (on failure)
- HTML report: `npm run report`

## Common Issues and Solutions

### Tests see index.html (welcome page) instead of form pages

**Cause:** The server is using the `-s` (SPA mode) flag, which always returns index.html for unmapped routes.

**Solution:**
1. Check `playwright.config.js` webServer command
2. Ensure it reads: `command: 'npx serve -l 3000 .'` (NO `-s` flag)
3. Also check `package.json` serve script: `"serve": "npx serve -l 3000 ."`
4. After fixing, clear any cached data: `rm -rf node_modules/.serve-cache`
5. Run tests again: `npm test`

**Why this happens:**
- The `-s` flag is for Single Page Applications with client-side routing
- Your app has multiple static HTML files that need direct serving
- With `-s`, any request to a non-existent file returns index.html
- Tests navigate to `/upload.html` but get `/` (index.html) instead

### Tests timeout waiting for elements

**Cause:** Selectors may have changed in the application

**Solution:**
1. Use UI mode to inspect element: `npm run test:ui`
2. Update selector in test or helpers
3. Check Console tab for visibility issues

**Example:**

```javascript
// Before (might be wrong selector)
await page.fill('[name="occNumber"]', 'PR123');

// After (inspect to find correct selector)
await page.fill('#occNumber', 'PR123');
```

### Draft data not persisting

**Cause:** Auto-save timeout or localStorage clearing

**Solution:**
1. Increase waitForAutoSave timeout: `await waitForAutoSave(page, 5000)`
2. Check if test clears localStorage: `clearLocalStorage(page)` in beforeEach
3. Verify form auto-saves in application

### Theme toggle not working

**Cause:** Theme button selector or attribute name changed

**Solution:**

```javascript
// Check what theme button actually looks like
const themeButton = page.locator('[id="theme-toggle"]');
console.log(await themeButton.getAttribute('class'));

// Update toggleTheme function if needed
```

### Offline tests don't work

**Cause:** Network interception may need adjustment

**Solution:**

```javascript
// Use context offline mode
await page.context().setOffline(true);
await page.context().setOffline(false);

// Or mock fetch for specific endpoints
await page.route('**/api/**', route => route.abort());
```

## Adding New Tests

### Test Template

```javascript
import { test, expect } from '@playwright/test';
import { validOfficerData } from './fixtures/test-data.js';
import { fillOfficerInfo } from './fixtures/form-helpers.js';

test.describe('Feature Name Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload.html');
    // Setup if needed
  });

  test.describe('Group of related tests', () => {
    test('Should do something specific', async ({ page }) => {
      // Arrange
      const testData = validOfficerData;

      // Act
      await fillOfficerInfo(page, testData);

      // Assert
      const nameValue = await page.locator('[name="rName"]').inputValue();
      expect(nameValue).toBe(testData.rName);
    });
  });
});
```

### Best Practices

1. **Use beforeEach for setup:**

   ```javascript
   test.beforeEach(async ({ page }) => {
     await page.goto('/upload.html');
     await clearLocalStorage(page);
     await page.reload();
   });
   ```

2. **Use test data fixtures:**

   ```javascript
   import { uploadFormValidData } from './fixtures/test-data.js';
   await fillUploadForm(page, uploadFormValidData);
   ```

3. **Use helper functions:**

   ```javascript
   await toggleTheme(page);
   const progress = await getProgressPercentage(page);
   ```

4. **Meaningful test names:**

   ```javascript
   // Good
   test('1.2.1 Email validation rejects gmail.com', async ({ page }) => {

   // Bad
   test('email test', async ({ page }) => {
   ```

5. **Test one thing per test:**

   ```javascript
   // Good - isolated tests
   test('shows error for gmail email', async ({ page }) => {
     // Test just email validation
   });

   test('shows error for short phone', async ({ page }) => {
     // Test just phone validation
   });

   // Bad - testing multiple things
   test('validates email and phone', async ({ page }) => {
     // Testing email AND phone AND other things
   });
   ```

## Performance Considerations

### Test Execution Time

- **Full suite:** ~10-15 minutes (all browsers, all tests)
- **Upload form only:** ~3-5 minutes
- **Single form headless:** ~1-2 minutes

### Speeding Up Tests

1. **Use specific project:**

   ```bash
   npm run test:chrome  # Only Chromium
   ```

2. **Run in parallel (default):**

   Tests run in parallel by default for speed

3. **Use headless (faster):**

   ```bash
   npm test  # Default, headless
   ```

4. **Run subset of tests:**

   ```bash
   npx playwright test -g "1.2"  # Only matching pattern
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -D @playwright/test
      - run: npm test
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: test-results/
```

### GitLab CI Example

```yaml
e2e_tests:
  image: mcr.microsoft.com/playwright:v1.40.0
  script:
    - npm install
    - npm test
  artifacts:
    when: on_failure
    paths:
      - test-results/
    reports:
      junit: test-results/results.xml
```

## Maintenance

### Keeping Tests Updated

When the application changes:

1. **Update test data:** Modify `fixtures/test-data.js`
2. **Update selectors:** Modify tests if DOM changed
3. **Update helpers:** Modify `fixtures/form-helpers.js` if behavior changed
4. **Run tests:** Verify changes work: `npm run test:ui`

### Regular Maintenance

- [ ] Run tests monthly to catch regressions
- [ ] Update Playwright: `npm update @playwright/test`
- [ ] Review and consolidate duplicate tests
- [ ] Archive old test failures from reports

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## Contact & Support

For test-related issues:

1. Check this README first
2. Run in UI mode: `npm run test:ui`
3. Check test results: `npm run report`
4. Review application logs for errors
5. Check browser console in headed mode

---

**Last Updated:** December 2, 2025
**Test Coverage:** 260+ automated tests
**Browsers Tested:** Chrome, Firefox, Safari (WebKit)
**Status:** Production-ready
