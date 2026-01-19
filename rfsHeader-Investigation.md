# rfsHeader Database Investigation Report

**Date:** December 16, 2025
**Issue:** The `rfsHeader` field in `fat_tickets` table is not being populated with submitted values and always defaults to "NEW Request For Service"

---

## Database Schema Analysis

### fat_tickets Table Definition

**Column Definition (Line 1198):**
```sql
`rfsHeader` varchar(240) NOT NULL,
```

**Key Findings:**
- Data type: `varchar(240)` - sufficient length for storing request types
- Constraint: `NOT NULL` - the field MUST contain a value
- **NO DEFAULT value** - the column definition does NOT contain a DEFAULT value
- Engine: InnoDB with latin1 collation

### Current Data in fat_tickets Table

All records contain "NEW Request For Service" in the `rfsHeader` field:
- Row 1 (ID 1): "Test File" (Only row with a different value - manually entered)
- Rows 2-19 (IDs 2-19): All contain "NEW Request For Service"

---

## Schema Investigation Results

### What DOES NOT Cause the Issue

✓ **No DEFAULT value on column** - The column has no database-level default value, so the database itself is not forcing the default

✓ **No TRIGGER on the table** - Searched entire SQL file for `TRIGGER`, `BEFORE INSERT`, `AFTER INSERT` - no triggers exist on `fat_tickets`

✓ **No CONSTRAINT causing override** - No check constraints or other database mechanisms that would override the value

✓ **Data type is appropriate** - varchar(240) can accommodate all expected request type values

### Schema Verdict

**The database schema is NOT the culprit.** The issue must exist in the PHP application code that inserts values into this table.

---

## Root Cause Analysis

The problem lies in the **PHP application logic**, not the database schema. Here's why:

### PHP Fix That Was Applied (But Still Failing)
```php
if (trim((string)$this->rfsHeader) === '') {
    $this->rfsHeader = "NEW Request For Service";
}
```

This code shows:
1. The developer is explicitly checking if `rfsHeader` is empty
2. They're setting it to "NEW Request For Service" as a fallback
3. But this implies the value was NOT being populated beforehand

### Likely Root Causes

The fact that the fallback is ALWAYS being triggered suggests one of these issues:

#### Issue A: Value Not Being Sent from Frontend
- The `rfsHeader` field is empty or undefined when it reaches the PHP code
- This could mean:
  - The frontend form isn't collecting this field
  - The field name in JavaScript doesn't match the POST parameter name
  - The field is being cleared during form processing
  - The wrong form type is being submitted

#### Issue B: Value Not Being Extracted from POST Data
- The PHP code isn't properly extracting the value from the request
- Examples:
  ```php
  // Wrong (if field was sent as something else):
  $this->rfsHeader = $_POST['rfsHeader'] ?? '';  // Not matching actual key

  // Or the value is being stripped/sanitized away:
  $this->rfsHeader = trim((string)$this->rfsHeader);  // No data before trim?
  ```

#### Issue C: Value Cleared After Assignment
- The value IS being set from the form
- But then something clears it before the INSERT statement
- Multiple assignment operations conflicting

#### Issue D: Wrong Object Property
- The form data is being assigned to a different property name
- The fallback code runs on a different property than what gets inserted
- Example: `$this->rfsHeaderValue` vs `$this->rfsHeader`

---

## Data Pattern Evidence

Looking at the test data, all new submissions (rows 16-19, created Dec 8, 2025) have "NEW Request For Service". This suggests:
- The fallback code IS running (we see the default value)
- The value from the browser console ("FVU Analysis Request") is NOT making it to the database
- This confirms the issue is between form submission and database insertion

---

## Recommended Debugging Steps

### 1. Verify Frontend is Sending the Value
```javascript
// In browser console on form submission:
console.log('Form data before submission:', {
  rfsHeader: formData.rfsHeader,
  allFormData: formData
});
```

### 2. Check PHP Receives the Value
Add logging at the start of the PHP handler:
```php
error_log('POST data received: ' . print_r($_POST, true));
error_log('rfsHeader value: ' . ($_POST['rfsHeader'] ?? 'NOT SET'));
```

### 3. Trace the Exact Property Assignment
```php
// After instantiating the object:
error_log('rfsHeader before processing: ' . $this->rfsHeader);

// After any processing:
error_log('rfsHeader after processing: ' . $this->rfsHeader);

// Just before INSERT:
error_log('rfsHeader before INSERT: ' . $this->rfsHeader);
```

### 4. Check Form Handler Logic
- Verify the form is calling the correct handler
- Confirm the correct field names are used in the POST extraction
- Check if multiple form types reuse the same handler

### 5. Search for Conflicting Assignments
In the PHP class:
- Search for all lines that assign `$this->rfsHeader`
- Verify they don't contradict each other
- Check that no method clears this value

---

## Summary

### Database Status
**✓ CLEAN** - No database-level constraints or defaults are preventing the value from being stored. The schema is correctly defined.

### Issue Location
**PHP APPLICATION CODE** - The value is not reaching PHP correctly OR not being stored from PHP correctly.

### Key Question
**Where does "NEW Request For Service" originate?**
- If it's the database: Check for DEFAULT value (none found)
- If it's the PHP: The fallback code must be running because the value is empty
- The browser console shows the value exists, so it's lost somewhere between form submission and the INSERT statement

### Next Action
Examine the PHP form handler class (likely `UploadFormHandler`, `AnalysisFormHandler`, or `RecoveryFormHandler` in `/assets/js/form-handlers/`) to trace how `rfsHeader` is extracted from `$_POST` and ensure it's not being overwritten or cleared before insertion.

---

## Files to Review

1. **PHP Form Handler Class** - Where ticket is created (likely `rfs_request_process.php` or similar)
2. **JavaScript Form Handler** - Check form field mapping and POST data preparation
3. **Form HTML** - Verify the rfsHeader input field exists and has correct name attribute
4. **Database Insert Logic** - Ensure the parameter binding uses the correct property

