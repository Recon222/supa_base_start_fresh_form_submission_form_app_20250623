# FVU Forms Integration - Complete Project Blueprint

## Project Overview

### What We're Building
A forensic video request system for Peel Regional Police that:
1. Provides 3 types of request forms (Analysis, Upload, Recovery)
2. Generates PDF and JSON files from form submissions
3. Integrates with a third-party PHP ticketing system
4. Replaces an overengineered system with a simple, maintainable solution

### The Journey
- **Started with**: Over-engineered system with pub/sub, state management, service layers
- **Refactored to**: Oversimplified system with security issues and 2000+ line CSS file
- **Now building**: Professional, secure, maintainable system that's appropriately simple

### Key Constraints
- Must integrate with existing PHP ticketing system
- Files deployed via SFTP to their server
- Must use their specific field names
- Must include PHP session-based CSRF protection
- PDF/JSON files attached to form submission (not downloaded)

## Architecture Decisions

### What We're NOT Doing
- ❌ No React/Vue (unnecessary complexity)
- ❌ No build process (direct deployment via SFTP)
- ❌ No state management libraries
- ❌ No proxy servers
- ❌ No field mapping (using their field names directly)

### What We ARE Doing
- ✅ Clean, modular JavaScript (ES6 modules)
- ✅ HTML files for development, convert to PHP for deployment
- ✅ Organized CSS (300-400 lines max)
- ✅ Client-side PDF generation with PDFMake
- ✅ Direct form submission to their endpoint
- ✅ Proper security practices

### Development Workflow Benefits
- No local PHP server needed (XAMPP, MAMP, etc.)
- Can open files directly in browser during development
- All JavaScript functionality works locally
- Only need PHP for final deployment
- Faster development cycle

## Complete File Structure

### Development Structure (Local)
```
project-folder/
├── index.html                         # Landing page with 3 form options
├── analysis.html                      # Analysis request form
├── upload.html                        # Upload request form
├── recovery.html                      # Recovery request form
├── assets/
│   ├── css/
│   │   └── forms.css                 # All styles (organized, ~400 lines)
│   ├── js/
│   │   ├── config.js                 # All constants and configuration
│   │   ├── form-handler.js           # Core form logic (~400 lines)
│   │   ├── validators.js             # Validation rules (~200 lines)
│   │   ├── calculations.js           # Business logic (~200 lines)
│   │   ├── pdf-generator.js          # PDF generation engine (~200 lines)
│   │   ├── pdf-templates.js          # PDF layouts (~400 lines)
│   │   ├── json-generator.js         # JSON generation (~50 lines)
│   │   └── utils.js                  # Shared utilities (~100 lines)
│   └── images/
│       └── logo.png                  # PRP logo for PDFs
└── lib/
    └── pdfmake.min.js                # PDFMake library
    └── vfs_fonts.js                  # PDFMake fonts
```

### Production Structure (On Their Server)
```
homicidefvu.fatsystems.ca/
├── index.php                          # Landing page (converted from .html)
├── analysis.php                       # Analysis form (converted from .html)
├── upload.php                         # Upload form (converted from .html)
├── recovery.php                       # Recovery form (converted from .html)
└── [same assets structure as above]
```

## Component Interactions

```
User fills form
    ↓
FormHandler validates input
    ↓
On submit:
    ├── Generate PDF (pdf-generator + pdf-templates)
    ├── Generate JSON (json-generator)
    └── Create FormData with:
        ├── Their field names (rName, requestingEmail, etc.)
        ├── fileAttachmentA (PDF)
        ├── fileAttachmentB (JSON)
        └── session_verify (PHP session ID)
    ↓
POST to rfs_request_process.php
    ↓
Handle response (success/error)
```

## Field Naming Convention

Using their exact field names throughout:
- `rName` - Requesting officer name
- `requestingEmail` - Officer email
- `requestingPhone` - Officer phone
- `reqArea` - Request type/area
- `fileDetails` - File information
- `rfsDetails` - Request details
- `occType` - Occurrence type
- `occDate` - Occurrence date

Fields not in their system return `null` or empty string.

## Security Implementations

### Fixed from Previous Version
1. **~~No passwords in localStorage~~** - DVR passwords are NOT sensitive - just text fields for on-site access
2. **Input sanitization** - All user input escaped before DOM insertion
3. **CSRF protection** - PHP session verification
4. **XSS prevention** - No string concatenation for HTML
5. **Secure file handling** - Blob generation in memory only

### Important: DVR Password Clarification
The password field in the Recovery form is NOT a user authentication password. It's simply the DVR password that officers need when they arrive on-site. This should be:
- Stored as plain text
- Displayed on the PDF
- Treated like any other form field
- NOT encrypted or specially protected

### Session Management
```php
<?php session_start(); ?>
<input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
```

## JavaScript Architecture

### config.js
```javascript
export const CONFIG = {
  API_ENDPOINT: 'rfs_request_process.php',
  MAX_FILE_SIZE: 10485760, // 10MB
  DRAFT_EXPIRY_DAYS: 7,
  
  VALIDATION_PATTERNS: {
    PHONE: /^\d{3}-\d{3}-\d{4}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    CASE_NUMBER: /^\d{4}-\d{6}$/,
    BADGE: /^[A-Z0-9]{4,10}$/
  },
  
  FIELD_NAMES: {
    OFFICER_NAME: 'rName',
    OFFICER_EMAIL: 'requestingEmail',
    OFFICER_PHONE: 'requestingPhone',
    REQUEST_AREA: 'reqArea',
    FILE_DETAILS: 'fileDetails',
    REQUEST_DETAILS: 'rfsDetails',
    OCCURRENCE_TYPE: 'occType',
    OCCURRENCE_DATE: 'occDate'
  }
};
```

### FormHandler Pattern
```javascript
export class FormHandler {
  constructor(formType, formElement) {
    this.formType = formType;
    this.form = formElement;
    this.setupEventListeners();
    this.loadDraft();
  }
  
  async submit() {
    if (!this.validate()) return;
    
    const formData = this.collectData();
    const submission = await this.prepareSubmission(formData);
    
    try {
      const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        body: submission
      });
      
      const result = await response.json();
      this.handleResponse(result);
    } catch (error) {
      this.handleError(error);
    }
  }
}
```

## CSS Organization

```css
/* forms.css - Organized sections */

/* 1. Variables & Reset */
:root {
  --primary: #0066ff;
  --danger: #dc3545;
  /* ... all variables ... */
}

/* 2. Base Styles */
*, *::before, *::after { box-sizing: border-box; }

/* 3. Typography */
h1, h2, h3 { /* ... */ }

/* 4. Form Components */
.form-control { /* ... */ }
.form-label { /* ... */ }

/* 5. Buttons */
.btn { /* ... */ }
.btn-primary { /* ... */ }

/* 6. Layout */
.container { /* ... */ }
.form-section { /* ... */ }

/* 7. Utilities */
.text-danger { color: var(--danger); }
.mb-3 { margin-bottom: 1rem; }

/* 8. Responsive */
@media (max-width: 768px) { /* ... */ }
```

## Form-Specific Features

### Analysis Form
- Job type selection (clarification, comparison, timeline, etc.)
- File location options (evidence.com, network, locker)
- Request details textarea
- Officer in charge fields

### Upload Form
- Evidence bag number
- Media type selection
- DVR retention date with days calculation
- Multiple locations checkbox
- Business/location information

### Recovery Form
- Time offset calculator (when DVR time incorrect)
- Camera information fields
- Username/password for DVR access (NOTE: Just text fields for on-site access, not secure passwords)
- Extraction time periods
- Incident description

## PDF Generation Strategy

1. **Single generator engine** (pdf-generator.js)
2. **Form-specific templates** (pdf-templates.js)
3. **Professional formatting**:
   - Official headers with logo
   - Clear sections
   - Status indicators (urgent/expired)
   - Consistent styling
   - Timestamp and metadata

## JSON Structure

```json
{
  "metadata": {
    "formType": "analysis|upload|recovery",
    "version": "1.0",
    "generated": "2024-01-20T15:30:00Z",
    "generator": "FVU Request System"
  },
  "formData": {
    "rName": "Smith",
    "requestingEmail": "smith@peelpolice.ca",
    "...": "all form fields"
  },
  "calculations": {
    "retentionDays": "5 days",
    "timeOffset": "DVR is 2 hours AHEAD",
    "videoDuration": "00:45:00"
  }
}
```

## Development Process

### Local Development
1. **Develop using .html files** - No PHP server needed locally
2. **Test all functionality** - Everything works except actual submission
3. **Use placeholder for session** - Can hardcode a test value during development

### HTML to PHP Conversion (At Deployment)
When ready to deploy, convert each HTML file:

**From (development):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Analysis Request</title>
</head>
<body>
    <form id="analysis-form">
        <!-- form fields -->
    </form>
</body>
</html>
```

**To (production):**
```php
<?php session_start(); ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Analysis Request</title>
</head>
<body>
    <form id="analysis-form">
        <input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
        <!-- form fields -->
    </form>
</body>
</html>
```

Only 2 changes needed:
1. Add `<?php session_start(); ?>` at the very top
2. Add the hidden session field to the form

## Deployment Process

1. Connect via SFTP to their server
2. Upload all files maintaining directory structure
3. Ensure PHP files have correct permissions
4. Test forms on their domain
5. Verify session management works
6. Test submission to their processor

## Error Handling Strategy

1. **Client-side validation** - Immediate feedback
2. **Network errors** - Save draft, clear retry message
3. **Server errors** - Display specific error from API
4. **Success handling** - Clear form, show ticket number

## Browser Support

- Modern browsers only (ES6 modules)
- Chrome 60+, Firefox 60+, Safari 11+, Edge 79+
- No IE11 support (not needed for internal tool)

## Testing Checklist

- [ ] All forms submit successfully
- [ ] PDFs generate correctly for each form type
- [ ] JSON includes all necessary data
- [ ] Session verification works
- [ ] Error messages display properly
- [ ] Drafts save and load correctly
- [ ] Sensitive data cleared after submission
- [ ] Mobile responsive design works
- [ ] Calculations (retention, time offset) are accurate

## Future Considerations

If needed later (but not now):
- Offline queue for submissions
- Bulk upload functionality
- Admin dashboard (handled by their system)
- API rate limiting (if they implement it)

## Summary

This blueprint provides a professional, maintainable system that:
- Meets all integration requirements
- Fixes previous security issues
- Remains appropriately simple
- Can be built in ~1 week
- Is easy to maintain and modify

The key principle: **Only add complexity where it provides clear value**. This system is exactly as complex as it needs to be - no more, no less.