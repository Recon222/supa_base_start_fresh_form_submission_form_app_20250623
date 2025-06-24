# Analysis Form - Complete Specification & Implementation Guide

## 📋 Form Structure (In Correct Order)

**Important Note**: Based on the form images, "Location of Video" refers to the storage medium type (USB, Hard Drive, etc.), not a physical location. The physical address is captured in "Video Seized From" field.

### Section 1: Case Information

#### Fields (in order):

1. **Occurrence Number** *(Required)*
   - **Validation**: Must have "PR" prefix followed by numbers
   - **Example**: PR1234567
   - **Implementation**: Same as upload form
   - **Error Message**: "Must start with PR followed by numbers"

2. **Type of Offence** *(Required)*
   - **Type**: Dropdown
   - **Options**: 
     - Homicide
     - Missing Person
     - Other
   - **Conditional**: If "Other" selected, show text field for specification
   - **Implementation**: Same conditional pattern as upload form media type

3. **Location of Video** *(Required)*
   - **Type**: Dropdown
   - **Validation**: None (just required)
   - **Options**: 
     - Select...
     - NAS Storage
     - Evidence.com Locker
     - USB
     - Hard Drive
     - SD Card
     - CD/DVD
     - Other
   - **Conditional**: If "Other" selected, show text field for specification
   - **Note**: This is the storage medium where the video evidence is located

4. **Bag Number**
   - **Type**: Text input
   - **Required**: No
   - **Validation**: None
   - **Placeholder**: "Evidence bag identification"

5. **Locker Number**
   - **Type**: Number input (spinner)
   - **Required**: No
   - **Range**: 1-15
   - **Implementation**: Same as upload form

### Section 2: Officer Information (Display as "Submitting Investigator Information")

#### Fields (in order):

1. **Submitting Officer** *(Required)*
   - **Label**: "Submitting Investigator"
   - **Validation**: Required only
   - **Auto-populate**: Yes (from saved data)

2. **Badge Number** *(Required)*
   - **Validation**: Required only
   - **Auto-populate**: Yes

3. **Contact Number** *(Required)*
   - **Validation**: Must have 10 digits (dashes optional)
   - **Format**: XXX-XXX-XXXX (auto-format on blur)
   - **Auto-populate**: Yes

4. **Email Address** *(Required)*
   - **Validation**: Must end with @peelpolice.ca
   - **Error Message**: "Must be a valid @peelpolice.ca email"
   - **Auto-populate**: Yes

### Section 3: Evidence Details

#### Fields (in order):

1. **Video Seized From** *(Required)*
   - **Type**: Text input
   - **Validation**: None (just required)
   - **Placeholder**: "Address where video was recovered"

2. **Business Name** *(Optional)*
   - **Type**: Text input
   - **Required**: No
   - **Validation**: None
   - **Placeholder**: "Leave blank if none"
   - **Note**: Name of business at the address above

3. **City** *(Required)*
   - **Type**: Dropdown
   - **Options**:
     - Brampton
     - Mississauga
     - Toronto
     - Other
   - **Conditional**: If "Other" selected, show text field
   - **Placement**: Should be placed after Business Name

4. **Recording Date** *(Required)*
   - **Type**: Date/datetime picker
   - **Validation**: Must be before current date
   - **Implementation**: Global validation for all date fields

5. **Job Required** *(Required)*
   - **Type**: Dropdown
   - **Note**: This appears to be type of analysis needed
   - **Options**: To be determined (not shown in screenshots)
   - **Validation**: Required only

6. **File Names**
   - **Type**: Textarea
   - **Required**: No
   - **Validation**: None
   - **Placeholder**: "List all file names (one per line)"

### Section 4: Request Details

#### Fields (in order):

1. **Service Required** *(Required)* - **MOVED TO TOP**
   - **Type**: Dropdown
   - **Options**:
     - Video/Image Clarification
     - Audio Clarification
     - Comparator Analysis
     - Timeline
     - Make Playable
     - Data Carving
     - Other
   - **Conditional**: If "Other" selected, show text field

2. **Request Details** *(Required)*
   - **Type**: Textarea (large)
   - **Validation**: None (just required)
   - **Placeholder**: "Provide detailed information about your request..."
   - **Rows**: 6

3. **Additional Information**
   - **Type**: Textarea
   - **Required**: No
   - **Validation**: None
   - **Note**: Include checkboxes for:
     - Include cameras
     - Include timestamps
     - Include person/vehicle of interest
     - Include time offset info

## 🔧 Implementation Code Structure

### HTML Structure Pattern

```html
<!-- Evidence Details Section -->
<section class="form-section">
  <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Evidence Details</h2>
  
  <!-- Video Seized From - full width -->
  <div class="form-group">
    <label for="videoSeizedFrom" class="form-label">
      Video Seized From <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="videoSeizedFrom" name="videoSeizedFrom" 
           placeholder="Address where video was recovered" required>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Business Name - full width -->
  <div class="form-group">
    <label for="businessName" class="form-label">Business Name</label>
    <input type="text" class="form-control" id="businessName" name="businessName" 
           placeholder="Leave blank if none">
    <small class="form-text">Name of business at the address above</small>
  </div>
  
  <!-- City - full width -->
  <div class="form-group">
    <label for="city" class="form-label">
      City <span class="required">*</span>
    </label>
    <select class="form-control" id="city" name="city" required>
      <option value="">Select...</option>
      <option value="Brampton">Brampton</option>
      <option value="Mississauga">Mississauga</option>
      <option value="Toronto">Toronto</option>
      <option value="Other">Other</option>
    </select>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Conditional field for Other city -->
  <div class="form-group d-none" id="cityOtherGroup">
    <label for="cityOther" class="form-label">
      Specify City <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="cityOther" name="cityOther" 
           placeholder="Enter city name">
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Recording Date and Job Required continue below... -->
</section>
```

```html
<!-- Case Information Section -->
<section class="form-section">
  <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Case Information</h2>
  
  <!-- Row 1: Occurrence Number + Type of Offence -->
  <div class="form-row">
    <div class="form-group">
      <label for="occNumber" class="form-label">
        Occurrence Number <span class="required">*</span>
      </label>
      <input type="text" class="form-control" id="occNumber" name="occNumber" 
             placeholder="e.g., PR240368708" required>
      <small class="form-text">Format: PR followed by numbers</small>
      <div class="invalid-feedback"></div>
    </div>
    
    <div class="form-group">
      <label for="offenceType" class="form-label">
        Type of Offence <span class="required">*</span>
      </label>
      <select class="form-control" id="offenceType" name="offenceType" required>
        <option value="">Select...</option>
        <option value="Homicide">Homicide</option>
        <option value="Missing Person">Missing Person</option>
        <option value="Other">Other</option>
      </select>
      <div class="invalid-feedback"></div>
    </div>
  </div>
  
  <!-- Conditional field for Other offence type -->
  <div class="form-group d-none" id="offenceTypeOtherGroup">
    <label for="offenceTypeOther" class="form-label">
      Specify Offence Type <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="offenceTypeOther" 
           name="offenceTypeOther" placeholder="Please specify the offence type">
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Location of Video - full width -->
  <div class="form-group">
    <label for="videoLocation" class="form-label">
      Location of Video <span class="required">*</span>
    </label>
    <select class="form-control" id="videoLocation" name="videoLocation" required>
      <option value="">Select...</option>
      <option value="NAS Storage">NAS Storage</option>
      <option value="Evidence.com Locker">Evidence.com Locker</option>
      <option value="USB">USB</option>
      <option value="Hard Drive">Hard Drive</option>
      <option value="SD Card">SD Card</option>
      <option value="CD/DVD">CD/DVD</option>
      <option value="Other">Other</option>
    </select>
    <small class="form-text">Storage medium where the video evidence is located</small>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Conditional field for Other video location -->
  <div class="form-group d-none" id="videoLocationOtherGroup">
    <label for="videoLocationOther" class="form-label">
      Specify Storage Location <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="videoLocationOther" 
           name="videoLocationOther" placeholder="Please specify the storage location">
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Row 2: Bag Number + Locker Number -->
  <div class="form-row">
    <div class="form-group">
      <label for="bagNumber" class="form-label">Bag Number</label>
      <input type="text" class="form-control" id="bagNumber" name="bagNumber" 
             placeholder="Evidence bag identification">
    </div>
    
    <div class="form-group">
      <label for="lockerNumber" class="form-label">Locker Number</label>
      <input type="number" class="form-control" id="lockerNumber" name="lockerNumber" 
             min="1" max="15" placeholder="1-15">
      <small class="form-text">Evidence locker number (1-15)</small>
    </div>
  </div>
</section>

<!-- Evidence Details Section -->
<section class="form-section">
  <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Evidence Details</h2>
  
  <!-- Video Seized From - full width -->
  <div class="form-group">
    <label for="videoSeizedFrom" class="form-label">
      Video Seized From <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="videoSeizedFrom" name="videoSeizedFrom" 
           placeholder="Address where video was recovered" required>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Business Name - full width -->
  <div class="form-group">
    <label for="businessName" class="form-label">Business Name</label>
    <input type="text" class="form-control" id="businessName" name="businessName" 
           placeholder="Leave blank if none">
    <small class="form-text">Name of business at the address above</small>
  </div>
  
  <!-- City - full width -->
  <div class="form-group">
    <label for="city" class="form-label">
      City <span class="required">*</span>
    </label>
    <select class="form-control" id="city" name="city" required>
      <option value="">Select...</option>
      <option value="Brampton">Brampton</option>
      <option value="Mississauga">Mississauga</option>
      <option value="Toronto">Toronto</option>
      <option value="Other">Other</option>
    </select>
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Conditional field for Other city -->
  <div class="form-group d-none" id="cityOtherGroup">
    <label for="cityOther" class="form-label">
      Specify City <span class="required">*</span>
    </label>
    <input type="text" class="form-control" id="cityOther" name="cityOther" 
           placeholder="Enter city name">
    <div class="invalid-feedback"></div>
  </div>
  
  <!-- Recording Date and Job Required continue below... -->
</section>
```

### CONFIG Updates

```javascript
// Add to FIELD_NAMES
FIELD_NAMES: {
  // ... existing fields ...
  
  // Analysis form specific
  OFFENCE_TYPE: 'offenceType',
  OFFENCE_TYPE_OTHER: 'offenceTypeOther',
  VIDEO_LOCATION: 'videoLocation',
  VIDEO_LOCATION_OTHER: 'videoLocationOther',
  BAG_NUMBER: 'bagNumber',
  VIDEO_SEIZED_FROM: 'videoSeizedFrom',
  BUSINESS_NAME: 'businessName',
  CITY: 'city',
  CITY_OTHER: 'cityOther',
  RECORDING_DATE: 'recordingDate',
  JOB_REQUIRED: 'jobRequired',
  FILE_NAMES: 'fileNames',
  SERVICE_REQUIRED: 'serviceRequired',
  SERVICE_REQUIRED_OTHER: 'serviceRequiredOther',
  REQUEST_DETAILS: 'requestDetails',
  ADDITIONAL_INFO: 'additionalInfo'
}
```

### Validation Updates

No new validation functions needed - reuse existing:
- Phone validation: already exists
- Email validation: already exists  
- Occurrence number: already exists
- Date validation: add global past date check
- Locker number: already exists

### Form Handler Implementation

```javascript
export class AnalysisFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.setupAnalysisSpecificListeners();
  }
  
  setupAnalysisSpecificListeners() {
    // Video Location conditional (if "Other" option exists)
    this.setupConditionalField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther', 'Other');
    
    // Offence Type conditional
    this.setupConditionalField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther', 'Other');
    
    // City conditional
    this.setupConditionalField('city', 'cityOtherGroup', 'cityOther', 'Other');
    
    // Service Required conditional
    this.setupConditionalField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther', 'Other');
  }
  
  setupConditionalField(selectId, groupId, inputId, triggerValue) {
    const selectField = this.form.querySelector(`#${selectId}`);
    if (selectField) {
      selectField.addEventListener('change', (e) => {
        const group = document.getElementById(groupId);
        const input = document.getElementById(inputId);
        const show = e.target.value === triggerValue;
        
        toggleElement(group, show);
        if (show) {
          input.setAttribute('required', 'required');
        } else {
          input.removeAttribute('required');
          input.value = '';
          this.showFieldValidation(input, null);
        }
      });
    }
  }
}
```

## ✅ Key Implementation Notes

1. **Field Order**: Follow the exact order shown in the form images
2. **Conditional Fields**: Four dropdowns with "Other" option (same pattern as upload form)
3. **No Multiple Sections**: Unlike upload form, no need for multiple location handling
4. **Date Validation**: Add global validation for past dates only
5. **Officer → Investigator**: Remember to change all public-facing "Officer" text to "Investigator"
6. **Progress Bar**: Only required fields count toward completion
7. **Auto-save**: Drafts save every 2 seconds of inactivity

## 🧪 Testing Checklist

- [ ] All 11 required fields validate correctly
- [ ] All 4 conditional "Other" fields work properly
- [ ] Phone number formats correctly (XXX-XXX-XXXX)
- [ ] Email validates @peelpolice.ca domain
- [ ] Occurrence number validates PR prefix
- [ ] Date picker prevents future dates
- [ ] Locker number spinner 1-15 range works
- [ ] Investigator info auto-populates
- [ ] Progress bar reflects only required fields
- [ ] Form saves and loads drafts correctly