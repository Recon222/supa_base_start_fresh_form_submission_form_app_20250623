/**
 * Form Field Builder
 * Reusable field creation utilities for dynamic form fields
 */

import { CONFIG } from '../config.js';
import { createElement } from '../utils.js';

export class FormFieldBuilder {
  // =========================================================================
  // GENERIC FIELD CREATION METHODS (Analysis form and shared)
  // =========================================================================

  /**
   * Create text input field
   * @param {string} baseName - Field base name
   * @param {number} index - Field index (0 for first)
   * @param {string} label - Field label text
   * @param {boolean} required - Whether field is required
   * @param {string} helpText - Help text below field
   * @param {string} placeholder - Placeholder text
   * @returns {HTMLElement} Form group element
   */
  static createTextField(baseName, index, label, required, helpText = '', placeholder = '') {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: placeholder
    });

    if (required) {
      input.setAttribute('required', 'required');
    }

    group.appendChild(labelEl);
    group.appendChild(input);

    if (helpText) {
      const small = createElement('small', { className: 'form-text' }, helpText);
      group.appendChild(small);
    }

    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create textarea field
   * @param {string} baseName - Field base name
   * @param {number} index - Field index (0 for first)
   * @param {string} label - Field label text
   * @param {boolean} required - Whether field is required
   * @param {string} placeholder - Placeholder text
   * @param {number} rows - Number of rows
   * @returns {HTMLElement} Form group element
   */
  static createTextareaField(baseName, index, label, required, placeholder = '', rows = 4) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const textarea = createElement('textarea', {
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      rows: rows.toString(),
      placeholder: placeholder
    });

    if (required) {
      textarea.setAttribute('required', 'required');
    }

    group.appendChild(labelEl);
    group.appendChild(textarea);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create select field
   * @param {string} baseName - Field base name
   * @param {number} index - Field index (0 for first)
   * @param {string} label - Field label text
   * @param {Array} options - Array of {value, text} options
   * @param {boolean} required - Whether field is required
   * @returns {HTMLElement} Form group element
   */
  static createSelectField(baseName, index, label, options, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const select = createElement('select', {
      className: 'form-control',
      id: fieldId,
      name: fieldName
    });

    if (required) {
      select.setAttribute('required', 'required');
    }

    options.forEach(option => {
      select.appendChild(createElement('option', {
        value: option.value
      }, option.text));
    });

    group.appendChild(labelEl);
    group.appendChild(select);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create phone input field with proper type and validation
   * @param {string} baseName - Field base name
   * @param {number} index - Field index
   * @param {string} label - Field label
   * @param {boolean} required - Whether required
   * @returns {HTMLElement} Form group element
   */
  static createPhoneField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'tel',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: '9055551234',
      pattern: '[0-9]{10}',
      inputmode: 'tel'
    });

    if (required) {
      input.setAttribute('required', 'required');
    }

    const small = createElement('small', { className: 'form-text' },
      '10 digits, no dashes or spaces');

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create email input field with Peel Police domain validation
   * @param {string} baseName - Field base name
   * @param {number} index - Field index
   * @param {string} label - Field label
   * @param {boolean} required - Whether required
   * @returns {HTMLElement} Form group element
   */
  static createEmailField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'email',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: 'officer@peelpolice.ca'
    });

    if (required) {
      input.setAttribute('required', 'required');
    }

    const small = createElement('small', { className: 'form-text' },
      'Must be @peelpolice.ca email');

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create date input field
   * @param {string} baseName - Field base name
   * @param {number} index - Field index
   * @param {string} label - Field label
   * @param {boolean} required - Whether required
   * @param {Object} options - Additional options (maxDate, etc.)
   * @returns {HTMLElement} Form group element
   */
  static createDateField(baseName, index, label, required, options = {}) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'date',
      className: 'form-control',
      id: fieldId,
      name: fieldName
    });

    if (required) {
      input.setAttribute('required', 'required');
    }

    // Apply max date if specified (for past date validation)
    if (options.maxDate === 'today') {
      input.setAttribute('max', new Date().toISOString().split('T')[0]);
    }

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create "Other" conditional field - hidden by default
   * @param {string} baseName - Field base name (e.g., 'offenceTypeOther')
   * @param {number} index - Field index
   * @param {string} labelPrefix - Label prefix (e.g., 'Offence Type' -> "Specify Offence Type")
   * @returns {HTMLElement} Form group element with d-none class
   */
  static createOtherField(baseName, index, labelPrefix) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = fieldName;
    const groupId = index === 0 ? `${baseName}Group` : `${baseName}Group_${index}`;

    const group = createElement('div', {
      className: 'form-group d-none',
      id: groupId
    });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = `Specify ${labelPrefix} <span class="required">*</span>`;

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: `Enter ${labelPrefix.toLowerCase()}`
    });
    // Note: required is NOT set initially - it's added dynamically when "Other" is selected

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create occurrence number field (PR format)
   * @returns {HTMLElement} Form group element
   */
  static createOccurrenceNumberField() {
    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: 'occNumber',
      className: 'form-label'
    });
    label.innerHTML = 'Occurrence Number <span class="required">*</span>';

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: 'occNumber',
      name: 'occNumber',
      placeholder: 'PR2024001234',
      required: 'required'
    });

    const small = createElement('small', { className: 'form-text' },
      'Must start with PR followed by numbers');

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create locker number field (1-28 range)
   * @returns {HTMLElement} Form group element
   */
  static createLockerNumberField() {
    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: 'lockerNumber',
      className: 'form-label'
    }, 'FVU Locker #');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: 'lockerNumber',
      name: 'lockerNumber',
      placeholder: '1-28',
      inputmode: 'numeric'
    });
    // Note: lockerNumber is OPTIONAL - no required attribute

    const small = createElement('small', { className: 'form-text' },
      'Enter locker number (1-28)');

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  // =========================================================================
  // ANALYSIS FORM SECTION BUILDERS
  // =========================================================================

  /**
   * Create case information section for Analysis form
   * @returns {HTMLElement} Section element with case fields
   */
  static createCaseInformationSection() {
    const section = createElement('section', { className: 'form-section' });

    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Case Information');
    section.appendChild(heading);

    // Row: Occurrence Number + Type of Offence
    const row = createElement('div', { className: 'form-row' });

    // Occurrence Number
    row.appendChild(this.createOccurrenceNumberField());

    // Type of Offence (with Other conditional)
    const offenceGroup = this.createSelectField('offenceType', 0, 'Type of Offence',
      CONFIG.OFFENCE_TYPE_OPTIONS, true);
    row.appendChild(offenceGroup);

    section.appendChild(row);

    // Offence Type Other (hidden by default)
    section.appendChild(this.createOtherField('offenceTypeOther', 0, 'Offence Type'));

    return section;
  }

  /**
   * Create video source information section for Analysis form
   * @returns {HTMLElement} Section element with video source fields
   */
  static createVideoSourceSection() {
    const section = createElement('section', { className: 'form-section' });

    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Video Source Information');
    section.appendChild(heading);

    // Row 1: Video Location + Video Seized From
    const row1 = createElement('div', { className: 'form-row' });

    const locationGroup = this.createSelectField('videoLocation', 0, 'Where is the Video Currently Stored?',
      CONFIG.VIDEO_LOCATION_OPTIONS, true);
    row1.appendChild(locationGroup);

    // Seized From field
    row1.appendChild(this.createTextField('videoSeizedFrom', 0, 'Video Seized From',
      false, 'Location/business where video was obtained'));

    section.appendChild(row1);

    // Video Location Other (hidden by default)
    section.appendChild(this.createOtherField('videoLocationOther', 0, 'Storage Location'));

    // Locker Info Group (hidden by default, shows when "Locker" selected)
    const lockerGroup = createElement('div', {
      className: 'form-row d-none',
      id: 'lockerInfoGroup'
    });

    // bagNumber - OPTIONAL field (no required attribute)
    lockerGroup.appendChild(this.createTextField('bagNumber', 0, 'Evidence Bag Number',
      false, 'Bag number containing the evidence'));

    // lockerNumber - OPTIONAL field
    lockerGroup.appendChild(this.createLockerNumberField());

    section.appendChild(lockerGroup);

    // Recording Date (with past date restriction)
    section.appendChild(this.createDateField('recordingDate', 0, 'Original Recording Date', false, {
      maxDate: 'today' // Prevent future dates
    }));

    return section;
  }

  /**
   * Create work request section for Analysis form
   * @returns {HTMLElement} Section element with work request fields
   */
  static createWorkRequestSection() {
    const section = createElement('section', { className: 'form-section' });

    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Work Request');
    section.appendChild(heading);

    // Job Required
    section.appendChild(this.createTextareaField('jobRequired', 0, 'What is the Job Required?',
      true, 'Describe what you need done with the video'));

    // File Names
    section.appendChild(this.createTextareaField('fileNames', 0, 'File Name(s)',
      true, 'List the specific file names to be analyzed'));

    // Service Required (with Other conditional)
    section.appendChild(this.createSelectField('serviceRequired', 0, 'Service Required',
      CONFIG.SERVICE_REQUIRED_OPTIONS, true));

    // Service Required Other (hidden by default)
    section.appendChild(this.createOtherField('serviceRequiredOther', 0, 'Service Type'));

    // Request Details
    section.appendChild(this.createTextareaField('requestDetails', 0, 'Request Details',
      true, 'Provide detailed information about your request'));

    // Additional Information
    section.appendChild(this.createTextareaField('additionalInfo', 0, 'Additional Information',
      false, 'Any other relevant information'));

    return section;
  }

  /**
   * Create investigator section for Analysis form
   * @returns {HTMLElement} Section element with investigator fields
   */
  static createInvestigatorSection() {
    const section = createElement('section', { className: 'form-section' });

    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Submitting Investigator Information');
    section.appendChild(heading);

    // Row 1: Name + Badge
    const row1 = createElement('div', { className: 'form-row' });
    row1.appendChild(this.createTextField('rName', 0, 'Investigator Name', true, '', 'Full name'));
    row1.appendChild(this.createTextField('badge', 0, 'Badge Number', true, '', 'Badge #'));
    section.appendChild(row1);

    // Row 2: Phone + Email
    const row2 = createElement('div', { className: 'form-row' });
    row2.appendChild(this.createPhoneField('requestingPhone', 0, 'Contact Phone', true));
    row2.appendChild(this.createEmailField('requestingEmail', 0, 'Email Address', true));
    section.appendChild(row2);

    return section;
  }

  // =========================================================================
  // EXISTING METHODS (Upload/Recovery forms)
  // =========================================================================

  /**
   * Create a location field (business name or address)
   */
  static createLocationField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: baseName === 'businessName' ? 'Leave blank if none' : 'Full address',
      required: required ? 'required' : null
    });

    group.appendChild(labelEl);
    group.appendChild(input);

    if (baseName === 'businessName') {
      const small = createElement('small', { className: 'form-text' }, 'Name of the business where video was collected');
      group.appendChild(small);
    }

    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create a city select field with "Other" option
   */
  static createCityField(index) {
    const fieldName = index === 0 ? 'city' : `city_${index}`;
    const fieldId = index === 0 ? 'city' : `city_${index}`;
    const otherFieldName = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherFieldId = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherGroupId = index === 0 ? 'cityOtherGroup' : `cityOtherGroup_${index}`;

    const cityGroup = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    label.innerHTML = 'City <span class="required">*</span>';

    const citySelect = createElement('select', {
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      required: 'required'
    });

    CONFIG.CITY_OPTIONS.forEach(option => {
      citySelect.appendChild(createElement('option', {
        value: option.value
      }, option.text));
    });

    cityGroup.appendChild(label);
    cityGroup.appendChild(citySelect);
    cityGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    // Other city field
    const otherGroup = createElement('div', {
      className: 'form-group d-none',
      id: otherGroupId
    });

    const otherLabel = createElement('label', {
      htmlFor: otherFieldId,
      className: 'form-label'
    });
    otherLabel.innerHTML = 'Specify City <span class="required">*</span>';

    const otherInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: otherFieldId,
      name: otherFieldName,
      placeholder: 'Enter city name'
    });

    otherGroup.appendChild(otherLabel);
    otherGroup.appendChild(otherInput);
    otherGroup.appendChild(createElement('small', { className: 'form-text' }, 'Please enter the city name'));
    otherGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    const wrapper = createElement('div');
    wrapper.appendChild(cityGroup);
    wrapper.appendChild(otherGroup);

    return wrapper;
  }

  /**
   * Create a time field (datetime-local input)
   */
  static createTimeField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'datetime-local',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      required: required ? 'required' : null
    });

    const small = createElement('small', { className: 'form-text' },
      baseName.includes('Start') ? 'When the relevant video begins' : 'When the relevant video ends'
    );

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create time sync field (Is Time & Date correct?)
   */
  static createTimeSyncField(index) {
    const fieldName = index === 0 ? 'isTimeDateCorrect' : `isTimeDateCorrect_${index}`;
    const yesId = index === 0 ? 'timeCorrectYes' : `timeCorrectYes_${index}`;
    const noId = index === 0 ? 'timeCorrectNo' : `timeCorrectNo_${index}`;
    const warningId = index === 0 ? 'timeSyncWarning' : `timeSyncWarning_${index}`;
    const offsetGroupId = index === 0 ? 'timeOffsetGroup' : `timeOffsetGroup_${index}`;
    const offsetFieldId = index === 0 ? 'timeOffset' : `timeOffset_${index}`;
    const offsetFieldName = index === 0 ? 'timeOffset' : `timeOffset_${index}`;

    const container = createElement('div');

    // Radio group
    const group = createElement('div', { className: 'form-group' });
    const label = createElement('label', { className: 'form-label' });
    label.innerHTML = 'Is the Time & Date correct? <span class="required">*</span>';
    const small = createElement('small', { className: 'form-text mb-2 d-block' }, 'Is the DVR time synchronized with actual time?');

    const yesDiv = createElement('div', { className: 'form-check' });
    const yesInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: yesId,
      value: 'Yes',
      required: 'required'
    });
    const yesLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: yesId
    }, 'Yes');
    yesDiv.appendChild(yesInput);
    yesDiv.appendChild(yesLabel);

    const noDiv = createElement('div', { className: 'form-check' });
    const noInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: noId,
      value: 'No',
      required: 'required'
    });
    const noLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: noId
    }, 'No');
    noDiv.appendChild(noInput);
    noDiv.appendChild(noLabel);

    group.appendChild(label);
    group.appendChild(small);
    group.appendChild(yesDiv);
    group.appendChild(noDiv);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    // Warning message
    const warning = createElement('div', {
      className: 'alert alert-warning d-none',
      id: warningId,
      style: 'margin-top: 1rem;'
    });
    warning.innerHTML = '<strong>Important:</strong> Your confirmation of correct timestamp becomes part of the evidence. If the timestamp conflicts with other evidence or DVR timestamps, this could affect the evidence validity.';

    // Time offset field
    const offsetGroup = createElement('div', {
      className: 'form-group d-none',
      id: offsetGroupId
    });
    const offsetLabel = createElement('label', {
      htmlFor: offsetFieldId,
      className: 'form-label'
    });
    offsetLabel.innerHTML = 'Time Offset <span class="required">*</span>';
    const offsetInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: offsetFieldId,
      name: offsetFieldName,
      placeholder: 'e.g., DVR is 1hr 5min 30sec AHEAD of real time'
    });
    const offsetSmall = createElement('small', { className: 'form-text' }, 'Describe how the DVR time differs from actual time');

    offsetGroup.appendChild(offsetLabel);
    offsetGroup.appendChild(offsetInput);
    offsetGroup.appendChild(offsetSmall);
    offsetGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));

    container.appendChild(group);
    container.appendChild(warning);
    container.appendChild(offsetGroup);

    return container;
  }

  /**
   * Create DVR earliest date field with retention calculation
   */
  static createDvrDateField(index, onChangeCallback) {
    const fieldName = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const fieldId = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const retentionId = index === 0 ? 'retentionCalculation' : `retentionCalculation_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    }, 'Earliest Recorded Date on DVR');

    const input = createElement('input', {
      type: 'date',
      className: 'form-control',
      id: fieldId,
      name: fieldName
    });

    const small = createElement('small', { className: 'form-text' }, 'The earliest date available on the DVR system');
    const retentionDiv = createElement('div', {
      id: retentionId,
      className: 'text-info mt-2'
    });

    // Add change listener if callback provided
    if (onChangeCallback) {
      input.addEventListener('change', onChangeCallback);
    }

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(retentionDiv);

    return group;
  }

  /**
   * Create extraction time field for recovery form
   */
  static createExtractionTimeField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const labelEl = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    labelEl.innerHTML = label + (required ? ' <span class="required">*</span>' : '');

    const input = createElement('input', {
      type: 'datetime-local',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      required: required ? 'required' : null
    });

    const small = createElement('small', { className: 'form-text' },
      baseName.includes('Start') ? 'Start of video period to extract' : 'End of video period to extract'
    );

    group.appendChild(labelEl);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create time period type radio field for recovery form
   */
  static createTimePeriodTypeField(index) {
    const fieldName = index === 0 ? 'timePeriodType' : `timePeriodType_${index}`;
    const dvrId = index === 0 ? 'timeDVR' : `timeDVR_${index}`;
    const actualId = index === 0 ? 'timeActual' : `timeActual_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', { className: 'form-label' });
    label.innerHTML = 'Time Period Type <span class="required">*</span>';

    const small = createElement('small', { className: 'form-text mb-2 d-block' },
      'Are the times above in DVR time or actual time?'
    );

    const dvrDiv = createElement('div', { className: 'form-check' });
    const dvrInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: dvrId,
      value: 'DVR Time',
      required: 'required'
    });
    const dvrLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: dvrId
    }, 'DVR Time');
    dvrDiv.appendChild(dvrInput);
    dvrDiv.appendChild(dvrLabel);

    const actualDiv = createElement('div', { className: 'form-check' });
    const actualInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: actualId,
      value: 'Actual Time',
      required: 'required'
    });
    const actualLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: actualId
    }, 'Actual Time');
    actualDiv.appendChild(actualInput);
    actualDiv.appendChild(actualLabel);

    group.appendChild(label);
    group.appendChild(small);
    group.appendChild(dvrDiv);
    group.appendChild(actualDiv);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create camera details field for recovery form
   */
  static createCameraDetailsField(index) {
    const fieldName = index === 0 ? 'cameraDetails' : `cameraDetails_${index}`;
    const fieldId = index === 0 ? 'cameraDetails' : `cameraDetails_${index}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    label.innerHTML = 'Camera Details <span class="required">*</span>';

    const textarea = createElement('textarea', {
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      rows: '4',
      placeholder: 'List camera locations/angles needed (e.g., Front entrance, Cash register, Parking lot west side)',
      required: 'required'
    });

    const small = createElement('small', { className: 'form-text' },
      'Please list specific cameras or areas to be extracted'
    );

    group.appendChild(label);
    group.appendChild(textarea);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }

  /**
   * Create DVR make/model field
   */
  static createDVRMakeModelField(dvrIndex) {
    const fieldName = dvrIndex === 0 ? 'dvrMakeModel' : `dvrMakeModel_${dvrIndex}`;
    const fieldId = dvrIndex === 0 ? 'dvrMakeModel' : `dvrMakeModel_${dvrIndex}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    }, 'DVR Make/Model');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: 'e.g., Hikvision DS-7216'
    });

    const small = createElement('small', { className: 'form-text' },
      'DVR system manufacturer and model number'
    );

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);

    return group;
  }

  /**
   * Create DVR time sync radio field (Is Time & Date correct?)
   */
  static createDVRTimeSyncField(dvrIndex, onChangeCallback) {
    const fieldName = dvrIndex === 0 ? 'isTimeDateCorrect' : `isTimeDateCorrect_${dvrIndex}`;
    const yesId = dvrIndex === 0 ? 'timeCorrectYes' : `timeCorrectYes_${dvrIndex}`;
    const noId = dvrIndex === 0 ? 'timeCorrectNo' : `timeCorrectNo_${dvrIndex}`;
    const offsetGroupId = dvrIndex === 0 ? 'timeOffsetGroup' : `timeOffsetGroup_${dvrIndex}`;
    const offsetFieldId = dvrIndex === 0 ? 'timeOffset' : `timeOffset_${dvrIndex}`;
    const offsetFieldName = dvrIndex === 0 ? 'timeOffset' : `timeOffset_${dvrIndex}`;

    const container = createElement('div');

    // Radio group
    const group = createElement('div', { className: 'form-group' });
    const label = createElement('label', { className: 'form-label' },
      'Is the Time & Date correct?'
    );
    const small = createElement('small', { className: 'form-text mb-2 d-block' },
      'Is the DVR time synchronized with actual time?'
    );

    const yesDiv = createElement('div', { className: 'form-check' });
    const yesInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: yesId,
      value: 'Yes',
      required: 'required'
    });
    const yesLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: yesId
    }, 'Yes');
    yesDiv.appendChild(yesInput);
    yesDiv.appendChild(yesLabel);

    const noDiv = createElement('div', { className: 'form-check' });
    const noInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: noId,
      value: 'No',
      required: 'required'
    });
    const noLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: noId
    }, 'No');
    noDiv.appendChild(noInput);
    noDiv.appendChild(noLabel);

    group.appendChild(label);
    group.appendChild(small);
    group.appendChild(yesDiv);
    group.appendChild(noDiv);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    // Time offset field (conditional)
    const offsetGroup = createElement('div', {
      className: 'form-group d-none',
      id: offsetGroupId
    });
    const offsetLabel = createElement('label', {
      htmlFor: offsetFieldId,
      className: 'form-label'
    }, 'Time Offset');
    const offsetInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: offsetFieldId,
      name: offsetFieldName,
      placeholder: 'e.g., DVR is 1hr 5min 30sec AHEAD of real time'
    });
    const offsetSmall = createElement('small', { className: 'form-text' },
      'Describe how the DVR time differs from actual time'
    );

    offsetGroup.appendChild(offsetLabel);
    offsetGroup.appendChild(offsetInput);
    offsetGroup.appendChild(offsetSmall);

    container.appendChild(group);
    container.appendChild(offsetGroup);

    return container;
  }

  /**
   * Create DVR retention field with calculation display
   */
  static createDVRRetentionField(dvrIndex, onChangeCallback) {
    const fieldName = dvrIndex === 0 ? 'dvrRetention' : `dvrRetention_${dvrIndex}`;
    const fieldId = dvrIndex === 0 ? 'dvrRetention' : `dvrRetention_${dvrIndex}`;
    const calcId = dvrIndex === 0 ? 'retentionCalculation' : `retentionCalculation_${dvrIndex}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    }, 'DVR Retention');

    const input = createElement('input', {
      type: 'date',
      className: 'form-control',
      id: fieldId,
      name: fieldName
    });

    const small = createElement('small', { className: 'form-text' },
      'The earliest date available on the DVR system'
    );

    const calcDiv = createElement('div', {
      id: calcId,
      className: 'text-info mt-2'
    });

    if (onChangeCallback) {
      input.addEventListener('change', onChangeCallback);
    }

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));
    group.appendChild(calcDiv);

    return group;
  }

  /**
   * Create DVR video monitor radio field
   */
  static createDVRVideoMonitorField(dvrIndex) {
    const fieldName = dvrIndex === 0 ? 'hasVideoMonitor' : `hasVideoMonitor_${dvrIndex}`;
    const yesId = dvrIndex === 0 ? 'monitorYes' : `monitorYes_${dvrIndex}`;
    const noId = dvrIndex === 0 ? 'monitorNo' : `monitorNo_${dvrIndex}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', { className: 'form-label' },
      'Has Video Monitor?'
    );
    const small = createElement('small', { className: 'form-text mb-2 d-block' },
      'Is there a monitor connected to view video?'
    );

    const yesDiv = createElement('div', { className: 'form-check' });
    const yesInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: yesId,
      value: 'Yes'
    });
    const yesLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: yesId
    }, 'Yes');
    yesDiv.appendChild(yesInput);
    yesDiv.appendChild(yesLabel);

    const noDiv = createElement('div', { className: 'form-check' });
    const noInput = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: fieldName,
      id: noId,
      value: 'No'
    });
    const noLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: noId
    }, 'No');
    noDiv.appendChild(noInput);
    noDiv.appendChild(noLabel);

    group.appendChild(label);
    group.appendChild(small);
    group.appendChild(yesDiv);
    group.appendChild(noDiv);

    return group;
  }

  /**
   * Create DVR username field
   */
  static createDVRUsernameField(dvrIndex) {
    const fieldName = dvrIndex === 0 ? 'dvrUsername' : `dvrUsername_${dvrIndex}`;
    const fieldId = dvrIndex === 0 ? 'dvrUsername' : `dvrUsername_${dvrIndex}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    }, 'Username');

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: 'DVR login username'
    });

    group.appendChild(label);
    group.appendChild(input);

    return group;
  }

  /**
   * Create DVR password field
   */
  static createDVRPasswordField(dvrIndex) {
    const fieldName = dvrIndex === 0 ? 'dvrPassword' : `dvrPassword_${dvrIndex}`;
    const fieldId = dvrIndex === 0 ? 'dvrPassword' : `dvrPassword_${dvrIndex}`;

    const group = createElement('div', { className: 'form-group' });

    const label = createElement('label', {
      for: fieldId,
      className: 'form-label'
    });
    label.innerHTML = 'Password <span class="required">*</span>';

    const input = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: fieldId,
      name: fieldName,
      placeholder: 'DVR login password',
      required: 'required'
    });

    const small = createElement('small', { className: 'form-text' },
      'DVR access password (plain text)'
    );

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(createElement('div', { className: 'invalid-feedback' }));

    return group;
  }
}
