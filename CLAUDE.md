# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Forensic Video Unit Request System for Peel Regional Police with three request forms:
- **analysis.html** - Video analysis requests (enhancement, comparison, timeline creation)
- **upload.html** - Evidence upload requests
- **recovery.html** - On-site DVR recovery requests

## Development Commands
- **Run locally**: Use VS Code Live Server (port 5502) or any static web server
- **No build process**: Files are served directly as ES6 modules
- **Testing**: Manual testing only - no test framework configured

## Architecture & Structure

### JavaScript Modules (assets/js/)
- `form-handler.js` - Base FormHandler class for form lifecycle
- `validators.js` - Field validation logic
- `config.js` - API endpoints, patterns, field mappings
- `pdf-generator.js` & `pdf-templates.js` - Client-side PDF generation
- `json-generator.js` - JSON file creation from forms
- `storage.js` - Local storage for drafts
- `api-client.js` - Form submission to PHP endpoint
- `utils.js` - DOM helpers, toast notifications
- `calculations.js` - Business logic calculations

### Key Development Rules
- **No over-engineering**: No React/Vue, no bundlers, no state management
- **File size limits**: JS files max 400 lines, CSS max 500 lines
- **Use ES6 modules** directly in browser
- **Security**: Sanitize all input, use textContent not innerHTML
- **Validation**: Real-time with visual feedback (green/red borders)

### Field Naming (MUST match third-party system)
```javascript
rName              // Requesting officer name
requestingEmail    // Officer email (@peelpolice.ca only)
requestingPhone    // Officer phone
reqArea           // Request type
fileDetails       // File information
rfsDetails        // Request details
occType           // Occurrence type
occDate           // Occurrence date
```

### Form Features
- Draft auto-save functionality
- Client-side PDF and JSON generation
- Progress tracking for required fields
- Conditional field visibility
- Session timeout warnings

### Deployment Process
1. Develop with HTML files locally
2. Convert to PHP for production (add session management)
3. Deploy via SFTP to homicidefvu.fatsystems.ca
4. Configure API endpoints in config.js

### Important Patterns
- Forms submit to `rfs_request_process.php` with PDF/JSON attachments
- Use FormData for multipart submissions
- CSRF protection added during PHP conversion
- DVR passwords are plain text fields (not sensitive)
- Email validation restricted to @peelpolice.ca domain