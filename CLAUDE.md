# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FVU (Forensic Video Unit) Request System - A PWA for Peel Regional Police to submit three types of forensic video requests: Upload, Analysis, and Recovery. Each form has distinct validation rules, conditional fields, and DVR/time-handling logic.

## Development Commands

```bash
# Run dev server
npm run serve              # Starts http-server on port 3000

# Testing - Playwright E2E (260+ tests across 3 browsers)
npm test                   # Run all Playwright tests
npm run test:ui            # Interactive UI mode
npm run test:headed        # See browser windows
npm run test:debug         # Playwright Inspector
npm run test:upload        # Upload form tests only
npm run test:analysis      # Analysis form tests only
npm run test:recovery      # Recovery form tests only
npm run test:cross         # Cross-form behavior tests
npx playwright test -g "pattern"  # Run tests matching pattern

# Testing - Vitest Unit/Integration
npm run test:unit          # Run unit tests
npm run test:unit:watch    # Watch mode
npm run test:integration   # Run integration tests
npm run test:all           # Run unit + integration + e2e
npm run coverage           # Generate coverage report

# View reports
npm run report             # Open Playwright HTML report
```

## Architecture

### Form Handler Inheritance Pattern

```
FormHandler (base class - form-handler-base.js)
    ├── UploadFormHandler (form-handler-upload.js)
    ├── AnalysisFormHandler (form-handler-analysis.js)
    └── RecoveryFormHandler (form-handler-recovery.js)
```

Each form handler:
1. Extends `FormHandler` base class
2. Calls `super(formId)` which runs `init()` (before subclass fields exist)
3. Builds dynamic fields via `FormFieldBuilder`
4. Re-applies iOS keyboard fix and autofill prevention after field creation

**Known Tech Debt**: Base `init()` runs before subclass constructors build dynamic fields. Subclasses must re-call `setupKeyboardProgressBarFix()` and `configureAutofill()` after `buildInitialFields()`.

### FormFieldBuilder (form-field-builder.js)

Static class providing reusable field creation methods:
- `createTextField()`, `createTextareaField()`, `createSelectField()`
- `createDatetimeField()`, `createRadioGroup()`
- Form-specific section builders for each form type

### Key Modules

| File | Purpose |
|------|---------|
| `config.js` | All constants, validation patterns, field names, messages |
| `validators.js` | Field validation logic, phone/email/occurrence formats |
| `storage.js` | Draft save/load, session management |
| `officer-storage.js` | Cross-form officer info persistence |
| `calculations.js` | DVR retention calculations, urgency alerts |
| `utils.js` | DOM utilities, debounce, toast notifications |
| `api-client.js` | Submission with retry logic |

### HTML Structure

Each form HTML (`upload.html`, `analysis.html`, `recovery.html`) contains:
- Empty container divs with IDs like `evidence-section-container`
- FormFieldBuilder dynamically populates these containers
- Container pattern replaces static HTML with programmatic field generation

### Validation Requirements

- **Email**: Must be `@peelpolice.ca` domain
- **Phone**: Exactly 10 digits (formatting handled separately)
- **Occurrence Number**: Must start with `PR` followed by numbers
- **Conditional fields**: "Other" text fields appear when "Other" selected in dropdowns/radios

### Test Structure

```
tests/
├── *.spec.js          # Playwright E2E tests
├── unit/              # Vitest unit tests
├── integration/       # Vitest integration tests
├── fixtures/
│   ├── test-data.js   # Reusable test data
│   └── form-helpers.js # Helper functions
└── setup/             # Vitest setup files
```

## Configuration

- **Vitest**: `vitest.config.js` - Uses happy-dom, coverage thresholds at 80%
- **Playwright**: `playwright.config.js` - Tests against Chromium, Firefox, WebKit
- **App Config**: `assets/js/config.js` - All constants centralized here

## External Dependencies

- `pdfmake` - PDF generation (in `/lib`)
- `flatpickr` - Date/time pickers (in `/lib`)
- Supabase integration (toggleable via `CONFIG.USE_SUPABASE`)
