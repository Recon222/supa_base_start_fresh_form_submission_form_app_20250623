# Recovery Form - Complete Specification & Implementation Guide

## 📋 Form Structure (In Correct Order)

### Section 1: Investigator Information

#### Fields (in order):

1. **Submitting Investigator (Last Name)** *(Required)*
   - **Label**: "Submitting Investigator"
   - **Field Name**: `rName`
   - **Validation**: Required only
   - **Auto-populate**: Yes

2. **Badge #** *(Required)*
   - **Field Name**: `badge`
   - **Validation**: Required only
   - **Auto-populate**: Yes

3. **Submitting Investigator Contact Number** *(Required)*
   - **Label**: "Contact Number"
   - **Field Name**: `requestingPhone`
   - **Validation**: 10 digits required
   - **Format**: XXX-XXX-XXXX
   - **Auto-populate**: Yes

4. **Submitting Investigator Email** *(Required)*
   - **Label**: "Email Address"
   - **Field Name**: `requestingEmail`
   - **Validation**: Must end with @peelpolice.ca
   - **Auto-populate**: Yes

5. **Unit** *(Required)*
   - **Type**: Text input
   - **Field Name**: `unit`
   - **Placeholder**: "Unit name/number"
   - **Validation**: Required only

6. **Offence**
   - **Type**: Dropdown
   - **Field Name**: `offenceType`
   - **Required**: No
   - **Options**: Same as analysis form (Homicide, Missing Person, Other)
   - **Conditional**: If "Other" selected, show text field

### Section 2: Location Information

#### Fields (in order):

1. **Business Name**
   - **Field Name**: `businessName`
   - **Required**: No
   - **Validation**: None
   - **Placeholder**: "Name of business"

2. **Location Address** *(Required)*
   - **Field Name**: `locationAddress`
   - **Validation**: Required only
   - **Placeholder**: "Full address"

3. **City** *(Required)*
   - **Type**: Dropdown
   - **Field Name**: `city`
   - **Options**: Brampton, Mississauga, Toronto, Other
   - **Conditional**: If "Other" selected, show text field

4. **Location Contact** *(Required)*
   - **Field Name**: `locationContact`
   - **Validation**: Required only
   - **Placeholder**: "Contact person name"

5. **Location Contact Phone Number** *(Required)*
   - **Field Name**: `locationContactPhone`
   - **Validation**: 10 digits
   - **Format**: XXX-XXX-XXXX

### Section 3: Video Extraction Details

#### Fields (in order):

1. **Time Period to be Extracted - From** *(Required)*
   - **Type**: Datetime-local
   - **Field Name**: `extractionStartTime`
   - **Validation**: Required, must be before end time

2. **Time Period to be Extracted - To** *(Required)*
   - **Type**: Datetime-local
   - **Field Name**: `extractionEndTime`
   - **Validation**: Required, must be after start time

3. **Time Period is** *(Required)*
   - **Type**: Radio buttons
   - **Field Name**: `timePeriodType`
   - **Options**: 
     - DVR Time
     - Actual Time
   - **Validation**: Required

### Section 4: DVR Information

#### Fields (in order):

1. **DVR Make / Model**
   - **Field Name**: `dvrMakeModel`
   - **Required**: No
   - **Validation**: None
   - **Placeholder**: "e.g., Hikvision DS-7200"

2. **Is the Time & Date correct?**
   - **Type**: Radio buttons (NOT dropdown)
   - **Field Name**: `isTimeDateCorrect`
   - **Required**: No
   - **Options**: Yes / No
   - **Conditional**: If "No" selected, show time offset field
   - **Note**: NO warning message when "Yes" selected

3. **Time Offset** *(Conditional, NOT Required)*
   - **Field Name**: `timeOffset`
   - **Shows when**: Time & Date correct = "No"
   - **Required**: No (different from upload form)
   - **Placeholder**: "e.g., DVR is 1hr 5min 30sec AHEAD of real time"

4. **Camera Name(s) AND/OR Camera Number(s) to be Extracted** *(Required)*
   - **Type**: Textarea
   - **Field Name**: `cameraDetails`
   - **Validation**: Required only
   - **Placeholder**: "List all cameras needed"

5. **DVR Retention**
   - **Type**: Date
   - **Field Name**: `dvrRetention`
   - **Required**: No
   - **Note**: Earliest date available on DVR

### Section 5: Access Information

#### Fields (in order):

1. **Username**
   - **Field Name**: `dvrUsername`
   - **Required**: No
   - **Validation**: None
   - **Note**: DVR login username

2. **Password** *(Required)*
   - **Field Name**: `dvrPassword`
   - **Type**: Text (NOT password type - per requirements)
   - **Validation**: Required only
   - **Note**: DVR passwords are not sensitive

3. **Is there a video monitor on site to view the DVR?**
   - **Type**: Radio buttons
   - **Field Name**: `hasVideoMonitor`
   - **Options**: Yes / No
   - **Required**: No

### Section 6: Additional Information

#### Fields (in order):

1. **Description of what takes place on camera** *(Required)*
   - **Type**: Textarea (large)
   - **Field Name**: `incidentDescription`
   - **Validation**: Required
   - **Placeholder**: "Provide detailed description of the incident captured on video"
   - **Rows**: 6

## 🔧 Implementation Code Structure

### CONFIG Updates

```javascript
// Add to FIELD_NAMES
FIELD_NAMES: {
  // ... existing fields ...
  
  // Recovery form specific
  UNIT: 'unit',
  LOCATION_CONTACT: 'locationContact',
  LOCATION_CONTACT_PHONE: 'locationContactPhone',
  EXTRACTION_START_TIME: 'extractionStartTime',
  EXTRACTION_END_TIME: 'extractionEndTime',
  TIME_PERIOD_TYPE: 'timePeriodType',
  DVR_MAKE_MODEL: 'dvrMakeModel',
  CAMERA_DETAILS: 'cameraDetails',
  DVR_RETENTION: 'dvrRetention',
  DVR_USERNAME: 'dvrUsername',
  DVR_PASSWORD: 'dvrPassword',
  HAS_VIDEO_MONITOR: 'hasVideoMonitor',
  INCIDENT_DESCRIPTION: 'incidentDescription'
}
```

### Form Handler Implementation

```javascript
export class RecoveryFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.setupRecoverySpecificListeners();
  }
  
  setupRecoverySpecificListeners() {
    // Offence Type conditional (optional field)
    this.setupConditionalField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther', 'Other');
    
    // City conditional
    this.setupConditionalField('city', 'cityOtherGroup', 'cityOther', 'Other');
    
    // Time & Date correct - special handling (no warning, optional offset)
    const timeSyncRadios = this.form.querySelectorAll('[name="isTimeDateCorrect"]');
    timeSyncRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const offsetGroup = document.getElementById('timeOffsetGroup');
        const offsetField = document.getElementById('timeOffset');
        
        if (e.target.value === 'No') {
          toggleElement(offsetGroup, true);
          // Note: NOT setting required attribute - different from upload form
        } else {
          toggleElement(offsetGroup, false);
          offsetField.value = '';
        }
      });
    });
    
    // Extraction time validation
    const startTimeField = this.form.querySelector('#extractionStartTime');
    const endTimeField = this.form.querySelector('#extractionEndTime');
    
    if (startTimeField && endTimeField) {
      endTimeField.addEventListener('change', () => {
        const dateError = validateDateRange(startTimeField.value, endTimeField.value);
        if (dateError) {
          this.showFieldValidation(endTimeField, dateError);
        }
      });
    }
  }
  
  collectFormData() {
    const data = super.collectFormData();
    
    // Set request area
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = CONFIG.FORM_TYPES.RECOVERY;
    
    // Set occurrence date to extraction start date
    if (data.extractionStartTime) {
      data[CONFIG.FIELD_NAMES.OCCURRENCE_DATE] = data.extractionStartTime.split('T')[0];
    }
    
    // Generate field summaries
    const summaries = generateFieldSummaries(data);
    Object.assign(data, summaries);
    
    return data;
  }
}
```

### HTML Structure Pattern

```html
<!-- Investigator Information Section -->
<section class="form-section">
  <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Investigator Information</h2>
  
  <!-- Row 1: Name + Badge -->
  <div class="form-row">
    <div class="form-group">
      <label for="rName" class="form-label">
        Submitting Investigator <span class="required">*</span>
      </label>
      <input type="text" class="form-control" id="rName" name="rName" 
             placeholder="Last name" required>
      <div class="invalid-feedback"></div>
    </div>
    
    <div class="form-group">
      <label for="badge" class="form-label">
        Badge # <span class="required">*</span>
      </label>
      <input type="text" class="form-control" id="badge" name="badge" 
             placeholder="Badge number" required>
      <div class="invalid-feedback"></div>
    </div>
  </div>
  
  <!-- Row 2: Phone + Email -->
  <div class="form-row">
    <div class="form-group">
      <label for="requestingPhone" class="form-label">
        Contact Number <span class="required">*</span>
      </label>
      <input type="tel" class="form-control" id="requestingPhone" name="requestingPhone" 
             placeholder="XXX-XXX-XXXX" required>
      <small class="form-text">10 digits required (dashes optional)</small>
      <div class="invalid-feedback"></div>
    </div>
    
    <div class="form-group">
      <label for="requestingEmail" class="form-label">
        Email Address <span class="required">*</span>
      </label>
      <input type="email" class="form-control" id="requestingEmail" name="requestingEmail" 
             placeholder="investigator@peelpolice.ca" required>
      <div class="invalid-feedback"></div>
    </div>
  </div>
  
  <!-- Unit - standalone -->
  <div class="form-group">
    <label for="unit" class="form-label">
      Unit <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="unit" name="unit" 
           placeholder="Unit name/number" required>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Offence type - optional -->
  <div class="form-group">
    <label for="offenceType" class="form-label">Offence</label>
    <select class="form-control" id="offenceType" name="offenceType">
      <option value="">Select...</option>
      <option value="Homicide">Homicide</option>
      <option value="Missing Person">Missing Person</option>
      <option value="Other">Other</option>
    </select>
  </div>
  
  <!-- Clear investigator info button -->
  <div class="form-group text-right">
    <button type="button" class="btn btn-sm btn-secondary" id="clearOfficerInfo">
      Clear Investigator Info
    </button>
    <small class="form-text d-block mt-1">
      Removes saved investigator information from this browser
    </small>
  </div>
</section>
```

## ✅ Key Implementation Notes

1. **Investigator vs Officer**: 
   - Public labels use "Investigator"
   - "Officer-in-charge" keeps "Officer" as it's a specific role title
   - Internal code maintains "officer" naming

2. **Time & Date Correct**: 
   - Radio buttons (NOT dropdown like shown in screenshot)
   - NO warning when "Yes" selected
   - Time offset is NOT required when "No" selected

3. **DVR Passwords**: 
   - Plain text fields (not password type)
   - These are not considered sensitive

4. **Required Fields**: 15 total required fields

5. **Conditional Fields**: 
   - Offence Type → Other
   - City → Other
   - Time & Date → Time Offset (but NOT required)

6. **Progress Bar**: Only counts the 15 required fields

## 🧪 Testing Checklist

- [ ] All 15 required fields validate correctly
- [ ] Investigator info auto-populates
- [ ] Time extraction range validates properly
- [ ] Time & Date radio shows offset field when "No"
- [ ] Time offset is NOT required (can submit without it)
- [ ] NO warning message when Time & Date = "Yes"
- [ ] City "Other" conditional works
- [ ] Offence "Other" conditional works (optional)
- [ ] Phone numbers format correctly
- [ ] Email validates @peelpolice.ca
- [ ] DVR password shows as plain text
- [ ] Draft saves and loads
- [ ] Progress bar accurate