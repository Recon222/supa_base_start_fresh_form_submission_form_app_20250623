# FVU Forms: Third-Party Integration Summary

**Date:** December 11, 2025
**Purpose:** Document the field mapping integration between FVU Forms and the FAT System

---

## Overview

The FVU Request System generates PDFs client-side and submits them to the FAT (Forensic Analysis Tracking) system for storage and workflow management. The FAT system has limited intake fields, so we optimized our submissions to populate as many fields as possible automatically.

This document summarizes the field mappings implemented to eliminate manual data entry during ticket evaluation.

---

## The Problem

When forms were submitted, the FAT system showed mostly empty fields:

| Field | Before | After |
|-------|--------|-------|
| Summary (File Desc) | NEW Request For Service | FVU Analysis Request |
| File Type | Test | Video Clarification |
| Type of Occurrence | (empty) | Homicide |
| Requesting Area | (empty) | Homicide and Missing Persons |
| Occurrence Date | (empty) | 2025-12-05 |

This required staff to manually read each submission and fill in the dropdown fields during evaluation.

---

## Solution: Field Mapping

We mapped our form data to the FAT System's database table IDs so fields auto-populate on submission.

### Why IDs Instead of Text?

The FAT System's dropdown fields use database IDs as values, not display text. For example, the "Type of Occurrence" dropdown renders as:

```html
<select name="occType">
  <option value="1">Homicide</option>
  <option value="2">Missing Person</option>
  ...
</select>
```

The `value` attribute contains the database ID (`1`), while the display text (`Homicide`) is just for the user interface. When submitting data, the system expects the ID - sending `"Homicide"` as text won't match any option value and the field remains empty.

This is why our integration sends `occType: "1"` rather than `occType: "Homicide"`.

**Note:** The database IDs were not provided in the FAT System documentation. We obtained them by querying the database export directly (e.g., `fat_occTypes`, `fat_servicing`, `fat_rfs_types` tables) to determine the correct ID values for each field.

### Data Flow

```
+------------------+      +-------------------+      +------------------+
|   FVU Forms      |      |   api-client.js   |      |   FAT System DB  |
|                  |      |   (transforms)    |      |                  |
|  offenceType:    | ---> |  occType: "1"     | ---> |  fat_occTypes    |
|  "Homicide"      |      |                   |      |  (ID lookup)     |
|                  |      |                   |      |                  |
|  formType:       | ---> |  reqArea: "36"    | ---> |  fat_servicing   |
|  "analysis"      |      |  ticketStatus:"1" |      |  fat_rfs_types   |
|                  |      |  rfsHeader:"FVU   |      |  fat_tickets     |
|                  |      |   Analysis Req"   |      |                  |
+------------------+      +-------------------+      +------------------+
```

---

## Field Mappings

### 1. Type of Occurrence (occType)

Maps to the FAT System's `fat_occTypes` table.

| Our Form Value | FAT System ID | FAT System Label |
|----------------|---------------|------------------|
| Homicide | 1 | Homicide |
| Missing Person | 2 | Missing Person |

We simplified our forms to only offer these two options since they match the FAT system.

---

### 2. Requesting Area (reqArea)

Maps to the FAT System's `fat_servicing` table.

| Our Setting | FAT System ID | FAT System Label |
|-------------|---------------|------------------|
| (hardcoded) | 36 | Homicide and Missing Persons |

All FVU requests route to the same area, so this is set automatically.

---

### 3. Request Type (ticketStatus)

Maps to the FAT System's `fat_rfs_types` table.

| Our Form | FAT System ID | Current Label | Suggested Label |
|----------|---------------|---------------|-----------------|
| Analysis | 1 | Video Clarification | Video Analysis |
| Recovery | 2 | Video Timeline | Video Extraction |
| Upload | 4 | Video Upload | Video Upload |

**Action for FAT System:** Rename labels in `fat_rfs_types` table to match FVU terminology.

---

### 4. File Description (rfsHeader)

Maps to the FAT System's `fat_tickets.rfsHeader` field.

| Our Form | Value Sent |
|----------|------------|
| Analysis | FVU Analysis Request |
| Recovery | FVU Recovery Request |
| Upload | FVU Upload Request |

**Note:** We are sending the correct value, but the FAT system still shows "NEW Request For Service". This requires a fix on the FAT System's end to use the submitted `rfsHeader` value instead of the default.

---

### 5. Date of Occurrence (occDate)

Previously handled inconsistently:
- Upload: Auto-set to today's date (hidden)
- Analysis: Copied from recording date
- Recovery: Derived from extraction start time

**Change:** Added a visible "Date of Occurrence" date picker to all three forms. Users now explicitly select the correct date.

---

## Form Changes Summary

### All Forms
- Added "Date of Occurrence" date picker (required field)
- Simplified offence types to: Homicide, Missing Person
- Removed "Other" option and free-text fallback

### Upload Form
- Added "Type of Offence" dropdown (was missing)

### Recovery Form
- Removed: Robbery, Shooting, Sexual Assault, Other options

---

## Database Reference (FAT System)

For the FAT System's reference, here are the relevant tables:

### fat_occTypes
```
ID  | Name
----|----------------
1   | Homicide
2   | Missing Person
```

### fat_servicing (partial)
```
ID  | Name
----|---------------------------
36  | Homicide and Missing Persons
```

### fat_rfs_types
```
ID  | Name (current)        | Suggested
----|----------------------|------------------
1   | Video Clarification  | Video Analysis
2   | Video Timeline       | Video Extraction
4   | Video Upload         | Video Upload
```

---

## Outstanding Item

**rfsHeader not populating:** Our system sends `rfsHeader: "FVU Analysis Request"` (confirmed in browser console), but the FAT system displays "NEW Request For Service".

The issue is in the FAT System's ticket creation code - the submitted `rfsHeader` value is not being inserted into the database. The FAT system will need to update the PHP to use `$_POST["rfsHeader"]` when inserting new tickets.

---

## Files Modified

- `analysis.html` - Added occDate picker, simplified offence types
- `recovery.html` - Added occDate picker, simplified offence types
- `upload.html` - Added occDate picker, added offenceType dropdown
- `assets/js/api-client.js` - Added field mapping transformations
- `assets/js/form-handlers/form-handler-*.js` - Removed legacy occDate logic

---

## Testing Verification

After deployment, submitted forms should show:

| Field | Expected Value |
|-------|----------------|
| Type of Occurrence | Homicide or Missing Person |
| Requesting Area | Homicide and Missing Persons |
| File Type | Video Clarification/Timeline/Upload |
| Occurrence Date | User-selected date |
| Requested by | Officer name from form |
