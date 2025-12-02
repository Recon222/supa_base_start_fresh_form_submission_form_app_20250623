# FVU Request System - Manual QA Checklist

**Last Updated:** 2025-12-02
**Estimated Time:** 45-60 minutes
**Purpose:** Comprehensive testing before deployment

## Instructions

1. Open browser Developer Tools (F12) before starting
2. Keep Console tab visible throughout testing to catch JavaScript errors
3. Check each box as you complete the test
4. Note any failures in the "Issues Found" section at bottom
5. Test in order - some tests build on previous steps

---

## Pre-Testing Setup

- [ ] Clear browser cache and cookies
- [ ] Clear localStorage (F12 > Application > Local Storage > Clear All)
- [ ] Verify you're testing the correct environment (local/staging/production)
- [ ] Note browser and version: _________________

---

## 1. Upload Form (upload.html)

### 1.1 Page Load Tests

- [ ] Navigate to `upload.html`
- [ ] No JavaScript console errors appear
- [ ] All form sections render correctly
- [ ] Progress bar shows "0% Complete" at bottom
- [ ] Theme toggle button appears in header (moon icon)
- [ ] Draft button shows "Auto-save active"
- [ ] Back button is visible

### 1.2 Required Field Validation

Test by leaving each required field empty and attempting to submit:

- [ ] Occurrence Number - Shows "This field is required"
- [ ] Media Type - Shows "This field is required"
- [ ] Submitting Investigator - Shows "This field is required"
- [ ] Badge Number - Shows "This field is required"
- [ ] Contact Number - Shows "This field is required"
- [ ] Email Address - Shows "This field is required"
- [ ] Location Address - Shows "This field is required"
- [ ] City - Shows "This field is required"
- [ ] Video Start Time - Shows "This field is required"
- [ ] Video End Time - Shows "This field is required"
- [ ] Time & Date Correct radio - Shows "This field is required"

### 1.3 Email Validation

- [ ] Enter "test@gmail.com" → Shows "Must be a valid @peelpolice.ca email"
- [ ] Enter "investigator@peelpolice.ca" → Validation passes (no error)
- [ ] Enter "INVESTIGATOR@PEELPOLICE.CA" → Validation passes (case insensitive)
- [ ] Enter "test@peel.ca" → Shows error (must be exact domain)

### 1.4 Phone Validation

- [ ] Enter "123" → Shows "Must be 10 digits"
- [ ] Enter "12345678901" (11 digits) → Shows "Must be 10 digits"
- [ ] Enter "905-555-1234" → Validation passes (10 digits, dashes allowed)
- [ ] Enter "9055551234" → Validation passes (10 digits)
- [ ] Enter "abc123" → Shows "Must be 10 digits"

### 1.5 Occurrence Number Validation

- [ ] Enter "123456" → Shows "Must start with PR followed by numbers"
- [ ] Enter "pr123456" → Validation passes (case insensitive)
- [ ] Enter "PR240368708" → Validation passes
- [ ] Enter "PR" → Shows error (needs numbers after PR)

### 1.6 Media Type "Other" Field

- [ ] Select "USB" from Media Type dropdown → "Specify Media Type" field does NOT appear
- [ ] Select "Other" from Media Type dropdown → "Specify Media Type" field appears
- [ ] Field has red asterisk (required)
- [ ] Leave "Specify Media Type" empty, try submit → Shows "This field is required"
- [ ] Enter text in "Specify Media Type" → Validation passes
- [ ] Change Media Type back to "USB" → "Specify Media Type" field disappears
- [ ] Value in "Specify Media Type" is cleared when hidden

### 1.7 City "Other" Field

- [ ] Select "Brampton" from City dropdown → "Specify City" field does NOT appear
- [ ] Select "Other" from City dropdown → "Specify City" field appears
- [ ] Field has red asterisk (required)
- [ ] Leave "Specify City" empty, try submit → Shows "Please specify the city name"
- [ ] Enter "Oakville" in "Specify City" → Validation passes
- [ ] Change City back to "Mississauga" → "Specify City" field disappears

### 1.8 Time & Date Correct Radio Buttons

- [ ] Select "Yes" radio button → Warning message appears: "Your confirmation of correct timestamp..."
- [ ] "Time Offset" field does NOT appear when "Yes" is selected
- [ ] Select "No" radio button → Warning message disappears
- [ ] "Time Offset" field appears when "No" is selected
- [ ] "Time Offset" field has red asterisk (required)
- [ ] Leave "Time Offset" empty with "No" selected, try submit → Shows "Please specify the time offset"
- [ ] Enter "DVR is 2 hours ahead" → Validation passes

### 1.9 DVR Earliest Date (Retention Calculation)

- [ ] Enter a date 10 days ago → Shows "10 days of retention"
- [ ] Enter a date 3 days ago → Shows "3 days of retention" in RED/BOLD (urgent)
- [ ] Enter a date 30 days ago → Shows "30 days of retention" in normal blue text
- [ ] Clear the date → Calculation message disappears

### 1.10 Date Range Validation

- [ ] Enter Video Start Time: 2024-12-01 10:00
- [ ] Enter Video End Time: 2024-12-01 09:00 (before start) → Shows "End time must be after start time"
- [ ] Enter Video End Time: 2024-12-01 11:00 (after start) → Error clears, validation passes
- [ ] Enter future dates → Shows "Times cannot be in the future"

### 1.11 Add Location Functionality

- [ ] Click "+ Add Another Location" button → New location group appears
- [ ] New group has all same fields as first location
- [ ] New group has a "Remove This Location" button
- [ ] Page scrolls to new location group
- [ ] Progress bar updates to reflect new required fields
- [ ] Add 3 total locations → All 3 groups visible and functional
- [ ] Click "Remove This Location" on 3rd group → Group fades out and disappears
- [ ] First location group does NOT have a remove button

### 1.12 Progress Bar

- [ ] Start with empty form → Shows "0% Complete"
- [ ] Fill in Occurrence Number → Progress increases
- [ ] Fill in all required fields → Progress reaches "100% Complete"
- [ ] Progress bar color changes: Red (0-33%), Yellow (34-66%), Green (67-100%)
- [ ] Add a second location → Progress drops (new required fields added)
- [ ] Fill new location fields → Progress returns to 100%

### 1.13 Locker Number Validation (Optional Field)

- [ ] Leave Locker Number empty → No error (optional field)
- [ ] Enter "5" → Validation passes
- [ ] Enter "0" → Shows "Locker number must be between 1 and 15"
- [ ] Enter "16" → Shows "Locker number must be between 1 and 15"
- [ ] Enter "15" → Validation passes

### 1.14 Theme Toggle

- [ ] Page loads in dark theme by default
- [ ] Click theme toggle button → Page switches to light theme
- [ ] All colors, backgrounds, text remain readable
- [ ] Refresh page → Theme preference persists (still light)
- [ ] Click theme toggle again → Returns to dark theme

### 1.15 Draft Auto-Save

- [ ] Fill in Occurrence Number: "PR123456"
- [ ] Fill in Investigator Name: "TestOfficer"
- [ ] Wait 3 seconds (auto-save triggers after 2 seconds of inactivity)
- [ ] Check Console → See "Draft saved" message
- [ ] Refresh the page
- [ ] Click draft button (should now show "Load Draft" instead of "Auto-save active")
- [ ] Click "Load Draft" → Form fields repopulate with saved data
- [ ] Toast notification shows "Draft loaded"

### 1.16 Clear Form Button

- [ ] Fill in several form fields
- [ ] Click "Clear Form" button → Confirmation prompt appears
- [ ] Click Cancel → Form data remains
- [ ] Click "Clear Form" again, click OK → All fields clear to default state
- [ ] Progress bar returns to 0%

### 1.17 Successful Submission (Requires Network)

Fill out complete valid form and submit:

- [ ] Fill all required fields with valid data
- [ ] Click "Submit Request" button
- [ ] Success toast appears: "Request submitted successfully. ID: [number]"
- [ ] PDF downloads automatically (check Downloads folder)
- [ ] Form clears after submission
- [ ] Draft is cleared (refresh page, no "Load Draft" button)
- [ ] Check Console → No errors

### 1.18 Officer Info Persistence

After one successful submission:

- [ ] Refresh page or navigate to upload.html again
- [ ] Investigator Name field is pre-filled
- [ ] Badge Number field is pre-filled
- [ ] Contact Number field is pre-filled
- [ ] Email Address field is pre-filled
- [ ] Other fields remain empty
- [ ] Click "Clear Investigator Info" button → Fields clear
- [ ] Refresh page → Investigator fields are now empty (not pre-filled)

---

## 2. Analysis Form (analysis.html)

### 2.1 Page Load Tests

- [ ] Navigate to `analysis.html`
- [ ] No JavaScript console errors appear
- [ ] All form sections render correctly
- [ ] Progress bar shows "0% Complete"
- [ ] Theme toggle works
- [ ] Draft button shows "Auto-save active"

### 2.2 Required Field Validation

Test by leaving each empty and attempting to submit:

- [ ] Occurrence Number → Shows "This field is required"
- [ ] Type of Offence → Shows "This field is required"
- [ ] Location of Video → Shows "This field is required"
- [ ] Video Seized From → Shows "This field is required"
- [ ] City → Shows "This field is required"
- [ ] Recording Date → Shows "This field is required"
- [ ] Service Required → Shows "This field is required"
- [ ] Submitting Investigator → Shows "This field is required"
- [ ] Badge Number → Shows "This field is required"
- [ ] Contact Number → Shows "This field is required"
- [ ] Email Address → Shows "This field is required"
- [ ] Request Details → Shows "This field is required"

### 2.3 Offence Type "Other" Field

- [ ] Select "Homicide" → "Specify Offence Type" field does NOT appear
- [ ] Select "Other" → "Specify Offence Type" field appears with red asterisk
- [ ] Leave empty, try submit → Shows "Please specify the offence type"
- [ ] Enter "Assault" → Validation passes
- [ ] Change back to "Missing Person" → Field disappears and clears

### 2.4 Video Location "Other" Field

- [ ] Select "NAS Storage" → "Specify Storage Location" does NOT appear
- [ ] Select "Other" → "Specify Storage Location" appears with red asterisk
- [ ] Leave empty, try submit → Shows "Please specify the storage location"
- [ ] Enter "Cloud Storage" → Validation passes
- [ ] Change to "Evidence.com Locker" → Field disappears

### 2.5 City "Other" Field

- [ ] Select "Toronto" → "Specify City" does NOT appear
- [ ] Select "Other" → "Specify City" appears with red asterisk
- [ ] Leave empty, try submit → Shows "Please specify the city name"
- [ ] Enter "Caledon" → Validation passes

### 2.6 Service Required "Other" Field

- [ ] Select "Video/Image Clarification" → "Specify Service Required" does NOT appear
- [ ] Select "Other" → "Specify Service Required" appears with red asterisk
- [ ] Leave empty, try submit → Shows "Please specify the service required"
- [ ] Enter "Custom Enhancement" → Validation passes
- [ ] Change to "Timeline" → Field disappears

### 2.7 Recording Date Validation

- [ ] Enter today's date → Validation passes
- [ ] Enter yesterday's date → Validation passes
- [ ] Enter tomorrow's date → Shows "Date cannot be in the future"
- [ ] Enter a date from 2020 → Validation passes

### 2.8 File Names Field (Optional)

- [ ] Leave empty → No error (optional field)
- [ ] Enter multiple file names (one per line) → Validation passes
- [ ] Enter:
  ```
  video1.mp4
  video2.avi
  video3.mov
  ```
- [ ] Check Console on submit → Should log "3 file(s) listed"

### 2.9 Progress Bar

- [ ] Empty form → 0%
- [ ] Fill required fields gradually → Progress increases
- [ ] All required fields filled → 100%

### 2.10 Draft Auto-Save

- [ ] Fill partial form data
- [ ] Wait 3 seconds
- [ ] Refresh page
- [ ] Click "Load Draft" → Data restored

### 2.11 Officer Info Persistence

- [ ] If officer info was saved from previous form → Fields pre-fill
- [ ] If cleared → Fields remain empty

### 2.12 Successful Submission

- [ ] Fill complete valid form
- [ ] Submit → Success toast appears
- [ ] PDF downloads: `FVU_Analysis_Request_[OccNum].pdf`
- [ ] Form clears after submission

---

## 3. Recovery Form (recovery.html)

### 3.1 Page Load Tests

- [ ] Navigate to `recovery.html`
- [ ] No JavaScript console errors appear
- [ ] All form sections render correctly
- [ ] Progress bar shows "0% Complete"
- [ ] Theme toggle works
- [ ] First DVR group is visible (DVR 1)

### 3.2 Required Field Validation

Test by leaving each empty and attempting to submit:

- [ ] Occurrence Number → Shows "This field is required"
- [ ] Type of Offence → Shows "This field is required"
- [ ] Submitting Investigator → Shows "This field is required"
- [ ] Badge Number → Shows "This field is required"
- [ ] Contact Number → Shows "This field is required"
- [ ] Email Address → Shows "This field is required"
- [ ] Location Address → Shows "This field is required"
- [ ] City → Shows "This field is required"
- [ ] Location Contact → Shows "This field is required"
- [ ] Location Contact Phone → Shows "This field is required"
- [ ] Time Period From → Shows "This field is required"
- [ ] Time Period To → Shows "This field is required"
- [ ] Time Period Type radio → Shows "This field is required"
- [ ] Camera Details → Shows "This field is required"
- [ ] Password → Shows "This field is required"
- [ ] Incident Description → Shows "This field is required"

### 3.3 Offence Type "Other" Field

- [ ] Select "Robbery" → "Specify Offence" does NOT appear
- [ ] Select "Other" → "Specify Offence" appears with red asterisk
- [ ] Leave empty, try submit → Shows "Please specify the offence type"
- [ ] Enter "Fraud" → Validation passes

### 3.4 City "Other" Field

- [ ] Works same as Upload and Analysis forms
- [ ] Conditional field appears/disappears correctly

### 3.5 Location Contact Phone Validation

- [ ] Enter "123" → Shows "Must be 10 digits"
- [ ] Enter "9055551234" → Validation passes
- [ ] Enter "905-555-1234" → Validation passes

### 3.6 DVR Time & Date Correct (Special Behavior)

IMPORTANT: Recovery form does NOT show warning message and time offset is NOT required:

- [ ] Select "Yes" → No warning message appears
- [ ] "Time Offset" field does NOT appear
- [ ] Select "No" → "Time Offset" field appears (no red asterisk - optional)
- [ ] Leave "Time Offset" empty with "No" selected, submit → No error (optional field)
- [ ] Enter "DVR is 30 minutes slow" → Validation passes

### 3.7 DVR Retention Field

- [ ] Leave empty → No error (optional field)
- [ ] Enter a date 10 days ago → Shows "10 days of retention"
- [ ] Enter a date 3 days ago → Shows "3 days of retention" in RED/BOLD (urgent alert)
- [ ] Enter a date 1 day ago → Shows "1 day of retention" in RED/BOLD
- [ ] Enter a date 5 days ago → Shows "5 days of retention" in normal blue (not urgent)
- [ ] Enter tomorrow's date → Shows "DVR retention date cannot be in the future" as error
- [ ] Try to submit with future date → Validation fails

### 3.8 Video Extraction Time Range

- [ ] Enter Time Period From: 2024-12-01 08:00
- [ ] Enter Time Period To: 2024-12-01 07:00 (before start) → Shows "End time must be after start time"
- [ ] Enter Time Period To: 2024-12-01 10:00 (after start) → Error clears
- [ ] Enter future times → Shows "Times cannot be in the future"

### 3.9 Time Period Type Radio Buttons

- [ ] Both "DVR Time" and "Actual Time" options visible
- [ ] Select "DVR Time" → Selection works
- [ ] Select "Actual Time" → Selection works
- [ ] Leave unselected, try submit → Shows required error

### 3.10 Add Additional Time Frame (Single DVR)

- [ ] Click "+ Add Additional Time Frame" button → New time frame group appears
- [ ] New group has: Time Period From, Time Period To, Time Period Type, Camera Details
- [ ] New group has "Remove Time Frame" button
- [ ] Page scrolls to new time frame
- [ ] Fill in second time frame fields → Validation works
- [ ] Click "Remove Time Frame 2" → Group fades out and disappears
- [ ] Add 3 time frames total → All function independently

### 3.11 Add Another DVR System

- [ ] Click "+ Add Another DVR System" button → New DVR group appears
- [ ] New DVR shows header "DVR 2"
- [ ] DVR 2 has all same fields as DVR 1:
  - DVR Make/Model
  - Time & Date Correct radio
  - Time Offset (conditional)
  - DVR Retention
  - Has Video Monitor radio
  - One extraction time frame
  - "+ Add Additional Time Frame" button
  - Username and Password
- [ ] DVR 2 has "Remove DVR 2" button at bottom
- [ ] Page scrolls to new DVR group
- [ ] Progress bar updates (new required fields added)
- [ ] Fill DVR 2 fields → Validation works independently from DVR 1

### 3.12 Multiple DVRs with Multiple Time Frames

- [ ] Add DVR 2
- [ ] Add 2 time frames to DVR 1
- [ ] Add 3 time frames to DVR 2
- [ ] All 5 time frames (2+3) function correctly
- [ ] Each time frame validates independently
- [ ] Remove a time frame from DVR 1 → Only that frame is removed
- [ ] Remove entire DVR 2 → All DVR 2 time frames removed with it

### 3.13 DVR Fields (Optional vs Required)

Optional fields (can leave empty):
- [ ] DVR Make/Model → No error when empty
- [ ] DVR Retention → No error when empty
- [ ] Has Video Monitor → No error when unselected
- [ ] Username → No error when empty
- [ ] Time Offset (when "No" selected) → No error when empty

Required fields:
- [ ] Password → Shows error when empty
- [ ] Time Period From/To → Shows error when empty
- [ ] Time Period Type → Shows error when unselected
- [ ] Camera Details → Shows error when empty

### 3.14 Camera Details Field

- [ ] Accepts multi-line text
- [ ] Enter multiple camera descriptions (one per line)
- [ ] Check PDF includes all camera details

### 3.15 Incident Description (Required)

- [ ] Leave empty, try submit → Shows "This field is required"
- [ ] Enter detailed description → Validation passes

### 3.16 Progress Bar

- [ ] Empty form → 0%
- [ ] Fill required fields → Progress increases
- [ ] Add DVR 2 → Progress drops (new required fields)
- [ ] Fill DVR 2 fields → Progress returns to 100%

### 3.17 Draft Auto-Save (Complex Data)

- [ ] Fill DVR 1 fields
- [ ] Add DVR 2 and fill some fields
- [ ] Add time frames to both DVRs
- [ ] Wait 3 seconds
- [ ] Refresh page
- [ ] Click "Load Draft" → All DVRs and time frames restored correctly
- [ ] Check: All radio selections, all text fields, all time frames present

### 3.18 Remove DVR Functionality

- [ ] Add DVR 2 and DVR 3
- [ ] Fill some data in each
- [ ] Click "Remove DVR 2" → Only DVR 2 disappears
- [ ] DVR 3 header updates to "DVR 2" (renumbering occurs - verify in UI)
- [ ] Add another DVR → New one is labeled correctly

### 3.19 Successful Submission (Complex Case)

- [ ] Fill complete form with 2 DVRs
- [ ] DVR 1 has 2 time frames
- [ ] DVR 2 has 1 time frame
- [ ] Submit → Success toast appears
- [ ] PDF downloads: `FVU_Recovery_Request_[OccNum].pdf`
- [ ] Open PDF → Verify all DVRs and time frames are present
- [ ] Form clears after submission

---

## 4. Cross-Form Tests

### 4.1 Officer Info Persistence Across Forms

- [ ] Fill and submit Upload form with officer info
- [ ] Navigate to Analysis form → Officer fields pre-filled
- [ ] Navigate to Recovery form → Officer fields pre-filled
- [ ] Clear officer info on Recovery form
- [ ] Navigate to Upload form → Officer fields now empty
- [ ] This confirms shared localStorage for officer info

### 4.2 Draft Independence

- [ ] Fill partial data in Upload form, wait for auto-save
- [ ] Navigate to Analysis form, fill different data, wait for auto-save
- [ ] Navigate to Recovery form, fill different data, wait for auto-save
- [ ] Navigate back to Upload → Load draft shows Upload data (not Analysis)
- [ ] Navigate to Analysis → Load draft shows Analysis data
- [ ] Each form maintains its own independent draft

### 4.3 Theme Persistence Across Forms

- [ ] Set theme to Light on Upload form
- [ ] Navigate to Analysis form → Theme is still Light
- [ ] Navigate to Recovery form → Theme is still Light
- [ ] Toggle to Dark on Recovery form
- [ ] Navigate to Upload form → Theme is now Dark
- [ ] This confirms shared theme preference

---

## 5. Error Handling Tests

### 5.1 Network Offline Test

- [ ] Fill out a complete form
- [ ] Open Dev Tools → Network tab → Select "Offline" from throttling dropdown
- [ ] Click Submit
- [ ] Toast appears: "You appear to be offline. Your draft has been saved."
- [ ] Check Console → See "Draft saved" message
- [ ] Go back online
- [ ] Click "Load Draft" → Data is restored
- [ ] Submit again → Success

### 5.2 PDF Generation Error (Simulated)

This is harder to test manually, but check:

- [ ] Submit a valid form
- [ ] Check Console for "PDF generated: [size] bytes" message
- [ ] If error occurs, toast should show: "Failed to generate PDF"

### 5.3 Invalid Data Submission Attempt

- [ ] Fill form with all required fields
- [ ] Enter invalid occurrence number: "INVALID123"
- [ ] Try to submit → Validation blocks submission, shows error on field
- [ ] Scroll to first error field automatically
- [ ] Error field is highlighted with red border
- [ ] Error message appears below field

### 5.4 Console Error Check

Throughout all testing:

- [ ] No unexpected JavaScript errors in Console
- [ ] No 404 errors for missing resources
- [ ] No CORS errors (if testing with Supabase)

---

## 6. Accessibility Tests

### 6.1 Keyboard Navigation

- [ ] Press Tab key → Focus moves through form fields in logical order
- [ ] All form fields receive visible focus indicator
- [ ] Reach "Submit Request" button via Tab
- [ ] Press Enter on Submit button → Form submits
- [ ] Press Tab to theme toggle → Press Enter → Theme changes
- [ ] Navigate entire form using only keyboard (no mouse)

### 6.2 Screen Reader Compatibility (If Available)

- [ ] Required fields announced with "required"
- [ ] Error messages announced when validation fails
- [ ] Button purposes are clear
- [ ] Form sections have proper heading structure

### 6.3 Visual Indicators

- [ ] All required fields marked with red asterisk (*)
- [ ] Error messages appear in red text
- [ ] Invalid fields have red border
- [ ] Success states show green text/border
- [ ] Color is not the only indicator (text also present)

### 6.4 Text Sizing

- [ ] Increase browser zoom to 200% → Form remains usable
- [ ] All text remains readable
- [ ] No text overlap
- [ ] No horizontal scrolling (except for very narrow viewports)

---

## 7. Cross-Browser Testing

Test the same critical path in each browser:

### 7.1 Chrome (Latest)

- [ ] Upload form loads and functions
- [ ] Analysis form loads and functions
- [ ] Recovery form loads and functions
- [ ] PDF downloads successfully
- [ ] Draft save/load works
- [ ] Theme toggle works
- [ ] No console errors

### 7.2 Firefox (Latest)

- [ ] Upload form loads and functions
- [ ] Analysis form loads and functions
- [ ] Recovery form loads and functions
- [ ] PDF downloads successfully
- [ ] Draft save/load works
- [ ] Theme toggle works
- [ ] No console errors

### 7.3 Edge (Latest)

- [ ] Upload form loads and functions
- [ ] Analysis form loads and functions
- [ ] Recovery form loads and functions
- [ ] PDF downloads successfully
- [ ] Draft save/load works
- [ ] Theme toggle works
- [ ] No console errors

### 7.4 Safari (If Available)

- [ ] Upload form loads and functions
- [ ] Analysis form loads and functions
- [ ] Recovery form loads and functions
- [ ] PDF downloads successfully
- [ ] Draft save/load works
- [ ] Theme toggle works
- [ ] No console errors

---

## 8. Performance Tests

### 8.1 Load Time

- [ ] Clear cache
- [ ] Reload Upload form → Page loads in under 3 seconds
- [ ] Reload Analysis form → Page loads in under 3 seconds
- [ ] Reload Recovery form → Page loads in under 3 seconds

### 8.2 Form Responsiveness

- [ ] Type in text field → No lag (immediate response)
- [ ] Select dropdown options → Opens immediately
- [ ] Click buttons → Immediate visual feedback
- [ ] Toggle theme → Transition is smooth (under 0.5 seconds)

### 8.3 Complex Form Performance (Recovery)

- [ ] Add 5 DVR systems
- [ ] Add 5 time frames to each DVR (25 time frames total)
- [ ] Form remains responsive
- [ ] Scrolling is smooth
- [ ] Progress bar updates without delay
- [ ] Submit form → Generates PDF successfully (may take a few seconds)

---

## 9. Mobile/Responsive Testing (Optional)

If testing on mobile or tablet:

### 9.1 Mobile Layout

- [ ] Open form on mobile device (or use Chrome DevTools Device Mode)
- [ ] Form fields stack vertically
- [ ] All text is readable without zooming
- [ ] Buttons are large enough to tap (min 44x44px)
- [ ] No horizontal scrolling required
- [ ] Progress bar visible at bottom

### 9.2 Mobile Interaction

- [ ] Tap form fields → Keyboard appears
- [ ] Email field → Email keyboard appears (@, .com keys)
- [ ] Phone field → Number keyboard appears
- [ ] Date/time fields → Date picker appears
- [ ] Dropdown fields → Native picker appears

---

## 10. Regression Tests (After Bug Fixes)

Use this section to re-test specific areas after fixes:

- [ ] Re-test the specific bug that was fixed
- [ ] Re-test related functionality
- [ ] Re-run relevant sections from above
- [ ] Verify bug does not reappear

---

## Issues Found

Use this section to document any test failures:

| Test # | Issue Description | Severity | Steps to Reproduce | Screenshot? |
|--------|------------------|----------|-------------------|-------------|
| 1.3    | Email validation allows @peel.ca | High | Enter test@peel.ca in email field | No |
|        |                  |          |                   |             |
|        |                  |          |                   |             |
|        |                  |          |                   |             |

**Severity Levels:**
- **Critical:** Prevents form submission or causes data loss
- **High:** Major functionality broken, has workaround
- **Medium:** Functionality works but with issues
- **Low:** Cosmetic or minor usability issue

---

## Testing Notes

**Tester Name:** _________________
**Test Date:** _________________
**Environment:** _________________
**Build/Version:** _________________

**Additional Comments:**

_________________________________________
_________________________________________
_________________________________________
_________________________________________

---

## Sign-Off

- [ ] All critical tests passed
- [ ] All high-priority tests passed
- [ ] Issues documented in "Issues Found" section
- [ ] Ready for deployment (if all critical/high tests passed)

**Tester Signature:** _________________
**Date:** _________________
