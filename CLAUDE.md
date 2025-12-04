# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FVU (Forensic Video Unit) Request System for Peel Regional Police. A static HTML/JavaScript form application with three form types:
- **Analysis** (`analysis.html`) - Request in-office video analysis
- **Upload** (`upload.html`) - Submit video evidence for processing
- **Recovery** (`recovery.html`) - Request on-site DVR video recovery (most complex - supports multiple DVR systems with independent time frames)

## Commands

### Development
```bash
npm run serve          # Start local server on port 3000
```

### Testing (Playwright e2e - 260+ tests)
```bash
npm test               # Run all tests across all browsers
npm run test:ui        # Interactive UI mode for debugging
npm run test:headed    # See browser windows during tests
npm run test:debug     # Use Playwright Inspector

# Single form tests
npm run test:upload    # Upload form only
npm run test:analysis  # Analysis form only
npm run test:recovery  # Recovery form only
npm run test:cross     # Cross-form behavior tests

# Single browser
npm run test:chrome    # Chromium only
npm run test:firefox   # Firefox only
npm run test:safari    # WebKit only

# Pattern matching
npx playwright test -g "1.2"  # Tests matching pattern
npm run report         # View HTML test report
```

### Production Build
```powershell
.\scripts\build-php.ps1   # Converts HTML to PHP, outputs to deploy/
```

## Architecture

### Form Handler Hierarchy
```
FormHandler (form-handler-base.js)     # Base class: validation, drafts, progress, submission
  ├── UploadFormHandler                # Extends: add/remove locations, DVR retention calc
  ├── AnalysisFormHandler              # Extends: conditional "Other" fields
  └── RecoveryFormHandler              # Extends: multi-DVR systems, time frames per DVR
```

### Key Modules (`assets/js/`)
- `config.js` - All configuration constants (frozen objects)
- `header-component.js` - Reusable header with `initHeader(formTitle)`, fixed positioning, theme toggle, draft button
- `validators.js` - Field validation with patterns from config
- `storage.js` - Draft auto-save (localStorage, 2s debounce)
- `officer-storage.js` - Persistent investigator info across forms
- `api-client.js` - Submission with retry logic
- `pdf-generator.js` / `pdf-templates.js` - Uses pdfmake (`lib/pdfmake.min.js`)
- `supabase.js` - Supabase integration (toggle via `CONFIG.USE_SUPABASE`)

### Dual Backend Support
- **Supabase**: Set `USE_SUPABASE: true` in config.js (default for development)
- **PHP**: Set `USE_SUPABASE: false`, submits to `rfs_request_process.php`

The build script automatically sets `USE_SUPABASE: false` for production.

### Validation Patterns
- Email: `@peelpolice.ca` domain required
- Phone: 10 digits (formatting handled separately)
- Occurrence: Must start with `PR` followed by numbers

## Test Infrastructure

- Config: `playwright.config.js` - Multi-browser, auto-starts http-server
- Test data: `tests/fixtures/test-data.js`
- Helpers: `tests/fixtures/form-helpers.js` (fillOfficerInfo, addDVRSystem, etc.)
- Server: Uses `http-server` (NOT `serve`) to avoid SPA routing issues

## Form Features

All forms share:
- Auto-save drafts (2s debounce, 7-day expiry)
- Progress bar with color coding (red→yellow→green)
- Theme toggle (dark/light, persists via localStorage)
- Officer info persistence across forms and sessions
- PDF generation on submission

## Feature Flags (`config.js` → `CONFIG.FEATURES`)

- `BROWSER_AUTOFILL` - Controls browser autofill suggestions (default: `false` for production)
