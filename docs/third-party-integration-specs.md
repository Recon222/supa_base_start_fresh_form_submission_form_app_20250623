# Third-Party Integration Specifications - Detailed Requirements

## Overview
This document contains EVERYTHING needed to integrate with the third-party ticketing system at homicidefvu.fatsystems.ca. Follow these specifications exactly.

## Server Access & Deployment

### SFTP Access
- **What they need from you**: Your IP address or IP block for whitelisting
- **What they'll provide**: SFTP credentials to upload files
- **Where files go**: Directly on their server (homicidefvu.fatsystems.ca)
- **File permissions**: Standard web-readable (644 for files, 755 for directories)

## File Requirements

### Development vs Production Files

#### During Development (Local)
- Use `.html` files for all forms
- No PHP server required
- Can test everything except final submission
- For testing submission handling, mock the response

#### For Production (Their Server)
- Convert `.html` files to `.php` files
- Add PHP session code (see below)
- Upload via SFTP

### File Extension Conversion
```
Development          →  Production
index.html          →  index.php
analysis.html       →  analysis.php
upload.html         →  upload.php
recovery.html       →  recovery.php
```

### PHP Conversion Process
Converting from HTML to PHP requires exactly 2 changes:

1. **Add to very top of file (line 1):**
```php
<?php session_start(); ?>
```

2. **Add inside your <form> tag:**
```html
<input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
```

That's it! Everything else remains pure HTML/CSS/JavaScript.

## Form Setup Requirements

### 1. Session Verification Field (MANDATORY)
Every form MUST include this hidden field:
```html
<input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
```

### 2. Form Configuration
```html
<form id="yourFormId" action="" method="POST">
    <!-- action="" is fine - we'll handle submission via JavaScript -->
    <input type="hidden" name="session_verify" value="<?php echo session_id(); ?>">
    <!-- Rest of your form fields -->
</form>
```

### 3. File Attachment Fields
The form submission MUST include exactly these two files:
- **fileAttachmentA**: The PDF file
- **fileAttachmentB**: The JSON file

## Required Form Fields

These fields MUST be present and NOT empty in every submission:

| Field Name | Description | Example Value |
|------------|-------------|---------------|
| `rName` | Requesting officer's name | "Smith" or "John Smith" |
| `requestingEmail` | Officer's email | "smith@peelpolice.ca" |
| `requestingPhone` | Officer's phone | "905-555-1234" |
| `reqArea` | Type of request | "analysis", "upload", or "recovery" |
| `fileDetails` | Details about files | Can be form-specific info |
| `rfsDetails` | Request details | The main request description |
| `occType` | Type of occurrence | "Homicide", "Robbery", etc. |
| `occDate` | Date of occurrence | "2024-01-20" |

## JavaScript Submission Handler

### Exact Implementation Pattern
```javascript
document.getElementById('yourFormId').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable submit button
    const submitButton = e.target.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    // Create FormData
    const formData = new FormData(e.target);
    
    // Add generated files
    const pdfBlob = await generatePDF(/* your data */);
    const jsonBlob = await generateJSON(/* your data */);
    
    formData.append('fileAttachmentA', pdfBlob, 'request_' + Date.now() + '.pdf');
    formData.append('fileAttachmentB', jsonBlob, 'request_' + Date.now() + '.json');
    
    try {
        const response = await fetch('rfs_request_process.php', {
            method: 'POST',
            body: formData // FormData automatically handles multipart encoding
        });
        
        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (jsonError) {
            // Handle non-JSON response
            console.error('Non-JSON response:', responseText);
            alert('Server error: Invalid response format');
            return;
        }
        
        if (data.success) {
            alert('Success! Ticket #: ' + data.ticketNumber);
            // Clear form, etc.
        } else {
            alert('Error: ' + data.message);
            if (data.fields) {
                console.error('Missing fields:', data.fields);
            }
        }
        
    } catch (err) {
        console.error('Network error:', err);
        alert('Network error: ' + err.message);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
    }
});
```

## Server Response Format

### Success Response
```json
{
    "success": true,
    "message": "Ticket created successfully",
    "ticketNumber": "2024-123456"
}
```

### Error Response
```json
{
    "success": false,
    "message": "Missing required fields",
    "fields": ["rName", "occDate"]  // Which fields were missing
}
```

### Session Error
```json
{
    "success": false,
    "message": "Invalid session"
}
```

## Server-Side Validation

Their server checks:
1. **Session verification**: `$_POST['session_verify']` must match `session_id()`
2. **Request method**: Must be POST
3. **Origin check**: Request must come from same server
4. **Required fields**: All required fields must be present and not empty
5. **File uploads**: fileAttachmentA and fileAttachmentB must be valid

## Testing Your Integration

### Local Development Testing (HTML files)
1. Test all form functionality locally
2. PDF generation works completely
3. JSON generation works completely
4. For submission testing, mock the response:
```javascript
// During development, mock the submission
if (window.location.protocol === 'file:') {
    // Local development - mock response
    setTimeout(() => {
        const mockResponse = {
            success: true,
            message: "Ticket created successfully",
            ticketNumber: "TEST-123456"
        };
        handleResponse(mockResponse);
    }, 1000);
} else {
    // Production - real submission
    const response = await fetch('rfs_request_process.php', {...});
}
```

### Production Testing (PHP files on their server)
Test submission URL:
```
https://homicidefvu.fatsystems.ca/rfs_request_test.php
```

### What Their Test Page Does
1. Shows all received POST data
2. Shows file upload information
3. Returns JSON response
4. Helps debug field mapping issues

## Important Notes

### File Size Limits
- Their server likely has standard PHP upload limits (usually 2-8MB)
- Keep PDFs reasonable in size
- JSON files will be tiny, no concerns there

### Character Encoding
- Use UTF-8 everywhere
- Their server expects UTF-8
- Set proper headers in your HTML

### Field Name Mapping
Since we're using their field names directly, no mapping needed:
```javascript
// Correct - use their field names
<input name="rName" />
<input name="requestingEmail" />

// NOT this
<input name="officerName" />  // Wrong!
<input name="email" />         // Wrong!
```

### Session Timeout
- PHP sessions typically timeout after 24 minutes of inactivity
- Users should complete forms in one sitting
- Consider warning users about timeout

## Common Pitfalls to Avoid

1. **DON'T forget the PHP session_start()** - Without it, session verification fails
2. **DON'T use .html extensions** - Must be .php in production
3. **DON'T forget required fields** - Server will reject submission
4. **DON'T send empty strings for required fields** - They check for empty()
5. **DON'T forget the file attachments** - Both PDF and JSON required
6. **DON'T try to submit from local file://** - Must be on their server

## Deployment Checklist

- [ ] Complete all development with .html files locally
- [ ] Test all functionality (except submission) locally
- [ ] Convert all .html files to .php files
- [ ] Add `<?php session_start(); ?>` to line 1 of each PHP file
- [ ] Add hidden session_verify field to each form
- [ ] All required fields have 'name' attributes matching their system
- [ ] JavaScript creates fileAttachmentA and fileAttachmentB
- [ ] Submission goes to 'rfs_request_process.php'
- [ ] Error handling for non-JSON responses
- [ ] Success handling shows ticket number
- [ ] Provide IP address to them for whitelisting
- [ ] Upload all files via SFTP
- [ ] Test on their server with real submission

## Summary

This is a straightforward integration:
1. Your forms live on their server (via SFTP)
2. PHP sessions provide CSRF protection
3. Submit via FormData with 2 file attachments
4. Handle JSON response

No complex authentication, no API keys, no OAuth. Just forms, files, and sessions.