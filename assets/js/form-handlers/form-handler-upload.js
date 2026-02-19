/**
 * Upload Form Handler
 * Specific handling for upload form with dynamic location-video groups
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { FormFieldBuilder } from './form-field-builder.js';
import { validateDateRange, validateLocations } from '../validators.js';
import { toggleElement, scrollToElement, createElement, debounce } from '../utils.js';
import { calculateRetentionDays } from '../calculations.js';
import { CONFIG } from '../config.js';

/**
 * Upload Form Handler
 * Handles dynamic location-video groups and media uploads
 */
export class UploadFormHandler extends FormHandler {
  constructor(formId) {
    // Call parent constructor - this triggers init() which calls buildFields()
    // Note: buildFields() initializes flatpickrInstances and locations
    super(formId);

    // Post-initialization setup (things that need buildFields() to have run)
    this.setupUploadSpecificListeners();
    this.initializeFlatpickrFields();

    // Cleanup Flatpickr instances when page unloads
    window.addEventListener('beforeunload', () => this.destroy());
  }

  /**
   * Build all form fields dynamically via FormFieldBuilder
   * Implements the Template Method hook from FormHandler base class
   *
   * Creates sections for evidence, investigator, location-video, and additional info.
   * Called by base class init() BEFORE field-dependent setup (autofill, keyboard fix, etc.)
   *
   * @override
   */
  buildFields() {
    // Initialize instance properties used by this handler
    // Must be done here because buildFields() is called by super() before
    // the subclass constructor body runs (JavaScript class semantics)
    this.locations = [];
    this.flatpickrInstances = {};

    this.buildEvidenceSection();
    this.buildInvestigatorSection();
    this.buildFirstLocationVideoGroup();
    this.buildAdditionalSection();

    // Attach validation listeners to all built fields
    this.attachValidationListeners(this.form);

    // NOTE: setupKeyboardProgressBarFix() and configureAutofill() are now
    // called by the base class init() AFTER this method returns
  }

  /**
   * Build evidence information section
   * Creates: occNumber, occDate, offenceType, evidenceBag, lockerNumber, mediaType, mediaTypeOther
   */
  buildEvidenceSection() {
    const container = document.getElementById('evidence-section-container');
    if (!container) {
      console.debug('[UploadForm] evidence-section-container not found - form may be using static HTML');
      return;
    }

    // Add section heading
    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Evidence Information');
    container.appendChild(heading);

    // Row 1: Occurrence Number + Date of Occurrence
    container.appendChild(FormFieldBuilder.createFormRow(
      FormFieldBuilder.createOccurrenceNumberField(),
      FormFieldBuilder.createDateField('occDate', 0, 'Date of Occurrence', true, { maxDate: 'today' })
    ));

    // Row 2: Type of Offence + Evidence Bag
    // NOTE: Upload form offenceType has NO "Other" option - just Homicide and Missing Person
    const uploadOffenceOptions = [
      { value: '', text: 'Select...' },
      { value: 'Homicide', text: 'Homicide' },
      { value: 'Missing Person', text: 'Missing Person' }
    ];
    container.appendChild(FormFieldBuilder.createFormRow(
      FormFieldBuilder.createSelectField('offenceType', 0, 'Type of Offence', uploadOffenceOptions, true),
      FormFieldBuilder.createTextField('evidenceBag', 0, 'Evidence Bag #', false, '', 'Evidence bag identification number')
    ));

    // Row 3: Locker Number + Media Type
    container.appendChild(FormFieldBuilder.createFormRow(
      FormFieldBuilder.createLockerNumberField(),
      FormFieldBuilder.createSelectField('mediaType', 0, 'Type of Media Submitted', CONFIG.MEDIA_TYPE_OPTIONS, true)
    ));

    // Conditional: Media Type Other
    container.appendChild(FormFieldBuilder.createOtherField('mediaTypeOther', 0, 'Media Type'));
  }

  /**
   * Build investigator section
   * Reuses the shared createInvestigatorSection() from FormFieldBuilder
   */
  buildInvestigatorSection() {
    const container = document.getElementById('investigator-section-container');
    if (!container) {
      console.debug('[UploadForm] investigator-section-container not found - form may be using static HTML');
      return;
    }

    // Reuse the Analysis form's investigator section - IT'S IDENTICAL!
    container.appendChild(FormFieldBuilder.createInvestigatorSection());
  }

  /**
   * Build first location-video group
   * Uses the shared createLocationVideoGroup() method for index 0
   */
  buildFirstLocationVideoGroup() {
    const container = document.getElementById('location-video-container');
    if (!container) {
      console.debug('[UploadForm] location-video-container not found - form may be using static HTML');
      return;
    }

    // Use the shared method for index 0
    const locationVideoGroup = this.createLocationVideoGroup(0);
    container.appendChild(locationVideoGroup);
  }

  /**
   * Build additional information section
   * Creates: otherInfo textarea
   */
  buildAdditionalSection() {
    const container = document.getElementById('additional-section-container');
    if (!container) {
      console.debug('[UploadForm] additional-section-container not found - form may be using static HTML');
      return;
    }

    // Add section heading
    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Additional Information');
    container.appendChild(heading);

    // Other info textarea
    container.appendChild(FormFieldBuilder.createTextareaField(
      'otherInfo', 0, 'Other Information', false,
      'Any additional information relevant to this submission', 4
    ));
  }

  /**
   * Create a location-video group (used for both initial and dynamic)
   * @param {number} index - Group index (0 for first)
   * @returns {HTMLElement} Location-video group element
   */
  createLocationVideoGroup(index) {
    const locationVideoGroup = createElement('div', {
      className: 'location-video-group',
      dataset: { groupIndex: index },
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 2px solid var(--color-primary);'
    });

    // Header
    const header = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem; text-align: center; font-size: 1.5rem;'
    }, `Location ${index + 1}`);
    locationVideoGroup.appendChild(header);

    // Location section
    const locationSection = createElement('section', { className: 'form-section' });
    locationSection.innerHTML = '<h3 style="color: var(--color-primary); margin-bottom: 1.5rem;">Location Information</h3>';

    locationSection.appendChild(FormFieldBuilder.createLocationField('businessName', index, 'Business Name', false));
    locationSection.appendChild(FormFieldBuilder.createLocationField('locationAddress', index, 'Location Address', true));
    locationSection.appendChild(FormFieldBuilder.createCityField(index));
    locationVideoGroup.appendChild(locationSection);

    // Video timeframe section
    const videoSection = createElement('section', { className: 'form-section' });
    videoSection.innerHTML = '<h3 style="color: var(--color-primary); margin-bottom: 1.5rem;">Video Timeframe</h3>';

    // Use Flatpickr-based datetime fields
    videoSection.appendChild(FormFieldBuilder.createFormRow(
      FormFieldBuilder.createDateTimeField('videoStartTime', index, 'Video Start Time', true, 'When the relevant video begins'),
      FormFieldBuilder.createDateTimeField('videoEndTime', index, 'Video End Time', true, 'When the relevant video ends')
    ));

    videoSection.appendChild(FormFieldBuilder.createTimeSyncField(index));
    videoSection.appendChild(FormFieldBuilder.createDvrDateField(index, (e) => this.handleRetentionChange(e, index)));
    locationVideoGroup.appendChild(videoSection);

    // Remove button (only for index > 0)
    if (index > 0) {
      const removeBtn = createElement('button', {
        type: 'button',
        className: 'btn btn-danger',
        style: 'margin-top: 1rem; width: 100%;',
        onclick: () => this.removeLocationVideo(locationVideoGroup)
      }, '× Remove This Location');
      locationVideoGroup.appendChild(removeBtn);
    }

    return locationVideoGroup;
  }

  /**
   * Handle DVR retention date change to show retention calculation
   * @param {Event} e - Change event
   * @param {number} index - Location group index
   */
  handleRetentionChange(e, index) {
    const retentionId = index === 0 ? 'retentionCalculation' : `retentionCalculation_${index}`;
    const retentionEl = document.getElementById(retentionId);
    if (e.target.value && retentionEl) {
      const retention = calculateRetentionDays(e.target.value);
      retentionEl.textContent = retention.message;
      retentionEl.className = 'text-info mt-2';
    } else if (retentionEl) {
      retentionEl.textContent = '';
    }
  }

  /**
   * Attach validation event listeners to all form-control elements
   * Ensures sliding green checkmark validation UI works on all dynamically built fields
   * @param {HTMLElement} container - Container with fields
   */
  attachValidationListeners(container) {
    const fields = container.querySelectorAll('.form-control');

    fields.forEach(field => {
      // Blur validation for all fields
      field.addEventListener('blur', () => this.validateSingleField(field));

      // Real-time validation for phone and email fields (debounced)
      if (field.type === 'tel' || field.name === CONFIG.FIELD_NAMES.OFFICER_EMAIL) {
        field.addEventListener('input', debounce(() => this.validateSingleField(field), 500));
      }

      // Locker number real-time validation
      if (field.name === 'lockerNumber') {
        field.addEventListener('input', debounce(() => this.validateSingleField(field), 500));
      }
    });
  }

  /**
   * Initialize Flatpickr on all date/datetime fields
   * Must be called AFTER buildFields() so DOM elements exist
   */
  initializeFlatpickrFields() {
    // Date of Occurrence field (required, past dates only)
    const occDateField = this.form.querySelector('#occDate');
    if (occDateField && typeof window !== 'undefined' && window.flatpickr) {
      this.flatpickrInstances.occDate = window.flatpickr(occDateField, {
        ...CONFIG.FLATPICKR_CONFIG.DATE,
        maxDate: 'today', // Prevent future dates
        onChange: (selectedDates, dateStr) => {
          // Small timeout to ensure Flatpickr has updated the hidden input before validation
          setTimeout(() => this.validateSingleField(occDateField), 10);
        }
      });
    }

    // Initialize Flatpickr for the first location group
    const firstLocationGroup = this.form.querySelector('.location-video-group');
    if (firstLocationGroup) {
      this.initializeFlatpickrInContainer(firstLocationGroup, 0);
    }
  }

  /**
   * Initialize Flatpickr on datetime fields within a container
   * @param {HTMLElement} container - Container with datetime fields
   * @param {number} index - Location group index
   */
  initializeFlatpickrInContainer(container, index) {
    if (typeof window === 'undefined' || !window.flatpickr) return;

    const startTimeId = index === 0 ? 'videoStartTime' : `videoStartTime_${index}`;
    const endTimeId = index === 0 ? 'videoEndTime' : `videoEndTime_${index}`;
    const dvrDateId = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;

    const startTimeField = container.querySelector(`#${startTimeId}`);
    const endTimeField = container.querySelector(`#${endTimeId}`);
    const dvrDateField = container.querySelector(`#${dvrDateId}`);

    if (startTimeField) {
      this.flatpickrInstances[startTimeId] = window.flatpickr(startTimeField, {
        ...CONFIG.FLATPICKR_CONFIG.DATETIME,
        onChange: (selectedDates, dateStr) => {
          // Small timeout to ensure Flatpickr has updated the hidden input before validation
          setTimeout(() => this.validateSingleField(startTimeField), 10);
        }
      });
    }

    if (endTimeField) {
      this.flatpickrInstances[endTimeId] = window.flatpickr(endTimeField, {
        ...CONFIG.FLATPICKR_CONFIG.DATETIME,
        onChange: (selectedDates, dateStr) => {
          // Small timeout to ensure Flatpickr has updated the hidden input before validation
          setTimeout(() => this.validateSingleField(endTimeField), 10);
        }
      });
    }

    // Earliest Recorded Date on DVR (date-only, past dates only)
    if (dvrDateField) {
      this.flatpickrInstances[dvrDateId] = window.flatpickr(dvrDateField, {
        ...CONFIG.FLATPICKR_CONFIG.DATE,
        maxDate: 'today',
        onChange: (selectedDates, dateStr) => {
          setTimeout(() => {
            this.handleRetentionChange({ target: dvrDateField }, index);
            this.validateSingleField(dvrDateField);
          }, 10);
        }
      });
    }
  }

  /**
   * Override populateForm to sync Flatpickr display with loaded draft values
   * Flatpickr maintains its own internal state separate from the input value,
   * so setting field.value directly doesn't update the visual display.
   * @param {Object} data - Form data to populate
   */
  populateForm(data) {
    // Let base class populate all standard fields
    super.populateForm(data);

    // Sync Flatpickr instances with their underlying input values
    // This ensures the visual picker display matches the loaded draft
    Object.keys(this.flatpickrInstances).forEach(key => {
      if (data[key] && this.flatpickrInstances[key]) {
        // setDate(date, triggerChange) - second param triggers onChange callback
        this.flatpickrInstances[key].setDate(data[key], true);
      }
    });
  }

  /**
   * Override clearFormAfterSubmission to also clear Flatpickr instances
   * The base class sets field.value = '' but Flatpickr maintains its own
   * internal state, so we must explicitly call clear() on each instance.
   */
  clearFormAfterSubmission() {
    // Let base class handle standard form clearing
    super.clearFormAfterSubmission();

    // Clear all Flatpickr instances to sync their display
    Object.values(this.flatpickrInstances).forEach(instance => {
      if (instance && typeof instance.clear === 'function') {
        instance.clear();
      }
    });
  }

  /**
   * Cleanup Flatpickr instances to prevent memory leaks
   * Should be called when the form is destroyed or page is unloaded
   */
  destroy() {
    Object.values(this.flatpickrInstances).forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.flatpickrInstances = {};
  }

  setupUploadSpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Media type "Other" field
    conditionalHandler.setupOtherField('mediaType', 'mediaTypeOtherGroup', 'mediaTypeOther');

    // Setup listeners for the first location-video group
    this.setupLocationVideoListeners(0);

    // Add location button
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
      addLocationBtn.addEventListener('click', () => this.addLocationVideo());
    }
  }

  setupLocationVideoListeners(index) {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // City "Other" field
    const cityId = index === 0 ? 'city' : `city_${index}`;
    const otherGroupId = index === 0 ? 'cityOtherGroup' : `cityOtherGroup_${index}`;
    const otherFieldId = index === 0 ? 'cityOther' : `cityOther_${index}`;
    conditionalHandler.setupOtherField(cityId, otherGroupId, otherFieldId);

    // Time sync radio buttons
    const timeCorrectName = index === 0 ? 'isTimeDateCorrect' : `isTimeDateCorrect_${index}`;
    const timeSyncRadios = this.form.querySelectorAll(`[name="${timeCorrectName}"]`);
    timeSyncRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const warningId = index === 0 ? 'timeSyncWarning' : `timeSyncWarning_${index}`;
        const offsetGroupId = index === 0 ? 'timeOffsetGroup' : `timeOffsetGroup_${index}`;
        const offsetFieldId = index === 0 ? 'timeOffset' : `timeOffset_${index}`;

        const warningEl = document.getElementById(warningId);
        const offsetGroup = document.getElementById(offsetGroupId);
        const offsetField = document.getElementById(offsetFieldId);

        if (e.target.value === 'Yes') {
          toggleElement(warningEl, true);
          toggleElement(offsetGroup, false);
          if (offsetField) {
            offsetField.removeAttribute('required');
            offsetField.value = '';
          }
        } else {
          toggleElement(warningEl, false);
          toggleElement(offsetGroup, true);
          if (offsetField) {
            offsetField.setAttribute('required', 'required');
          }
        }
      });
    });
  }

  addLocationVideo() {
    const container = document.getElementById('location-video-container');
    const index = container.children.length;

    // Use the shared method
    const locationVideoGroup = this.createLocationVideoGroup(index);
    locationVideoGroup.style.opacity = '0';

    container.appendChild(locationVideoGroup);

    // Apply autofill prevention to the newly created fields
    this.applyAutofillPrevention(locationVideoGroup.querySelectorAll('input, select, textarea'));

    // Attach validation listeners to new fields
    this.attachValidationListeners(locationVideoGroup);

    // Initialize Flatpickr on new datetime fields
    this.initializeFlatpickrInContainer(locationVideoGroup, index);

    // Setup conditional field listeners
    this.setupLocationVideoListeners(index);

    // Re-apply iOS keyboard fix for new fields
    this.setupKeyboardProgressBarFix();

    // Animate in
    requestAnimationFrame(() => {
      locationVideoGroup.style.transition = 'all 0.3s ease';
      locationVideoGroup.style.opacity = '1';
    });

    // Scroll to new section
    setTimeout(() => scrollToElement(locationVideoGroup), 300);

    // Update progress
    this.updateProgress();
  }

  removeLocationVideo(locationVideoGroup) {
    // Get the index of the group being removed to clean up Flatpickr instances
    const index = parseInt(locationVideoGroup.dataset.groupIndex, 10);

    // Destroy Flatpickr instances for this group
    const startTimeId = index === 0 ? 'videoStartTime' : `videoStartTime_${index}`;
    const endTimeId = index === 0 ? 'videoEndTime' : `videoEndTime_${index}`;
    const dvrDateId = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;

    if (this.flatpickrInstances[startTimeId]) {
      this.flatpickrInstances[startTimeId].destroy();
      delete this.flatpickrInstances[startTimeId];
    }
    if (this.flatpickrInstances[endTimeId]) {
      this.flatpickrInstances[endTimeId].destroy();
      delete this.flatpickrInstances[endTimeId];
    }
    if (this.flatpickrInstances[dvrDateId]) {
      this.flatpickrInstances[dvrDateId].destroy();
      delete this.flatpickrInstances[dvrDateId];
    }

    // Animate out
    locationVideoGroup.style.transition = 'all 0.3s ease';
    locationVideoGroup.style.opacity = '0';
    locationVideoGroup.style.transform = 'scale(0.95)';

    setTimeout(() => {
      locationVideoGroup.remove();
      this.updateProgress();
    }, 300);
  }

  /**
   * Generate fileDetails string for Upload form
   * Maps all form data into a readable format following PDF section order
   * @param {Object} data - Form data collected from collectFormData()
   * @returns {string} Formatted fileDetails string
   */
  generateFileDetails(data) {
    const sections = [];

    // Form Title Header
    const title = 'VIDEO EVIDENCE UPLOAD REQUEST';
    const boxWidth = 40; // Fixed width for header
    const horizontalLine = '='.repeat(boxWidth);
    const padding = ' '.repeat(Math.floor((boxWidth - title.length) / 2));

    sections.push(horizontalLine);
    sections.push(`${padding}${title}`);
    sections.push(horizontalLine);

    // === EVIDENCE ===
    const evidenceLines = [];
    if (data.occNumber) evidenceLines.push(`Occurrence: ${data.occNumber}`);
    if (data.evidenceBag) evidenceLines.push(`Evidence Bag: ${data.evidenceBag}`);
    if (data.mediaTypeDisplay) evidenceLines.push(`Media Type: ${data.mediaTypeDisplay}`);

    if (evidenceLines.length > 0) {
      sections.push('=== EVIDENCE ===\n' + evidenceLines.join('\n'));
    }

    // === INVESTIGATOR ===
    const investigatorLines = [];
    if (data.rName && data.badge) {
      investigatorLines.push(`Name: ${data.rName} (Badge: ${data.badge})`);
    } else if (data.rName) {
      investigatorLines.push(`Name: ${data.rName}`);
    }
    if (data.requestingPhone) investigatorLines.push(`Phone: ${data.requestingPhone}`);
    if (data.requestingEmail) investigatorLines.push(`Email: ${data.requestingEmail}`);

    if (investigatorLines.length > 0) {
      sections.push('=== INVESTIGATOR ===\n' + investigatorLines.join('\n'));
    }

    // === LOCATION X === (for each location)
    if (data.locations && data.locations.length > 0) {
      data.locations.forEach((location, index) => {
        const locationLines = [];
        const locationNum = index + 1;

        if (location.businessName) {
          locationLines.push(`Business: ${location.businessName}`);
        }

        if (location.locationAddress) {
          const city = location.city === 'Other' && location.cityOther ? location.cityOther : location.city;
          const address = city ? `${location.locationAddress}, ${city}` : location.locationAddress;
          locationLines.push(`Address: ${address}`);
        }

        // Format video period and calculate duration
        if (location.videoStartTime && location.videoEndTime) {
          const startFormatted = this.formatDateTime(location.videoStartTime);
          const endFormatted = this.formatDateTime(location.videoEndTime);
          locationLines.push(`Video Period: ${startFormatted} to ${endFormatted}`);

          // Calculate duration
          const duration = this.calculateDuration(location.videoStartTime, location.videoEndTime);
          if (duration) {
            locationLines.push(`Duration: ${duration}`);
          }
        }

        // Time sync
        if (location.isTimeDateCorrect) {
          locationLines.push(`Time Sync: ${location.isTimeDateCorrect}`);

          // Only show offset if time is NOT correct
          if (location.isTimeDateCorrect === 'No' && location.timeOffset) {
            locationLines.push(`Time Offset: ${location.timeOffset}`);
          }
        }

        // DVR retention with urgency warning
        if (location.dvrEarliestDate) {
          const retention = calculateRetentionDays(location.dvrEarliestDate);
          let retentionText = `DVR Retention: ${retention.days} days`;
          if (retention.days <= 4) {
            retentionText += ' - URGENT';
          }
          locationLines.push(retentionText);
        }

        if (locationLines.length > 0) {
          sections.push(`=== LOCATION ${locationNum} ===\n` + locationLines.join('\n'));
        }
      });
    }

    // === ADDITIONAL ===
    if (data.otherInfo && data.otherInfo.trim()) {
      sections.push('=== ADDITIONAL ===\n' + data.otherInfo.trim());
    }

    return sections.join('\n\n');
  }

  /**
   * Format datetime-local value to readable format
   * @param {string} datetimeLocal - datetime-local value (e.g., "2025-12-03T14:30")
   * @returns {string} Formatted date (e.g., "Dec 3, 2025 14:30")
   */
  formatDateTime(datetimeLocal) {
    if (!datetimeLocal) return '';

    const date = new Date(datetimeLocal);
    if (isNaN(date.getTime())) return datetimeLocal;

    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };

    return date.toLocaleString('en-US', options).replace(',', '');
  }

  /**
   * Calculate duration between two datetime values
   * @param {string} startTime - Start datetime-local value
   * @param {string} endTime - End datetime-local value
   * @returns {string} Duration string (e.g., "1 hour 15 minutes" or "30 minutes")
   */
  calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return '';

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

    const diffMs = end - start;
    if (diffMs < 0) return '';

    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }

  collectFormData() {
    const data = super.collectFormData();

    // Collect multiple location-video groups
    const locationVideoGroups = this.form.querySelectorAll('.location-video-group');
    data.locations = [];

    locationVideoGroups.forEach((group, index) => {
      const location = {
        businessName: group.querySelector(`[name^="businessName"]`)?.value || '',
        locationAddress: group.querySelector(`[name^="locationAddress"]`)?.value || '',
        city: group.querySelector(`[name^="city"]`)?.value || ''
      };

      if (location.city === 'Other') {
        location.cityOther = group.querySelector(`[name^="cityOther"]`)?.value || '';
      }

      // Add video timeframe data
      location.videoStartTime = group.querySelector(`[name^="videoStartTime"]`)?.value || '';
      location.videoEndTime = group.querySelector(`[name^="videoEndTime"]`)?.value || '';
      location.isTimeDateCorrect = group.querySelector(`[name^="isTimeDateCorrect"]:checked`)?.value || '';

      if (location.isTimeDateCorrect === 'No') {
        location.timeOffset = group.querySelector(`[name^="timeOffset"]`)?.value || '';
      }

      location.dvrEarliestDate = group.querySelector(`[name^="dvrEarliestDate"]`)?.value || '';

      data.locations.push(location);
    });

    // Handle media type "Other"
    if (data.mediaType === 'Other' && data.mediaTypeOther) {
      data.mediaTypeDisplay = data.mediaTypeOther;
    } else {
      data.mediaTypeDisplay = data.mediaType;
    }

    // Generate fileDetails using the new method
    data.fileDetails = this.generateFileDetails(data);

    // Add fileNr mapping for PHP system
    data.fileNr = data.occNumber || '';

    // Set request area to city value for PHP system
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = data.city || '';

    return data;
  }

  validateForm() {
    const result = super.validateForm();

    // Validate all location-video groups
    const locationVideoGroups = this.form.querySelectorAll('.location-video-group');
    const locations = [];

    locationVideoGroups.forEach((group, index) => {
      // Validate date range for each group
      const startTimeField = group.querySelector('[name^="videoStartTime"]');
      const endTimeField = group.querySelector('[name^="videoEndTime"]');

      if (startTimeField && endTimeField) {
        const dateError = validateDateRange(startTimeField.value, endTimeField.value);
        if (dateError) {
          result.errors[`videoEndTime_${index}`] = dateError;
          result.isValid = false;
          this.showFieldValidation(endTimeField, dateError);
        }
      }

      // Collect location data for validation
      locations.push({
        locationAddress: group.querySelector('[name^="locationAddress"]')?.value || '',
        city: group.querySelector('[name^="city"]')?.value || '',
        cityOther: group.querySelector('[name^="cityOther"]')?.value || ''
      });
    });

    // Validate locations
    const locationErrors = validateLocations(locations);
    if (Object.keys(locationErrors).length > 0) {
      result.isValid = false;

      // Show location errors
      Object.entries(locationErrors).forEach(([index, errors]) => {
        const group = locationVideoGroups[index];
        if (group) {
          Object.entries(errors).forEach(([fieldName, error]) => {
            const field = group.querySelector(`[name^="${fieldName}"]`);
            if (field) {
              this.showFieldValidation(field, error);
            }
          });
        }
      });
    }

    return result;
  }

  /**
   * Get the PDF filename for upload form
   * @param {Object} formData - The collected form data
   * @returns {string} The PDF filename
   */
  getPdfFilename(formData) {
    return `FVU_Upload_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
  }
}

export default UploadFormHandler;
