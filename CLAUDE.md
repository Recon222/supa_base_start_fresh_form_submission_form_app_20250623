# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Forensic Video Unit (FVU) Request System for Peel Regional Police - a vanilla JavaScript web application for submitting video evidence requests (Analysis, Upload, and Recovery). The system generates PDF/JSON files and integrates with both a legacy PHP ticketing system and Supabase.

## Development Commands

**No build process** - This is a vanilla JS project with zero npm dependencies:
- **Run locally**: VS Code Live Server (port 5503) or any static server
- **Direct access**: Open HTML files directly in browser
- **Testing**: Manual browser testing only
- **No commands**: No `npm install`, `build`, `test`, or `lint`

## Architecture

### Core Principles
- **Zero build tools**: Vanilla JS with ES6 modules only
- **File size limits**: JS max 450 lines, CSS max 550 lines  
- **Function size**: Keep under 50 lines with early returns
- **No over-engineering**: Resist adding unnecessary complexity

### Critical Integration Requirements

**Field Names** (must match third-party system exactly):
```javascript
// Required field mappings in config.js
rName                // Requesting investigator
requestingEmail      // Must be @peelpolice.ca
reqArea             // Request type: analysis/upload/recovery
occNumber           // Must start with "PR"
locationOfIncident  // Incident location
```

**Dual Integration Paths**:
1. **Supabase** (Modern): Toggle via `ENABLE_SUPABASE` in config.js
   - Project ID: `xkovwklvxvuehxpsxvwk`
   - Configured via `.mcp.json`
   
2. **PHP Endpoint** (Legacy): `rfs_request_process.php`
   - Requires HTML→PHP conversion for production
   - Add session verification: `<?php session_start(); ?>`

### Module Organization
```
assets/js/
├── config.js         # Central configuration - API endpoints, field mappings
├── form-handler.js   # Form submission orchestration
├── validators.js     # Validation rules (@peelpolice.ca emails only)
├── api-client.js     # Handles both PHP and Supabase submissions
├── pdf-generator.js  # PDFMake integration
└── storage.js        # LocalStorage for auto-save drafts
```

### Key Development Patterns

1. **Form Submission Flow**:
   - Real-time validation → PDF/JSON generation → FormData creation → API submission
   - Auto-saves drafts every 2 seconds to LocalStorage
   
2. **Error Handling**:
   ```javascript
   // Always use try-catch with proper user feedback
   try {
     await submitForm(data);
   } catch (error) {
     showNotification(error.message, 'error');
   }
   ```

3. **Security Requirements**:
   - Use `textContent` not `innerHTML`
   - Validate @peelpolice.ca emails
   - Session verification in production

### Production Deployment

1. Convert `.html` to `.php`:
   ```php
   <?php session_start(); ?>
   <input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
   ```
2. Update `API_ENDPOINT` in config.js to production URL
3. Deploy via SFTP to `homicidefvu.fatsystems.ca`

### Browser Support
ES6 modules required: Chrome 60+, Firefox 60+, Safari 11+, Edge 79+