# Upload Request Form - Annotated Breakdown

## Form Overview
The Upload Request Form is designed for submitting video evidence collected from external sources. It has a dark theme interface with sections for Evidence Information, Submitting Officer Information, Location Information, Video Timeframe, and Additional Information.

## Field-by-Field Breakdown

### Evidence Information Section

**1. Occurrence Number** *(Required)*
- Field name: `occNumber`
- Format: PR followed by numbers (e.g., PR240368708)
- Validation: Mandatory - As long as they have PR before a series of numbers it is valid

**2. Evidence Bag #**
- Field name: `evidenceBag`
- Should NOT be mandatory
- Optional field for evidence tracking

**3. Submitting Officer** *(Required)*
- Field name: `rName` (their system field name)
- Mandatory - no validation
- Last name or full name acceptable

**4. Badge #** *(Required)*
- Field name: `badge`
- Mandatory - no validation
- Officer's badge number

**5. Contact Number** *(Required)*
- Field name: `requestingPhone`
- Validation: Mandatory - as long as it has 10 numbers it should be valid
- Dashes or no dashes acceptable

**6. Email Address** *(Required)*
- Field name: `requestingEmail`
- Mandatory - needs to be @peelpolice.ca

### Location Information Section

**7. Business Name**
- Field name: `businessName`
- Not Mandatory - leave the helpers
- Optional field with helper text

**8. Location Address** *(Required)*
- Field name: `locationAddress`
- Mandatory - no validation rules
- Full address of the location

**9. City** *(Required)*
- Field name: `city`
- Mandatory - Dropdown should include:
  - Brampton
  - Mississauga
  - Toronto
  - Other
- When Other is selected the text field should become free type and a helper should appear asking them to enter the city

**10. Add Location Functionality**
- Link/button to add additional locations
- When clicked, should duplicate fields 7-9 (Business Name, Location Address, City)
- Each additional location set should be removable
- Multiple locations data structure needs to be handled in JSON/PDF

**11. Type of Media Submitted** *(Required)*
- Field name: `mediaType`
- Mandatory - Options should be:
  - USB
  - Hard Drive
  - SD Card
  - CD/DVD
  - Other
- Same free type for other but request media type

### Video Timeframe Section

**11. Video Start Time** *(Required)*
- Field name: `videoStartTime`
- Mandatory - date time picker 24hr time
- Format: June 24, 2024 at 14:00
- After time picker if possible yyy-mm-dd HH:mm

**12. Video End Time** *(Required)*  
- Field name: `videoEndTime`
- Mandatory - date time picker 24hr time
- Same format as start time

**13. Is the Time & Date correct?**
- Field name: `isTimeDateCorrect`
- Options - Yes, No
- Keep the "is DVR synchronized" line
- If they select Yes, show yellow warning:
  "Your confirmation of correct timestamp becomes part of the evidence. If the timestamp is not correct and it conflicts with other evidence or DVR timestamps this could cause issues with this evidence" (make it sound better and more compact)
- If they select No, a new text field should drop down for them to enter the time offset
- Helper in the text field should read: "e.g. DVR is 1hr 5min 30sec AHEAD of real time"
- As long as there are numbers in the text field mark it as valid

**14. DVR Earliest Date Available**
- Field name: `dvrEarliestDate`
- Not Mandatory
- Change label to "Earliest Recorded Date on DVR"
- When they enter the date, the retention time of the DVR should be calculated and displayed below
- Example: If today is June 23 and the DVR's earliest available recording is from June 15, then the DVR retention is 8 days
- Do not need any alerts or warnings about impending video write over
- This calculation can go in the calculations file

### Additional Information Section

**15. Other Information**
- Field name: `otherInfo`
- Not mandatory
- Textarea for any additional relevant information
- No validation needed

**18. Progress Bar**
- Like the progress bar at the bottom rather than the top
- Should start red, get yellow as it progresses
- Turn green when finished (like the forms)
- CSS can be used for all of the forms

## Third-Party Field Mapping

### Required Fields Mapping
- `rName` → **Submitting Officer** ✓
- `requestingEmail` → **Email Address** ✓
- `requestingPhone` → **Contact Number** ✓
- `reqArea` → Set to "upload" internally (can't be null/empty) ✓
- `fileDetails` → Combine: Evidence Bag #, Media Type, Location Info ✓
- `rfsDetails` → Full form details as text/narrative ✓
- `occType` → **Occurrence Number** (e.g., PR240368708) ✓
- `occDate` → **Incident Date** ✓ (added field #12)

### Fields That Don't Map
All required third-party fields are now covered with the addition of Incident Date.

## Key Implementation Notes

1. **Add Location** functionality allows multiple locations on single form
2. **Incident Date** field added to satisfy `occDate` requirement
3. **Occurrence Number** format is PR followed by numbers (not YYYY-######)
4. **Phone validation** just needs 10 digits total, formatting not enforced
5. **Conditional fields** appear/hide based on user selections
6. **DVR retention calculation** displays days but no warnings needed
7. **Progress bar** changes color as form is filled out