# Recovery Form JSON Output Documentation

This document details the complete JSON structure output when a user submits a CCTV Recovery Request form.

## Overview

The recovery form submission produces a JSON object that includes:
- Case information (occurrence number, offence type)
- Investigator details (name, badge, unit, contact info)
- Location information (business, address, contact person)
- Multiple DVR systems (dynamic, user can add multiple)
- Multiple extraction timeframes per DVR (dynamic)
- Incident description
- System metadata and mappings

## Data Flow

1. User fills out the recovery form (`recovery.html`)
2. `RecoveryFormHandler.collectFormData()` gathers all form data (line 901-987 in `form-handler-recovery.js`)
3. Base class `FormHandler.collectFormData()` converts FormData to object (line 543-573 in `form-handler-base.js`)
4. Recovery-specific transformations applied
5. API client `submitForm()` adds additional mappings (line 64-108 in `api-client.js`)
6. JSON submitted to API endpoint or Supabase

## Field Name Transformations

The recovery form uses both modern field names and legacy third-party mappings:

| Form Field | JSON Key | Third-Party Mapping |
|------------|----------|---------------------|
| `rName` | `rName` | Required by third-party |
| `requestingEmail` | `requestingEmail` | Required by third-party |
| `requestingPhone` | `requestingPhone` | Required by third-party (formatted as 10 digits) |
| `occNumber` | `occNumber`, `fileNr` | `fileNr` for PHP system |
| `city` | `city`, `reqArea` | `reqArea` for PHP system |
| `offenceType` | `offenceType`, `occType` | `occType` mapped to ID (1=Homicide, 2=Missing Person) |
| `incidentDescription` | `incidentDescription`, `rfsDetails`, `requestDetails` | Multiple aliases for compatibility |

## Complete JSON Structure

```json
{
  // ===== METADATA =====
  "formType": "recovery",

  // ===== CASE INFORMATION =====
  "occNumber": "PR12345678",
  "fileNr": "PR12345678",
  "offenceType": "Robbery",
  "offenceTypeDisplay": "Robbery",
  "occType": "1",

  // ===== INVESTIGATOR INFORMATION =====
  "rName": "Smith",
  "badge": "12345",
  "unit": "Central Robbery",
  "requestingPhone": "9055551234",
  "requestingEmail": "j.smith@peelpolice.ca",

  // ===== LOCATION INFORMATION =====
  "businessName": "Corner Store",
  "locationAddress": "123 Main Street",
  "city": "Brampton",
  "cityOther": "",
  "cityDisplay": "Brampton",
  "reqArea": "Brampton",
  "locationContact": "John Manager",
  "locationContactPhone": "9055555678",

  // ===== DVR GROUPS (Array Structure) =====
  "dvrGroups": [
    {
      // DVR 1 Information
      "dvrMakeModel": "Hikvision DS-7216",
      "isTimeDateCorrect": "No",
      "timeOffset": "DVR is 1hr 5min AHEAD of real time",
      "dvrRetention": "2025-01-15",
      "hasVideoMonitor": "Yes",
      "dvrUsername": "admin",
      "dvrPassword": "password123",

      // Extraction Time Frames for DVR 1
      "extractionTimeFrames": [
        {
          "extractionStartTime": "2025-01-20 14:30",
          "extractionEndTime": "2025-01-20 15:45",
          "timePeriodType": "DVR Time",
          "cameraDetails": "Front entrance\nCash register\nParking lot west side"
        },
        {
          "extractionStartTime": "2025-01-20 20:00",
          "extractionEndTime": "2025-01-20 21:30",
          "timePeriodType": "Actual Time",
          "cameraDetails": "Back door\nStorage area"
        }
      ]
    },
    {
      // DVR 2 Information (if user added additional DVR)
      "dvrMakeModel": "Dahua DH-XVR",
      "isTimeDateCorrect": "Yes",
      "timeOffset": "",
      "dvrRetention": "2025-01-10",
      "hasVideoMonitor": "No",
      "dvrUsername": "user",
      "dvrPassword": "pass456",

      // Extraction Time Frames for DVR 2
      "extractionTimeFrames": [
        {
          "extractionStartTime": "2025-01-20 16:00",
          "extractionEndTime": "2025-01-20 17:00",
          "timePeriodType": "DVR Time",
          "cameraDetails": "Side entrance\nLoading bay"
        }
      ]
    }
  ],

  // ===== FIRST DVR ROOT-LEVEL FIELDS (Backward Compatibility) =====
  // These duplicate the first DVR's data at root level for legacy systems
  "dvrMakeModel": "Hikvision DS-7216",
  "isTimeDateCorrect": "No",
  "timeOffset": "DVR is 1hr 5min AHEAD of real time",
  "dvrRetention": "2025-01-15",
  "hasVideoMonitor": "Yes",
  "dvrUsername": "admin",
  "dvrPassword": "password123",

  // First DVR's extraction time frames array (backward compatibility)
  "extractionTimeFrames": [
    {
      "extractionStartTime": "2025-01-20 14:30",
      "extractionEndTime": "2025-01-20 15:45",
      "timePeriodType": "DVR Time",
      "cameraDetails": "Front entrance\nCash register\nParking lot west side"
    },
    {
      "extractionStartTime": "2025-01-20 20:00",
      "extractionEndTime": "2025-01-20 21:30",
      "timePeriodType": "Actual Time",
      "cameraDetails": "Back door\nStorage area"
    }
  ],

  // First timeframe of first DVR at root level (backward compatibility)
  "extractionStartTime": "2025-01-20 14:30",
  "extractionEndTime": "2025-01-20 15:45",
  "timePeriodType": "DVR Time",
  "cameraDetails": "Front entrance\nCash register\nParking lot west side",

  // ===== INCIDENT DESCRIPTION =====
  "incidentDescription": "Robbery occurred at approximately 3pm. Suspect entered through front door, approached cash register, demanded money while displaying what appeared to be a weapon. Suspect fled through front entrance.",

  // ===== GENERATED SUMMARIES =====
  "fileDetails": "=== FORMATTED TEXT SUMMARY (see below) ===",
  "rfsDetails": "Robbery occurred at approximately 3pm...",
  "requestDetails": "Robbery occurred at approximately 3pm...",

  // ===== THIRD-PARTY SYSTEM MAPPINGS =====
  "rfsHeader": "FVU Recovery Request",
  "ticketStatus": "2",
  "occDate": null
}
```

## Field Details

### Required Fields

The following fields are **required** for form submission:

| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| `occNumber` | string | Must start with "PR" followed by numbers | Case reference number |
| `offenceType` | string | Any non-empty text | Free-text field in recovery form |
| `rName` | string | Any non-empty text | Investigator last name or full name |
| `badge` | string | Any non-empty text | Badge number |
| `unit` | string | Any non-empty text | Unit/division |
| `requestingPhone` | string | Exactly 10 digits | Auto-formatted on submission |
| `requestingEmail` | string | Must end with `@peelpolice.ca` | Official email only |
| `businessName` | string | Any non-empty text | Location name |
| `locationAddress` | string | Any non-empty text | Full street address |
| `city` | string | Must select from dropdown | Brampton, Mississauga, Toronto, or Other |
| `incidentDescription` | string | Any non-empty text | Detailed incident summary |

**Per DVR Group:**
- `dvrPassword` - Required for each DVR

**Per Extraction Timeframe:**
- `extractionStartTime` - Required for each timeframe
- `extractionEndTime` - Required for each timeframe
- `timePeriodType` - Required radio selection ("DVR Time" or "Actual Time")
- `cameraDetails` - Required textarea with camera specifications

### Optional Fields

| Field | Type | Conditional Logic | Notes |
|-------|------|-------------------|-------|
| `cityOther` | string | Required if `city === "Other"` | Custom city name |
| `locationContact` | string | Optional | Contact person at location |
| `locationContactPhone` | string | Optional (10 digits if provided) | Contact phone number |
| `dvrMakeModel` | string | Optional | DVR manufacturer and model |
| `isTimeDateCorrect` | string | Optional radio | "Yes" or "No" |
| `timeOffset` | string | Shows only if `isTimeDateCorrect === "No"` | NOT required in recovery form |
| `dvrRetention` | string | Optional date | Earliest date on DVR, validates not in future |
| `hasVideoMonitor` | string | Optional radio | "Yes" or "No" |
| `dvrUsername` | string | Optional | DVR login username |

### Data Type Details

**Dates and Times:**
- `dvrRetention`: ISO date format (`YYYY-MM-DD`)
- `extractionStartTime` / `extractionEndTime`: ISO datetime format (`YYYY-MM-DD HH:mm`)
- Flatpickr library used for date/time selection

**Phone Numbers:**
- Stored internally with formatting, but submitted as 10 digits only
- Format: `9055551234` (no dashes, spaces, or parentheses)

**Radio Buttons:**
- `isTimeDateCorrect`: "Yes" or "No"
- `timePeriodType`: "DVR Time" or "Actual Time"
- `hasVideoMonitor`: "Yes" or "No"

## Dynamic DVR Groups Structure

The recovery form allows users to add **multiple DVR systems**, each with **multiple extraction timeframes**.

### Field Naming Convention

Fields follow a complex naming pattern based on DVR index and timeframe index:

**DVR Index 0, Timeframe 0 (First DVR, First Timeframe):**
```javascript
extractionStartTime
extractionEndTime
timePeriodType
cameraDetails
```

**DVR Index 0, Timeframe N (First DVR, Additional Timeframes):**
```javascript
extractionStartTime_1
extractionEndTime_1
timePeriodType_1
cameraDetails_1
```

**DVR Index N, Timeframe 0 (Additional DVR, First Timeframe):**
```javascript
extractionStartTime_dvr1
extractionEndTime_dvr1
timePeriodType_dvr1
cameraDetails_dvr1
```

**DVR Index N, Timeframe M (Additional DVR, Additional Timeframes):**
```javascript
extractionStartTime_dvr1_1
extractionEndTime_dvr1_1
timePeriodType_dvr1_1
cameraDetails_dvr1_1
```

This naming is implemented in `getTimeframeFieldId()` method (lines 400-407 in `form-handler-recovery.js`).

### DVR Data Collection

The `collectFormData()` method iterates through all `.dvr-group` elements and their nested `.extraction-timeframe-group` elements to build the hierarchical structure (lines 905-934).

## Generated Field Details

### `fileDetails` - Formatted Text Summary

The `fileDetails` field contains a formatted plain-text summary of the entire request, generated by `generateFileDetails()` method (lines 989-1136 in `form-handler-recovery.js`).

**Format:**
```
========================================
    CCTV RECOVERY REQUEST
========================================

=== CASE ===
Occurrence: PR12345678
Offence: Robbery

=== INVESTIGATOR ===
Name: Smith (Badge: 12345)
Phone: 9055551234
Email: j.smith@peelpolice.ca

=== LOCATION ===
Business: Corner Store
Address: 123 Main Street, Brampton
Contact: John Manager (9055555678)

=== DVR 1 ===
Make/Model: Hikvision DS-7216
Time Correct: No
Time Offset: DVR is 1hr 5min AHEAD of real time
Retention: 15 days
Monitor On-Site: Yes

--- Time Frame 1 ---
Period: Jan 20, 2025 14:30 to Jan 20, 2025 15:45
Duration: 1 hour 15 minutes
Time Type: DVR Time
Cameras:
- Front entrance
- Cash register
- Parking lot west side

--- Time Frame 2 ---
Period: Jan 20, 2025 20:00 to Jan 20, 2025 21:30
Duration: 1 hour 30 minutes
Time Type: Actual Time
Cameras:
- Back door
- Storage area

Access: admin / password123

=== DVR 2 ===
[Additional DVR data if present...]

=== INCIDENT ===
Robbery occurred at approximately 3pm...
```

**Special Features:**
- Retention calculation with "URGENT" flag if ≤4 days remaining
- Duration calculation between start/end times
- Camera details formatted as bullet list
- Time offset only shown when time is NOT correct
- Access credentials shown as "username / password"

## Conditional Field Logic

### City "Other" Field

**Trigger:** User selects "Other" from City dropdown

**Fields affected:**
```json
{
  "city": "Other",
  "cityOther": "Vaughan",
  "cityDisplay": "Vaughan"
}
```

If "Other" NOT selected:
```json
{
  "city": "Brampton",
  "cityOther": "",
  "cityDisplay": "Brampton"
}
```

### Time Offset Field

**Trigger:** User selects "No" for "Is Time & Date correct?"

**Fields affected:**
```json
{
  "isTimeDateCorrect": "No",
  "timeOffset": "DVR is 1hr 5min AHEAD of real time"
}
```

If "Yes" selected:
```json
{
  "isTimeDateCorrect": "Yes",
  "timeOffset": ""
}
```

**Note:** Unlike the upload form, the `timeOffset` field is **NOT required** in the recovery form, even when "No" is selected (line 658 in `form-handler-recovery.js`).

## Third-Party System Mappings

The `submitForm()` method in `api-client.js` adds these mappings before submission:

### `occType` Mapping
```javascript
const occTypeMap = {
  'homicide': '1',
  'missing person': '2'
};
// Default: '1' (Homicide)
```

**Note:** Recovery form uses free-text offenceType, so this mapping may default to '1' unless user types exact text.

### `reqArea` Mapping
```javascript
formData.reqArea = '36';
// Fixed value: serviceID 36 = "Homicide and Missing Persons"
```

### `rfsHeader` Mapping
```javascript
formData.rfsHeader = 'FVU Recovery Request';
```

### `ticketStatus` Mapping
```javascript
// Maps to fat_rfs_types table:
// 1 = Video Analysis
// 2 = Video Extraction (RECOVERY)
// 4 = Video Upload
formData.ticketStatus = '2';
```

### Additional Mappings
```javascript
// Alias for requestDetails
formData.rfsDetails = formData.requestDetails || formData.incidentDescription;

// Alias for occurrence number
formData.fileNr = formData.occNumber;

// reqArea mapped from city
formData.reqArea = formData.city;
```

## Data Transformations

### Phone Number Formatting
```javascript
// Input: "905-555-1234" or "(905) 555-1234"
// Output: "9055551234"
```

Handled by `formatPhone()` in `validators.js`.

### Date Retention Calculation
```javascript
// Input: dvrRetention = "2025-01-15"
// Current Date: "2025-01-31"
// Output: "16 days remaining"

// Special Cases:
// - <= 4 days: Flagged as URGENT with bold red styling
// - Negative days: Validation error "cannot be in the future"
```

Handled by `calculateRetentionDays()` in `calculations.js`.

### Duration Calculation
```javascript
// extractionStartTime: "2025-01-20 14:30"
// extractionEndTime: "2025-01-20 15:45"
// Output: "1 hour 15 minutes"
```

Handled by `formatDuration()` method (lines 1154-1164 in `form-handler-recovery.js`).

## Validation Rules

### Email Validation
- Must end with `@peelpolice.ca`
- Case-insensitive check
- Pattern: `/^[^\s@]+@peelpolice\.ca$/i`

### Phone Validation
- Must be exactly 10 digits after stripping formatting
- Pattern: `/^\d{10}$/`

### Occurrence Number Validation
- Must start with "PR" (case-insensitive)
- Followed by one or more numbers
- Pattern: `/^PR\d+$/i`

### Date Range Validation
- `extractionEndTime` must be after `extractionStartTime`
- Validated by `validateDateRange()` in `validators.js`
- Error message: "End time must be after start time"

### DVR Retention Date Validation
- Must not be in the future
- Validated by `calculateRetentionDays()` checking for negative days
- Error message: "DVR retention date cannot be in the future"

## Submission Files

The form submission generates **three artifacts**:

### 1. JSON Data (sent to API)
- Complete form data as JSON object
- Structure documented above

### 2. JSON Blob File
- Downloadable JSON file
- Filename: `recovery_[timestamp].json`
- Generated by `generateJSON()` in `json-generator.js`

### 3. PDF File
- Formatted PDF document with form data
- Filename: `FVU_Recovery_Request_[occNumber].pdf`
- Generated by `generatePDF()` in `pdf-generator.js`
- Includes FVU logo, all form sections, formatted layout

## Example: Minimal Valid Submission

```json
{
  "formType": "recovery",
  "occNumber": "PR12345",
  "fileNr": "PR12345",
  "offenceType": "Theft",
  "offenceTypeDisplay": "Theft",
  "occType": "1",
  "rName": "Smith",
  "badge": "123",
  "unit": "Division 11",
  "requestingPhone": "9055551234",
  "requestingEmail": "smith@peelpolice.ca",
  "businessName": "Test Store",
  "locationAddress": "123 Main St",
  "city": "Brampton",
  "cityOther": "",
  "cityDisplay": "Brampton",
  "reqArea": "Brampton",
  "locationContact": "",
  "locationContactPhone": "",
  "incidentDescription": "Test incident description",
  "dvrGroups": [
    {
      "dvrMakeModel": "",
      "isTimeDateCorrect": "",
      "timeOffset": "",
      "dvrRetention": "",
      "hasVideoMonitor": "",
      "dvrUsername": "",
      "dvrPassword": "pass123",
      "extractionTimeFrames": [
        {
          "extractionStartTime": "2025-01-20 14:00",
          "extractionEndTime": "2025-01-20 15:00",
          "timePeriodType": "DVR Time",
          "cameraDetails": "Camera 1"
        }
      ]
    }
  ],
  "dvrMakeModel": "",
  "isTimeDateCorrect": "",
  "timeOffset": "",
  "dvrRetention": "",
  "hasVideoMonitor": "",
  "dvrUsername": "",
  "dvrPassword": "pass123",
  "extractionTimeFrames": [
    {
      "extractionStartTime": "2025-01-20 14:00",
      "extractionEndTime": "2025-01-20 15:00",
      "timePeriodType": "DVR Time",
      "cameraDetails": "Camera 1"
    }
  ],
  "extractionStartTime": "2025-01-20 14:00",
  "extractionEndTime": "2025-01-20 15:00",
  "timePeriodType": "DVR Time",
  "cameraDetails": "Camera 1",
  "fileDetails": "[generated summary]",
  "rfsDetails": "Test incident description",
  "requestDetails": "Test incident description",
  "rfsHeader": "FVU Recovery Request",
  "ticketStatus": "2"
}
```

## Example: Complex Multi-DVR Submission

```json
{
  "formType": "recovery",
  "occNumber": "PR98765432",
  "fileNr": "PR98765432",
  "offenceType": "Armed Robbery",
  "offenceTypeDisplay": "Armed Robbery",
  "occType": "1",
  "rName": "Johnson",
  "badge": "54321",
  "unit": "Major Crimes",
  "requestingPhone": "9055559999",
  "requestingEmail": "johnson@peelpolice.ca",
  "businessName": "Downtown Convenience",
  "locationAddress": "456 Queen Street West",
  "city": "Mississauga",
  "cityOther": "",
  "cityDisplay": "Mississauga",
  "reqArea": "Mississauga",
  "locationContact": "Sarah Manager",
  "locationContactPhone": "9055558888",
  "incidentDescription": "Armed robbery with three suspects. Video required from multiple angles to identify suspects and vehicle. Time-critical as DVR retention is limited.",

  "dvrGroups": [
    {
      "dvrMakeModel": "Hikvision DS-7608",
      "isTimeDateCorrect": "No",
      "timeOffset": "DVR clock is 2 hours 15 minutes BEHIND actual time",
      "dvrRetention": "2025-01-28",
      "hasVideoMonitor": "Yes",
      "dvrUsername": "admin",
      "dvrPassword": "HikVision2025!",
      "extractionTimeFrames": [
        {
          "extractionStartTime": "2025-01-25 16:30",
          "extractionEndTime": "2025-01-25 17:00",
          "timePeriodType": "Actual Time",
          "cameraDetails": "Camera 1 - Front entrance (facing street)\nCamera 2 - Cash register area\nCamera 3 - Back door exit"
        },
        {
          "extractionStartTime": "2025-01-25 17:15",
          "extractionEndTime": "2025-01-25 17:30",
          "timePeriodType": "Actual Time",
          "cameraDetails": "Camera 4 - Parking lot overview\nCamera 5 - Side alley"
        }
      ]
    },
    {
      "dvrMakeModel": "Dahua XVR5108HS",
      "isTimeDateCorrect": "Yes",
      "timeOffset": "",
      "dvrRetention": "2025-01-22",
      "hasVideoMonitor": "No",
      "dvrUsername": "security",
      "dvrPassword": "SecurePass456",
      "extractionTimeFrames": [
        {
          "extractionStartTime": "2025-01-25 16:45",
          "extractionEndTime": "2025-01-25 17:15",
          "timePeriodType": "DVR Time",
          "cameraDetails": "Camera 8 - Rear parking area\nCamera 9 - Loading dock\nCamera 10 - Storage room entrance"
        }
      ]
    }
  ],

  "dvrMakeModel": "Hikvision DS-7608",
  "isTimeDateCorrect": "No",
  "timeOffset": "DVR clock is 2 hours 15 minutes BEHIND actual time",
  "dvrRetention": "2025-01-28",
  "hasVideoMonitor": "Yes",
  "dvrUsername": "admin",
  "dvrPassword": "HikVision2025!",
  "extractionTimeFrames": [
    {
      "extractionStartTime": "2025-01-25 16:30",
      "extractionEndTime": "2025-01-25 17:00",
      "timePeriodType": "Actual Time",
      "cameraDetails": "Camera 1 - Front entrance (facing street)\nCamera 2 - Cash register area\nCamera 3 - Back door exit"
    },
    {
      "extractionStartTime": "2025-01-25 17:15",
      "extractionEndTime": "2025-01-25 17:30",
      "timePeriodType": "Actual Time",
      "cameraDetails": "Camera 4 - Parking lot overview\nCamera 5 - Side alley"
    }
  ],
  "extractionStartTime": "2025-01-25 16:30",
  "extractionEndTime": "2025-01-25 17:00",
  "timePeriodType": "Actual Time",
  "cameraDetails": "Camera 1 - Front entrance (facing street)\nCamera 2 - Cash register area\nCamera 3 - Back door exit",

  "fileDetails": "[generated detailed summary with all DVRs and timeframes]",
  "rfsDetails": "Armed robbery with three suspects...",
  "requestDetails": "Armed robbery with three suspects...",
  "rfsHeader": "FVU Recovery Request",
  "ticketStatus": "2"
}
```

## Notes for Developers

### Backward Compatibility
The recovery form maintains **backward compatibility** by duplicating the first DVR's data at the root level of the JSON object. This ensures legacy systems expecting flat structure continue to work while new systems can use the hierarchical `dvrGroups` array.

### Flatpickr Integration
Date and datetime fields use Flatpickr library. When collecting form data, the handler checks for `field._flatpickr` instances and reads from `field._flatpickr.input.value` to ensure accurate datetime values (lines 554-562 in `form-handler-base.js`).

### Dynamic Field Creation
All recovery form fields are created dynamically by `FormFieldBuilder` static methods. No hardcoded HTML fields exist in `recovery.html` except container divs.

### Auto-save Functionality
Draft data is automatically saved to localStorage every 2 seconds after user input. Draft structure matches the final submission JSON structure.

### Officer Info Persistence
Investigator information (`rName`, `badge`, `unit`, `requestingPhone`, `requestingEmail`) is saved to localStorage and auto-populated across all form types for user convenience.

---

**Document Version:** 1.0
**Last Updated:** 2026-02-01
**Form Handler Version:** Based on `form-handler-recovery.js` and `form-handler-base.js`
