# Third-Party Field Comparison

**Date:** 2025-12-03
**Purpose:** Compare our form fields against third-party PHP system requirements

---

## Their Mandatory Fields (marked `required` in their form)

| Their Field | Their Description | What We Send | Status |
|-------------|-------------------|--------------|--------|
| `fileNr` | File number (placeholder: "18-123456") | `occNumber` (format: "PR123456") | ⚠️ QUESTION |
| `rName` | Requesting officer name | `rName` | ✅ Match |
| `requestingEmail` | Officer email | `requestingEmail` | ✅ Match |
| `requestingPhone` | Phone (format: "(999) 999-9999") | `requestingPhone` (10 digits) | ⚠️ FORMAT? |
| `fileDetails` | Brief synopsis | `fileDetails` (generated summary) | ✅ Match |
| `rfsDetails` | Request details | `rfsDetails` (generated/mapped) | ✅ Match |

**Summary: 4 match, 2 need clarification**

---

## Their Optional Fields (we can ignore or send blank)

| Their Field | Description | Do We Send? |
|-------------|-------------|-------------|
| `reqArea` | Service ID from their database | ❌ We send city - probably won't match |
| `reqRank` | Rank | ❌ No |
| `rfsHeader` | Header | ❌ No |
| `occType` | Type ID from their database | We send text like "Homicide" |
| `occDate` | Occurrence date | ✅ Yes |
| `occDateEnd` | End date | ❌ No |
| `occNr` | Occurrence number | We could send this |
| `locVictim` | Location ID | ❌ No |
| `locSuspect` | Location ID | ❌ No |
| `rfsAdmCmt` | Admin comment | ❌ No |
| `fileNrM` | Unknown | ❌ No |
| `fileNrX` | Unknown | ❌ No |
| `ticketStatus` | Status | ❌ No |
| `adviseREQ` | Unknown | ❌ No |
| `sendNotEmail` | Email notification | ❌ No |
| `g-recaptcha-response` | Captcha | ❌ Not applicable |

---

## What We Currently Send

From our `collectFormData()` and `api-client.js`:

```
rName              ✅ Direct field
requestingEmail    ✅ Direct field
requestingPhone    ✅ Direct field (10 digits, no formatting)
fileNr             ✅ Mapped from occNumber
fileDetails        ✅ Generated summary
rfsDetails         ✅ Generated/mapped from form
reqArea            ⚠️ Currently sends city name (Brampton, Mississauga, etc.)
occType            ⚠️ Sends text value (Homicide, Missing Person, etc.)
occDate            ✅ Date value
formType           Our internal use (upload/analysis/recovery)
```

---

## Key Issues to Clarify

### 1. `fileNr` Format
- **Their placeholder:** "18-123456"
- **Our format:** "PR123456" (occurrence number)
- **Question:** Will he accept our PR format, or does he need a different format?

### 2. `requestingPhone` Format
- **Their format:** "(999) 999-9999" with mask
- **Our format:** 10 digits (e.g., "9055551234")
- **Question:** Does his PHP strip formatting, or should we format it?

### 3. `reqArea` (OPTIONAL but worth asking)
- **His system:** Expects serviceID from his database
- **Our system:** Sends city name like "Brampton"
- **Question:** Can he ignore this, or does he need specific values?

### 4. File Attachments
- **Our system:** Sends PDF and JSON as `fileAttachmentA` and `fileAttachmentB`
- **His form:** No file upload fields shown
- **Question:** How should we send the PDF/JSON files?

---

## Questions for Third Party

### Must Answer (Mandatory Fields):

1. **File Number Format:** Our occurrence numbers are formatted as "PR123456". Your placeholder shows "18-123456". Will your system accept our format, or do you need us to change it?

2. **Phone Number Format:** We send phone as 10 digits (e.g., "9055551234"). Your form shows "(999) 999-9999". Does your PHP strip the formatting, or should we send it pre-formatted?

3. **PDF/JSON Attachments:** We generate a PDF document and JSON data file with each submission. How should we send these to you? As file uploads? Base64 encoded? Or do you not need them?

### Nice to Know (Optional Fields):

4. **reqArea Field:** Your form pulls from a database of service types. We don't have those IDs. Can we leave this blank, send a text description, or do you need specific values?

5. **occType Field:** Same situation - you pull from a database of occurrence types. We send text like "Homicide" or "Missing Person". Will that work, or do you need IDs?

6. **Endpoint URL:** What is the exact URL we should POST to?

---

## Current Mapping (for reference)

```javascript
// In our form handlers - collectFormData():
data.fileNr = data.occNumber || '';           // Maps occNumber → fileNr
data.reqArea = data.city || '';               // Maps city → reqArea (may not match his system)
data.rfsDetails = data.requestDetails || '';  // Maps request details
data.fileDetails = generateFieldSummaries();  // Generates summary
```

---

## Recommendation

Before making more code changes, get answers to questions 1-3 above. The mandatory fields are close to matching, but the format differences could cause issues.
