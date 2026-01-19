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

### Header Component (JS-Injected)

Unlike the rest of the UI which uses inline HTML, the header is dynamically injected via JavaScript. This allows a single source of truth for the header across all forms.

**Usage in form HTML:**
```html
<script type="module">
  import { initHeader } from './assets/js/header-component.js';
  initHeader('Form Title');
</script>
```

**Important:** The header requires a `.background-animation` element to exist in the DOM - it injects itself immediately after this element. The build script converts `.html` links to `.php` in the header for production.

### Form Handler Hierarchy
```
FormHandler (form-handler-base.js)     # Base class: validation, drafts, progress, submission
  ├── UploadFormHandler                # Extends: add/remove locations, DVR retention calc
  ├── AnalysisFormHandler              # Extends: conditional "Other" fields
  └── RecoveryFormHandler              # Extends: multi-DVR systems, time frames per DVR
```

### Key Modules (`assets/js/`)
- `config.js` - All configuration constants (frozen objects)
- `validators.js` - Field validation with patterns from config
- `storage.js` - Draft auto-save (localStorage, 2s debounce)
- `officer-storage.js` - Persistent investigator info across forms
- `api-client.js` - Submission logic (see below)
- `pdf-generator.js` / `pdf-templates.js` - Uses pdfmake (`lib/pdfmake.min.js`)
- `supabase.js` - Supabase integration (toggle via `CONFIG.USE_SUPABASE`)

### API Client (`api-client.js`)

Handles form submission with:
- **Retry logic**: Exponential backoff (1s, 2s, 4s), max 3 attempts
- **Smart retry**: Skips retry for 4xx client errors (validation failures)
- **Dual path**: Routes to Supabase or PHP based on `CONFIG.USE_SUPABASE`
- **File attachments**: PDF as `fileAttachmentA`, JSON as `fileAttachmentB`
- **Dev mode**: Mock submission with simulated delay and random success/failure
- **Error handling**: Custom `APIError` class, offline detection, timeout handling

**Third-party field mapping (Phil's FAT system):**

Field mappings happen in two places:
1. **Form handlers** (`collectFormData()`) - field renames, flattening nested data (e.g., Recovery flattens first DVR to root level)
2. **api-client.js** - ID lookups and hardcoded values

Key mappings in api-client.js:
```javascript
// requestDetails → rfsDetails (field rename)
formData.rfsDetails = formData.requestDetails

// occType → fat_occTypes table
'homicide' → '1'
'missing person' → '2'

// reqArea → fat_servicing table (always 36 = "Homicide and Missing Persons")
formData.reqArea = '36'

// ticketStatus → fat_rfs_types table
'analysis' → '1'  // Video Analysis
'recovery' → '2'  // Video Extraction
'upload' → '4'    // Video Upload

// rfsHeader (File Desc)
'upload' → 'FVU Upload Request'
'analysis' → 'FVU Analysis Request'
'recovery' → 'FVU Recovery Request'
```

### fileDetails Generation

Each form handler implements `generateFileDetails(data)` which creates a structured text summary sent to Phil's FAT system. This is the primary human-readable description of the request.

**Architecture:**
- Each form handler overrides `generateFileDetails()` with form-specific logic
- Called during `collectFormData()` before submission
- Output is a multi-line formatted string with section headers

**Format pattern:**
```
========================================
         VIDEO EVIDENCE UPLOAD REQUEST
========================================
=== EVIDENCE ===
Occurrence: PR12345
Evidence Bag: 123456
Media Type: USB

=== INVESTIGATOR ===
Name: John Smith (Badge: 1234)
Phone: 905-555-1234
Email: john.smith@peelpolice.ca

=== LOCATION 1 ===
Business: Example Store
Address: 123 Main St, Mississauga
Video Period: Dec 15, 2025 10:00 to Dec 15, 2025 14:00
...
```

Each form type has different sections (Upload has locations, Recovery has DVR systems with time frames, Analysis has video source info).

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

## Deployment

| Task            | Status                                                            |
|-----------------|-------------------------------------------------------------------|
| VM SSH access   | `ssh -p 2211 fvuadmin@72.142.23.10`                               |
| SFTP to Phil    | `sftp -P 2109 peeluploader@3.96.182.77`                           |
| Build script    | Handles: .html→.php, lib/, supabase removal, header links, PWA    |
| Deploy workflow | Build → SCP to VM → SSH to VM → SFTP to Phil's /intake/           |

**When ready to redeploy:**

1. Build:
   ```powershell
   .\scripts\build-php.ps1
   ```

2. SCP to VM (from local Windows machine):
   ```cmd
   scp -P 2211 -r "deploy\*" fvuadmin@72.142.23.10:/var/www/fvu/
   ```

3. SSH into VM:
   ```cmd
   ssh -p 2211 fvuadmin@72.142.23.10
   ```

4. SFTP to Phil's server (from VM):
   ```bash
   sftp -P 2109 peeluploader@3.96.182.77
   cd intake
   put /var/www/fvu/index.php
   put /var/www/fvu/upload.php
   put /var/www/fvu/analysis.php
   put /var/www/fvu/recovery.php
   put /var/www/fvu/manifest.json
   put /var/www/fvu/sw.js
   put -r /var/www/fvu/lib
   put -r /var/www/fvu/assets
   ```

**Note:** The `assets/` folder includes PWA icons (`assets/images/icons/`) and iOS splash screens (`assets/images/splash/`).

## MCP Integration

This project has Supabase MCP configured for database operations during development. The MCP server provides direct database access for debugging and data inspection.
