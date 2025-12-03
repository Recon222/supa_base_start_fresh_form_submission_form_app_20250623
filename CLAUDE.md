# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Forensic Video Unit (FVU) Request System for Peel Regional Police - a vanilla JavaScript web application for submitting video evidence requests. The system handles three types of requests (Analysis, Upload, Recovery), generates PDF/JSON artifacts, and integrates with both Supabase and a legacy PHP ticketing system.

## Development Commands

**No build process for development** - This is a vanilla JS project with zero npm dependencies:
- **Run locally**: VS Code Live Server or any static HTTP server
- **Testing**: `npx playwright test` (Playwright tests available)
- **Build for production**: `.\scripts\build-php.ps1` (see Production Deployment below)

## Architecture Overview

### Core Design Principles

1. **Zero build tools**: Vanilla JS with ES6 modules only
2. **File size discipline**: JS max 450 lines, CSS max 550 lines
3. **Function size**: Keep under 50 lines with early returns
4. **No over-engineering**: Resist adding unnecessary complexity

### Dual Integration System

The application supports two submission backends (toggle via `CONFIG.USE_SUPABASE` in config.js):

**Supabase (Modern Path)**:
- Project: `xkovwklvxvuehxpsxvwk.supabase.co`
- Configured via `.mcp.json` for MCP server integration
- Stores submissions with base64-encoded PDF/JSON attachments
- Dashboard at `dashboard/fvu-admin-dashboard.html`

**PHP Endpoint (Legacy Path)**:
- Endpoint: `rfs_request_process.php`
- Requires conversion to `.php` files in production
- Session verification via `<?php session_start(); ?>`
- Deployed to `homicidefvu.fatsystems.ca` via SFTP

### Module Organization

```
assets/js/
├── config.js              # Central configuration, field mappings, constants
├── form-handler.js        # Base FormHandler + 3 form-specific handlers (Upload, Analysis, Recovery)
├── validators.js          # Validation rules (@peelpolice.ca emails, phone, dates)
├── api-client.js          # Submission logic for both Supabase and PHP
├── supabase.js            # Supabase client initialization and helpers
├── pdf-generator.js       # PDF generation via PDFMake
├── pdf-templates.js       # PDF layout templates for each form type
├── json-generator.js      # JSON artifact generation
├── storage.js             # LocalStorage for draft auto-save
├── officer-storage.js     # Persistent investigator info storage
├── notifications.js       # Toast notifications + confirmation modals
├── theme-manager.js       # Dark/light theme toggle
├── calculations.js        # Field calculations (retention days, summaries)
├── utils.js               # DOM helpers, debounce, scrolling
└── dashboard-supabase.js  # Admin dashboard data fetching
```

### Critical Integration Requirements

**PHP Ticketing System Field Mapping** (must match third-party system exactly):

| PHP Field | Our Form Field | Value |
|-----------|----------------|-------|
| `fileNr` | `occNumber` | Mapped in collectFormData() |
| `rName` | `rName` | Direct field |
| `requestingEmail` | `requestingEmail` | Direct field, must be @peelpolice.ca |
| `requestingPhone` | `requestingPhone` | Direct field, 10 digits |
| `reqArea` | `city` | City dropdown value (Brampton, Mississauga, etc.) |
| `fileDetails` | Generated | Summary string from generateFieldSummaries() |
| `rfsDetails` | Generated | Request details from form data |

**Note**: The JavaScript `collectFormData()` in each form handler maps our field names to the PHP system's expected names. Do NOT change the mapping without coordinating with the third-party system.

**Supabase Schema**:
```sql
-- Table: form_submissions
id                  UUID PRIMARY KEY
request_type        TEXT (analysis/upload/recovery)
form_data           JSONB (entire form data)
requesting_email    TEXT (indexed)
requesting_name     TEXT
occurrence_number   TEXT
status              TEXT (pending/complete)
attachments         JSONB (array of {type, filename, data, size})
submitted_at        TIMESTAMP WITH TIME ZONE
```

### Form Submission Flow

1. **Real-time Validation**: Validators check fields on blur/input
2. **Auto-save Drafts**: Every 2 seconds to LocalStorage (`fvu_draft_{formType}`)
3. **Officer Info Persistence**: Name, badge, phone, email saved across sessions
4. **PDF/JSON Generation**: Parallel generation on submit
5. **Dual Submission**: Routes to Supabase OR PHP based on `CONFIG.USE_SUPABASE`
6. **Progress Tracking**: Live progress bar updates as fields are completed

### Form Handler Class Hierarchy

```javascript
FormHandler (base class)
├── UploadFormHandler
│   └── Dynamic location-video groups (add/remove)
├── AnalysisFormHandler
│   └── Conditional fields (offence type, video location, service required)
└── RecoveryFormHandler
    └── DVR system info, extraction times, camera details
```

Each form handler:
- Extends `FormHandler` base class
- Implements `setupSpecificListeners()` for conditional fields
- Overrides `collectFormData()` to structure form-specific data
- Overrides `submitForm()` for custom submission logic

### Key Development Patterns

**Conditional Field Management**:
```javascript
// Pattern used across all forms
selectField.addEventListener('change', (e) => {
  const showOther = e.target.value === 'Other';
  toggleElement(otherGroup, showOther);
  if (showOther) {
    otherField.setAttribute('required', 'required');
  } else {
    otherField.removeAttribute('required');
    otherField.value = '';
    this.showFieldValidation(otherField, null);
  }
});
```

**Error Handling Pattern**:
```javascript
// Always use try-catch with user feedback
try {
  await submitForm(data);
} catch (error) {
  showToast(error.message, 'error');
  // Auto-save draft on error
  this.saveDraftAuto();
}
```

**Security Requirements**:
- Always use `textContent` not `innerHTML` for user data
- Validate `@peelpolice.ca` emails strictly
- Phone numbers must be exactly 10 digits
- Occurrence numbers must match `/^PR\d+$/i`

### Production Deployment

**For PHP endpoint deployment** (use the build script):

```powershell
# From project root:
.\scripts\build-php.ps1
```

The build script automatically:
1. Converts `.html` files to `.php` in `deploy/` folder
2. Adds `<?php session_start(); ?>` to top of each file
3. Adds `session_verify` hidden field to each form
4. Sets `CONFIG.USE_SUPABASE = false` in config.js
5. Excludes development files (dashboard-supabase.js, supabase.js)
6. Creates `DEPLOY_INFO.txt` with build details

**Deployment workflow**:
```
Development:  Edit .html → Test in browser → Commit changes
Production:   Run build script → SFTP deploy/ folder → Test on server
```

**Deploy folder structure**:
```
deploy/
├── index.php
├── upload.php
├── analysis.php
├── recovery.php
├── assets/css/
├── assets/js/    (no Supabase files)
└── DEPLOY_INFO.txt
```

**For Supabase deployment** (development/testing only):
1. Ensure `CONFIG.USE_SUPABASE = true` in source config.js
2. Deploy HTML files as static site
3. Dashboard at `dashboard/fvu-admin-dashboard.html`

### Dashboard System

The admin dashboard (`dashboard/fvu-admin-dashboard.html`) provides:
- Real-time submission viewing from Supabase
- Filter by request type, date range, status
- View full form data and attachments
- Download PDF/JSON artifacts
- Update submission status

Dashboard implementation in `assets/js/dashboard-supabase.js` uses:
- Supabase client for data fetching
- Real-time subscription to form_submissions table
- Base64 decoding for attachment preview/download

### LocalStorage Keys

```
fvu-theme                          # User's theme preference (dark/light)
fvu_draft_upload                   # Upload form draft
fvu_draft_analysis                 # Analysis form draft
fvu_draft_recovery                 # Recovery form draft
fvu_officer_info                   # Investigator info (name, badge, phone, email)
fvu_officer_storage_acknowledged   # First-time storage notice shown
fvu_session_start                  # Session start timestamp
```

### Browser Support

ES6 modules required: Chrome 60+, Firefox 60+, Safari 11+, Edge 79+

### File Size Constraints

When editing existing files, respect these limits to maintain code organization:
- JavaScript: Max 450 lines per file
- CSS: Max 550 lines per file
- Functions: Target ~30-50 lines, use early returns

If a file exceeds limits, consider extracting utilities to a new module.

## Common Tasks

### Adding a New Form Field

1. Add field to HTML form with proper `name` attribute
2. If conditional, add listener in form handler's `setupSpecificListeners()`
3. Add validation rule to `validators.js` if needed
4. Update `collectFormData()` if field needs transformation
5. Update PDF template in `pdf-templates.js`
6. Update JSON structure in `json-generator.js`

### Modifying PDF Output

PDF templates are in `assets/js/pdf-templates.js`:
- `generateUploadPDF()` - Upload form template
- `generateAnalysisPDF()` - Analysis form template
- `generateRecoveryPDF()` - Recovery form template

Each template uses PDFMake's document definition format.

### Changing Theme Styles

Theme variables are in `assets/css/forms.css`:
```css
[data-theme="dark"] {
  --color-primary: #1B3A6B;
  --color-secondary: #FFD100;
  /* ... */
}

[data-theme="light"] {
  --color-primary: #2B5AA8;
  /* ... */
}
```

### Testing Supabase Integration

1. Ensure `.mcp.json` has correct project reference
2. Use dashboard to verify submissions appear
3. Check browser console for Supabase client errors
4. Verify `form_submissions` table structure matches schema

### Debugging Form Validation

1. Check browser console for validation errors
2. Inspect `CONFIG.VALIDATION_PATTERNS` in config.js
3. Test `validateField()` in validators.js
4. Look for `.is-invalid` classes on fields
5. Check `.invalid-feedback` elements for error messages
