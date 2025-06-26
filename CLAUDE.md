# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the Forensic Video Unit (FVU) Request System for Peel Regional Police - a vanilla JavaScript web application that allows investigators to submit three types of video evidence requests: Analysis, Upload, and Recovery. The system generates PDF and JSON files from form submissions and integrates with a third-party PHP ticketing system.

## Development Commands

This project has no build process or npm dependencies. To develop:

1. **Run locally**: Use VS Code Live Server (port 5502) or any static web server
2. **Open directly**: HTML files can be opened directly in browser for development
3. **No build/test commands**: Pure vanilla JS with no build tooling

## Architecture

### Core Principles
- **No framework/build tools**: Vanilla JS with ES6 modules only
- **Appropriately simple**: Avoid over-engineering
- **File size limits**: JS files max 450 lines, CSS files max 550 lines
- **Function clarity**: Keep functions under 50 lines with early returns

### Module Structure
```
assets/js/
├── config.js         # Central configuration (API endpoints, field mappings)
├── form-handler.js   # Core form submission and validation orchestration
├── validators.js     # Field validation rules and error messaging
├── pdf-generator.js  # PDF generation using PDFMake
├── storage.js        # LocalStorage management for drafts and user data
├── ui-effects.js     # Visual effects (3D tilts, animations)
├── theme.js          # Dark/light theme toggle
└── utils.js          # Shared utility functions
```

### Form Submission Flow
1. Real-time validation with visual feedback
2. Client-side PDF/JSON generation on submit
3. FormData creation with attachments
4. POST to `rfs_request_process.php`
5. Clear form and show success on completion

### Field Naming Convention
The third-party system requires specific field names:
- `rName` - Requesting investigator name
- `requestingEmail` - Email (@peelpolice.ca only)
- `reqArea` - Request type (analysis/upload/recovery)
- `locationOfIncident` - Incident location
- Other fields follow similar patterns

### Production Deployment
1. Convert HTML to PHP by adding session management:
   ```php
   <?php session_start(); ?>
   <input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
   ```
2. Update API endpoint in config.js
3. Deploy via SFTP to production server

### Security Considerations
- Always sanitize user input
- Use `textContent` instead of `innerHTML`
- Validate email domain (@peelpolice.ca)
- Session verification in production

### Browser Support
Modern browsers only (ES6 modules required):
- Chrome 60+, Firefox 60+, Safari 11+, Edge 79+
- No IE11 support