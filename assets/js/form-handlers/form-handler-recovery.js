/**
 * Recovery Form Handler
 * Specific handling for recovery form with DVR system details
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { FormFieldBuilder } from './form-field-builder.js';
import { validateDateRange, formatPhone } from '../validators.js';
import { debounce, toggleElement, scrollToElement, createElement } from '../utils.js';
import { calculateRetentionDays } from '../calculations.js';
import { CONFIG } from '../config.js';

/**
 * Recovery Form Handler
 * Handles video recovery requests from DVR systems
 */
export class RecoveryFormHandler extends FormHandler {
  constructor(formId) {
    // Call parent constructor - this triggers init() which calls buildFields()
    // Note: buildFields() initializes flatpickrInstances
    super(formId);

    // Post-initialization setup (things that need buildFields() to have run)
    this.setupRecoverySpecificListeners();
    this.initializeFlatpickrFields();

    // Cleanup Flatpickr instances when page unloads
    window.addEventListener('beforeunload', () => this.destroy());
  }

  // ===========================================================================
  // FIELD BUILDING (Template Method Pattern)
  // ===========================================================================

  /**
   * Build all form fields dynamically via FormFieldBuilder
   * Implements the Template Method hook from FormHandler base class
   *
   * Creates sections for case, investigator, location, first DVR, and incident.
   * Called by base class init() BEFORE field-dependent setup (autofill, keyboard fix, etc.)
   *
   * @override
   */
  buildFields() {
    // Initialize instance properties used by this handler
    // Must be done here because buildFields() is called by super() before
    // the subclass constructor body runs (JavaScript class semantics)
    this.flatpickrInstances = {};

    this.buildCaseSection();
    this.buildInvestigatorSection();
    this.buildLocationSection();
    this.buildInitialDVRGroup();
    this.buildIncidentSection();

    // Attach validation listeners to all built fields
    this.attachValidationListeners(this.form);

    // NOTE: setupKeyboardProgressBarFix() and configureAutofill() are now
    // called by the base class init() AFTER this method returns
  }

  /**
   * Build case information section
   */
  buildCaseSection() {
    const container = document.getElementById('case-section-container');
    if (!container) {
      console.debug('[RecoveryForm] case-section-container not found');
      return;
    }

    container.appendChild(FormFieldBuilder.createRecoveryCaseSection());
  }

  /**
   * Build investigator section
   */
  buildInvestigatorSection() {
    const container = document.getElementById('investigator-section-container');
    if (!container) {
      console.debug('[RecoveryForm] investigator-section-container not found');
      return;
    }

    container.appendChild(FormFieldBuilder.createRecoveryInvestigatorSection());
  }

  /**
   * Build location section
   */
  buildLocationSection() {
    const container = document.getElementById('location-section-container');
    if (!container) {
      console.debug('[RecoveryForm] location-section-container not found');
      return;
    }

    container.appendChild(FormFieldBuilder.createRecoveryLocationSection());
  }

  /**
   * Build initial DVR group (index 0)
   * Uses the shared createDVRGroup method
   */
  buildInitialDVRGroup() {
    const container = document.getElementById('dvr-container');
    if (!container) {
      console.debug('[RecoveryForm] dvr-container not found');
      return;
    }

    // Create the first DVR group
    const dvrGroup = this.createDVRGroup(0);
    container.appendChild(dvrGroup);
  }

  /**
   * Build incident description section
   */
  buildIncidentSection() {
    const container = document.getElementById('incident-section-container');
    if (!container) {
      console.debug('[RecoveryForm] incident-section-container not found');
      return;
    }

    container.appendChild(FormFieldBuilder.createIncidentDescriptionSection());
  }

  // ===========================================================================
  // DVR AND TIMEFRAME CREATION
  // ===========================================================================

  /**
   * Create a DVR group with all fields
   * @param {number} dvrIndex - DVR index (0 for first)
   * @returns {HTMLElement} DVR group element
   */
  createDVRGroup(dvrIndex) {
    const isFirst = dvrIndex === 0;

    const dvrGroup = createElement('div', {
      className: 'dvr-group',
      dataset: { dvrIndex: dvrIndex.toString() },
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 2px solid var(--color-primary);'
    });

    // DVR Header
    const header = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem; text-align: center; font-size: 1.5rem;'
    }, `DVR ${dvrIndex + 1}`);
    dvrGroup.appendChild(header);

    // DVR Information Section
    const dvrInfoSection = createElement('section', { className: 'form-section' });
    const dvrInfoHeading = createElement('h3', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'DVR Information');
    dvrInfoSection.appendChild(dvrInfoHeading);

    // Add DVR fields
    dvrInfoSection.appendChild(FormFieldBuilder.createDVRMakeModelField(dvrIndex));
    dvrInfoSection.appendChild(FormFieldBuilder.createDVRTimeSyncField(dvrIndex));
    dvrInfoSection.appendChild(FormFieldBuilder.createDVRRetentionField(dvrIndex, (e) => this.handleRetentionChange(e, dvrIndex)));
    dvrInfoSection.appendChild(FormFieldBuilder.createDVRVideoMonitorField(dvrIndex));
    dvrGroup.appendChild(dvrInfoSection);

    // Extraction Timeframe Container for this DVR
    const extractionContainer = createElement('div', {
      className: 'extraction-timeframe-container',
      dataset: { dvrIndex: dvrIndex.toString() }
    });

    // First timeframe group (always present)
    const timeframeGroup = this.createTimeframeGroup(0, dvrIndex);
    extractionContainer.appendChild(timeframeGroup);
    dvrGroup.appendChild(extractionContainer);

    // Add Time Frame Button
    const addTimeFrameBtn = createElement('div', {
      style: 'text-align: center; margin: 1.5rem 0;'
    });
    const btn = createElement('button', {
      type: 'button',
      className: 'btn btn-secondary add-timeframe-btn',
      dataset: { dvrIndex: dvrIndex.toString() },
      style: 'min-width: 200px;'
    }, '+ Add Additional Time Frame');
    const btnSmall = createElement('small', {
      className: 'form-text d-block mt-2'
    }, 'Add if you need to extract video from multiple time periods for this DVR');
    addTimeFrameBtn.appendChild(btn);
    addTimeFrameBtn.appendChild(btnSmall);
    dvrGroup.appendChild(addTimeFrameBtn);

    // Access Information Section
    const accessSection = createElement('section', { className: 'form-section' });
    const accessHeading = createElement('h3', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, 'Access Information');
    accessSection.appendChild(accessHeading);

    const accessRow = createElement('div', { className: 'form-row' });
    accessRow.appendChild(FormFieldBuilder.createDVRUsernameField(dvrIndex));
    accessRow.appendChild(FormFieldBuilder.createDVRPasswordField(dvrIndex));
    accessSection.appendChild(accessRow);
    dvrGroup.appendChild(accessSection);

    // Remove button (only for additional DVRs, not the first)
    if (!isFirst) {
      const removeBtn = createElement('button', {
        type: 'button',
        className: 'btn btn-danger',
        style: 'margin-top: 1rem; width: 100%;'
      }, `× Remove DVR ${dvrIndex + 1}`);
      removeBtn.addEventListener('click', () => this.removeDVRGroup(dvrGroup, dvrIndex));
      dvrGroup.appendChild(removeBtn);
    }

    return dvrGroup;
  }

  /**
   * Create a timeframe group with Flatpickr datetime fields
   * @param {number} timeframeIndex - Timeframe index within DVR (0 for first)
   * @param {number} dvrIndex - DVR index (0 for first)
   * @returns {HTMLElement} Timeframe group element
   */
  createTimeframeGroup(timeframeIndex, dvrIndex) {
    const timeFrameGroup = createElement('div', {
      className: 'extraction-timeframe-group',
      dataset: { groupIndex: timeframeIndex.toString(), dvrIndex: dvrIndex.toString() },
      style: 'background: rgba(255,255,255,0.05); border-radius: var(--border-radius); padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid var(--border-color);'
    });

    const section = createElement('section', { className: 'form-section' });
    const heading = createElement('h4', {
      style: 'color: var(--color-secondary); margin-bottom: 1.5rem;'
    }, timeframeIndex === 0 ? 'Video Extraction Details' : `Video Extraction Details - Time Frame ${timeframeIndex + 1}`);
    section.appendChild(heading);

    // Build field IDs using complex naming convention
    const startTimeId = this.getTimeframeFieldId('extractionStartTime', dvrIndex, timeframeIndex);
    const endTimeId = this.getTimeframeFieldId('extractionEndTime', dvrIndex, timeframeIndex);
    const timePeriodName = this.getTimeframeFieldId('timePeriodType', dvrIndex, timeframeIndex);
    const cameraName = this.getTimeframeFieldId('cameraDetails', dvrIndex, timeframeIndex);

    // Build radio button IDs
    const dvrRadioId = this.getTimeframeFieldId('timeDVR', dvrIndex, timeframeIndex);
    const actualRadioId = this.getTimeframeFieldId('timeActual', dvrIndex, timeframeIndex);

    // Time Period Row (Start + End with Flatpickr)
    const formRow = createElement('div', { className: 'form-row' });

    // Start Time
    const startTimeGroup = createElement('div', { className: 'form-group' });
    const startLabel = createElement('label', {
      htmlFor: startTimeId,
      className: 'form-label'
    });
    startLabel.innerHTML = 'Time Period From <span class="required">*</span>';
    const startInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: startTimeId,
      name: startTimeId,
      required: 'required'
    });
    const startSmall = createElement('small', { className: 'form-text' }, 'Start of video period to extract');
    startTimeGroup.appendChild(startLabel);
    startTimeGroup.appendChild(startInput);
    startTimeGroup.appendChild(startSmall);
    startTimeGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));
    formRow.appendChild(startTimeGroup);

    // End Time
    const endTimeGroup = createElement('div', { className: 'form-group' });
    const endLabel = createElement('label', {
      htmlFor: endTimeId,
      className: 'form-label'
    });
    endLabel.innerHTML = 'Time Period To <span class="required">*</span>';
    const endInput = createElement('input', {
      type: 'text',
      className: 'form-control',
      id: endTimeId,
      name: endTimeId,
      required: 'required'
    });
    const endSmall = createElement('small', { className: 'form-text' }, 'End of video period to extract');
    endTimeGroup.appendChild(endLabel);
    endTimeGroup.appendChild(endInput);
    endTimeGroup.appendChild(endSmall);
    endTimeGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));
    formRow.appendChild(endTimeGroup);

    section.appendChild(formRow);

    // Time Period Type Radio Buttons
    const timePeriodGroup = createElement('div', { className: 'form-group' });
    const timePeriodLabel = createElement('label', { className: 'form-label' });
    timePeriodLabel.innerHTML = 'Time Period Type <span class="required">*</span>';
    const timePeriodSmall = createElement('small', { className: 'form-text mb-2 d-block' },
      'Are the times above in DVR time or actual time?');

    const dvrCheckDiv = createElement('div', { className: 'form-check' });
    const dvrRadio = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: timePeriodName,
      id: dvrRadioId,
      value: 'DVR Time',
      required: 'required'
    });
    const dvrRadioLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: dvrRadioId
    }, 'DVR Time');
    dvrCheckDiv.appendChild(dvrRadio);
    dvrCheckDiv.appendChild(dvrRadioLabel);

    const actualCheckDiv = createElement('div', { className: 'form-check' });
    const actualRadio = createElement('input', {
      className: 'form-check-input',
      type: 'radio',
      name: timePeriodName,
      id: actualRadioId,
      value: 'Actual Time',
      required: 'required'
    });
    const actualRadioLabel = createElement('label', {
      className: 'form-check-label',
      htmlFor: actualRadioId
    }, 'Actual Time');
    actualCheckDiv.appendChild(actualRadio);
    actualCheckDiv.appendChild(actualRadioLabel);

    timePeriodGroup.appendChild(timePeriodLabel);
    timePeriodGroup.appendChild(timePeriodSmall);
    timePeriodGroup.appendChild(dvrCheckDiv);
    timePeriodGroup.appendChild(actualCheckDiv);
    timePeriodGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));
    section.appendChild(timePeriodGroup);

    // Camera Details Textarea
    const cameraGroup = createElement('div', { className: 'form-group' });
    const cameraLabel = createElement('label', {
      htmlFor: cameraName,
      className: 'form-label'
    });
    cameraLabel.innerHTML = 'Camera Details <span class="required">*</span>';
    const cameraTextarea = createElement('textarea', {
      className: 'form-control',
      id: cameraName,
      name: cameraName,
      rows: '4',
      placeholder: 'List camera locations/angles needed (e.g., Front entrance, Cash register, Parking lot west side)',
      required: 'required'
    });
    const cameraSmall = createElement('small', { className: 'form-text' },
      'Please list specific cameras or areas to be extracted');
    cameraGroup.appendChild(cameraLabel);
    cameraGroup.appendChild(cameraTextarea);
    cameraGroup.appendChild(cameraSmall);
    cameraGroup.appendChild(createElement('div', { className: 'invalid-feedback' }));
    section.appendChild(cameraGroup);

    timeFrameGroup.appendChild(section);

    // Remove button (only for index > 0)
    if (timeframeIndex > 0) {
      const removeBtn = createElement('button', {
        type: 'button',
        className: 'btn btn-danger',
        style: 'margin-top: 1rem; width: 100%;'
      }, `× Remove Time Frame ${timeframeIndex + 1}`);
      removeBtn.addEventListener('click', () => this.removeTimeFrame(timeFrameGroup, dvrIndex));
      timeFrameGroup.appendChild(removeBtn);
    }

    return timeFrameGroup;
  }

  /**
   * Get field ID/name for timeframe fields using complex naming convention
   *
   * Naming Pattern:
   * - DVR 0, TF 0: baseName (e.g., extractionStartTime)
   * - DVR 0, TF N: baseName_N (e.g., extractionStartTime_1)
   * - DVR N, TF 0: baseName_dvrN (e.g., extractionStartTime_dvr1)
   * - DVR N, TF M: baseName_dvrN_M (e.g., extractionStartTime_dvr1_1)
   *
   * @param {string} baseName - Base field name
   * @param {number} dvrIndex - DVR index (0-based)
   * @param {number} timeframeIndex - Timeframe index within DVR (0-based)
   * @returns {string} Full field ID/name
   */
  getTimeframeFieldId(baseName, dvrIndex, timeframeIndex) {
    if (dvrIndex === 0) {
      return timeframeIndex === 0 ? baseName : `${baseName}_${timeframeIndex}`;
    }
    return timeframeIndex === 0
      ? `${baseName}_dvr${dvrIndex}`
      : `${baseName}_dvr${dvrIndex}_${timeframeIndex}`;
  }

  // ===========================================================================
  // FLATPICKR LIFECYCLE
  // ===========================================================================

  /**
   * Initialize Flatpickr on all date/datetime fields
   * Must be called AFTER buildFields() so DOM elements exist
   */
  initializeFlatpickrFields() {
    // Initialize Flatpickr for the first DVR group
    const firstDvrGroup = this.form.querySelector('.dvr-group');
    if (firstDvrGroup) {
      this.initializeFlatpickrInContainer(firstDvrGroup, 0);
    }
  }

  /**
   * Initialize Flatpickr on datetime fields within a container
   * @param {HTMLElement} container - Container with datetime fields
   * @param {number} dvrIndex - DVR index for this container
   */
  initializeFlatpickrInContainer(container, dvrIndex) {
    if (typeof window === 'undefined' || !window.flatpickr) return;

    // Find all timeframe groups in this container
    const timeframeGroups = container.querySelectorAll('.extraction-timeframe-group');

    timeframeGroups.forEach((group) => {
      const timeframeIndex = parseInt(group.dataset.groupIndex, 10);

      const startTimeId = this.getTimeframeFieldId('extractionStartTime', dvrIndex, timeframeIndex);
      const endTimeId = this.getTimeframeFieldId('extractionEndTime', dvrIndex, timeframeIndex);

      const startTimeField = group.querySelector(`#${startTimeId}`);
      const endTimeField = group.querySelector(`#${endTimeId}`);

      if (startTimeField && !this.flatpickrInstances[startTimeId]) {
        this.flatpickrInstances[startTimeId] = window.flatpickr(startTimeField, {
          ...CONFIG.FLATPICKR_CONFIG.DATETIME,
          onChange: (selectedDates, dateStr) => {
            // Small timeout to ensure Flatpickr has updated the hidden input before validation
            setTimeout(() => {
              this.validateSingleField(startTimeField);
              // Revalidate end time if it has a value
              if (endTimeField && endTimeField.value) {
                this.validateTimeRange(endTimeField);
              }
            }, 10);
          }
        });
      }

      if (endTimeField && !this.flatpickrInstances[endTimeId]) {
        this.flatpickrInstances[endTimeId] = window.flatpickr(endTimeField, {
          ...CONFIG.FLATPICKR_CONFIG.DATETIME,
          onChange: (selectedDates, dateStr) => {
            // Small timeout to ensure Flatpickr has updated the hidden input before validation
            setTimeout(() => {
              this.validateSingleField(endTimeField);
              this.validateTimeRange(endTimeField);
            }, 10);
          }
        });
      }
    });

    // Also initialize DVR retention date field if present
    const retentionId = dvrIndex === 0 ? 'dvrRetention' : `dvrRetention_${dvrIndex}`;
    const retentionField = container.querySelector(`#${retentionId}`);
    if (retentionField && !this.flatpickrInstances[retentionId]) {
      this.flatpickrInstances[retentionId] = window.flatpickr(retentionField, {
        ...CONFIG.FLATPICKR_CONFIG.DATE,
        maxDate: 'today',
        onChange: (selectedDates, dateStr) => {
          // Small timeout to ensure Flatpickr has updated the hidden input before validation
          setTimeout(() => {
            this.handleRetentionChange({ target: retentionField }, dvrIndex);
            this.validateSingleField(retentionField);
          }, 10);
        }
      });
    }
  }

  /**
   * Handle DVR retention date change
   * @param {Event} e - Change event
   * @param {number} dvrIndex - DVR index
   */
  handleRetentionChange(e, dvrIndex) {
    const retentionCalcId = dvrIndex === 0 ? 'retentionCalculation' : `retentionCalculation_${dvrIndex}`;
    const retentionEl = document.getElementById(retentionCalcId);
    const field = e.target;

    if (field.value && retentionEl) {
      const retention = calculateRetentionDays(field.value);

      if (retention.days < 0) {
        this.showFieldValidation(field, 'DVR retention date cannot be in the future');
        retentionEl.textContent = '';
        retentionEl.className = 'text-info mt-2';
      } else {
        this.showFieldValidation(field, null);
        retentionEl.textContent = retention.message;

        if (retention.days <= 4) {
          retentionEl.className = 'text-danger mt-2';
          retentionEl.style.fontWeight = 'bold';
        } else {
          retentionEl.className = 'text-info mt-2';
          retentionEl.style.fontWeight = 'normal';
        }
      }
    } else if (retentionEl) {
      retentionEl.textContent = '';
      retentionEl.className = 'text-info mt-2';
      this.showFieldValidation(field, null);
    }
  }

  /**
   * Validate time range (end > start)
   * @param {HTMLElement} endField - The end time field
   */
  validateTimeRange(endField) {
    const endFieldName = endField.name;
    const startFieldName = endFieldName.replace('EndTime', 'StartTime');
    const startField = this.form.querySelector(`[name="${startFieldName}"]`);

    if (startField && startField.value && endField.value) {
      const dateError = validateDateRange(startField.value, endField.value);
      if (dateError) {
        this.showFieldValidation(endField, dateError);
      } else {
        this.showFieldValidation(endField, null);
      }
    }
  }

  /**
   * Override populateForm to sync Flatpickr display with loaded draft values
   * @param {Object} data - Form data to populate
   */
  populateForm(data) {
    // Let base class populate all standard fields
    super.populateForm(data);

    // Sync Flatpickr instances with their underlying input values
    Object.keys(this.flatpickrInstances).forEach(key => {
      if (data[key] && this.flatpickrInstances[key]) {
        this.flatpickrInstances[key].setDate(data[key], true);
      }
    });
  }

  /**
   * Override clearFormAfterSubmission to also clear Flatpickr instances
   */
  clearFormAfterSubmission() {
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
   */
  destroy() {
    Object.values(this.flatpickrInstances).forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.flatpickrInstances = {};
  }

  // ===========================================================================
  // VALIDATION LISTENERS
  // ===========================================================================

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

      // Location contact phone real-time validation
      if (field.name === 'locationContactPhone') {
        field.addEventListener('input', debounce(() => this.validateSingleField(field), 500));
      }
    });
  }

  // ===========================================================================
  // RECOVERY-SPECIFIC LISTENERS (EXISTING)
  // ===========================================================================

  setupRecoverySpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Setup "Other" fields
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');

    // Setup listeners for the first DVR (index 0)
    this.setupDVRListeners(0);

    // Add DVR button
    const addDVRBtn = document.getElementById('addDVRBtn');
    if (addDVRBtn) {
      addDVRBtn.addEventListener('click', () => this.addDVRGroup());
    }

    // Phone number formatting for location contact
    const locationPhoneField = this.form.querySelector('#locationContactPhone');
    if (locationPhoneField) {
      locationPhoneField.addEventListener('input', debounce(() => this.validateSingleField(locationPhoneField), 500));
    }
  }

  setupDVRListeners(dvrIndex) {
    // Time & Date correct - special handling (no warning, optional offset)
    const timeSyncName = dvrIndex === 0 ? 'isTimeDateCorrect' : `isTimeDateCorrect_${dvrIndex}`;
    const timeSyncRadios = this.form.querySelectorAll(`[name="${timeSyncName}"]`);
    timeSyncRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const offsetGroupId = dvrIndex === 0 ? 'timeOffsetGroup' : `timeOffsetGroup_${dvrIndex}`;
        const offsetFieldId = dvrIndex === 0 ? 'timeOffset' : `timeOffset_${dvrIndex}`;
        const offsetGroup = document.getElementById(offsetGroupId);
        const offsetField = document.getElementById(offsetFieldId);

        if (e.target.value === 'No') {
          toggleElement(offsetGroup, true);
          // Note: NOT setting required attribute - different from upload form
        } else {
          toggleElement(offsetGroup, false);
          offsetField.value = '';
          this.showFieldValidation(offsetField, null);
        }
      });
    });

    // Setup listeners for the first time frame of this DVR
    this.setupTimeFrameListeners(0, dvrIndex);

    // Add time frame button for this DVR
    const addTimeFrameBtns = this.form.querySelectorAll('.add-timeframe-btn');
    addTimeFrameBtns.forEach(btn => {
      if (parseInt(btn.dataset.dvrIndex) === dvrIndex) {
        btn.addEventListener('click', () => this.addTimeFrame(dvrIndex));
      }
    });

    // DVR retention calculation and future date validation
    const dvrRetentionId = dvrIndex === 0 ? 'dvrRetention' : `dvrRetention_${dvrIndex}`;
    const dvrRetentionField = this.form.querySelector(`#${dvrRetentionId}`);
    if (dvrRetentionField) {
      dvrRetentionField.addEventListener('change', (e) => {
        const retentionCalcId = dvrIndex === 0 ? 'retentionCalculation' : `retentionCalculation_${dvrIndex}`;
        const retentionEl = document.getElementById(retentionCalcId);
        if (e.target.value) {
          const retention = calculateRetentionDays(e.target.value);

          // Check for future date
          if (retention.days < 0) {
            this.showFieldValidation(dvrRetentionField, 'DVR retention date cannot be in the future');
            retentionEl.textContent = '';
            retentionEl.className = 'text-info mt-2';
          } else {
            // Clear any validation error
            this.showFieldValidation(dvrRetentionField, null);

            // Display calculation with urgency styling if needed
            retentionEl.textContent = retention.message;

            // Apply urgent styling if 4 days or less
            if (retention.days <= 4) {
              retentionEl.className = 'text-danger mt-2';
              retentionEl.style.fontWeight = 'bold';
            } else {
              retentionEl.className = 'text-info mt-2';
              retentionEl.style.fontWeight = 'normal';
            }
          }
        } else {
          retentionEl.textContent = '';
          retentionEl.className = 'text-info mt-2';
          this.showFieldValidation(dvrRetentionField, null);
        }
      });
    }
  }

  setupTimeFrameListeners(index, dvrIndex = 0) {
    // Build field IDs based on both timeframe index and DVR index
    let startTimeId, endTimeId;
    if (dvrIndex === 0) {
      startTimeId = index === 0 ? 'extractionStartTime' : `extractionStartTime_${index}`;
      endTimeId = index === 0 ? 'extractionEndTime' : `extractionEndTime_${index}`;
    } else {
      startTimeId = index === 0 ? `extractionStartTime_dvr${dvrIndex}` : `extractionStartTime_dvr${dvrIndex}_${index}`;
      endTimeId = index === 0 ? `extractionEndTime_dvr${dvrIndex}` : `extractionEndTime_dvr${dvrIndex}_${index}`;
    }

    const startTimeField = this.form.querySelector(`#${startTimeId}`);
    const endTimeField = this.form.querySelector(`#${endTimeId}`);

    if (startTimeField && endTimeField) {
      endTimeField.addEventListener('change', () => {
        const dateError = validateDateRange(startTimeField.value, endTimeField.value);
        if (dateError) {
          this.showFieldValidation(endTimeField, dateError);
        }
      });

      startTimeField.addEventListener('change', () => {
        if (endTimeField.value) {
          const dateError = validateDateRange(startTimeField.value, endTimeField.value);
          if (dateError) {
            this.showFieldValidation(endTimeField, dateError);
          } else {
            this.showFieldValidation(endTimeField, null);
          }
        }
      });
    }
  }

  addDVRGroup() {
    const container = document.getElementById('dvr-container');
    const dvrIndex = container.children.length;

    // Use the shared createDVRGroup method
    const dvrGroup = this.createDVRGroup(dvrIndex);
    dvrGroup.style.opacity = '0';

    container.appendChild(dvrGroup);

    // Apply autofill prevention to the newly created fields
    this.applyAutofillPrevention(dvrGroup.querySelectorAll('input, select, textarea'));

    // Attach validation listeners to new fields
    this.attachValidationListeners(dvrGroup);

    // Initialize Flatpickr on new datetime fields
    this.initializeFlatpickrInContainer(dvrGroup, dvrIndex);

    // Setup listeners for the new DVR
    this.setupDVRListeners(dvrIndex);

    // Re-apply iOS keyboard fix for new fields
    this.setupKeyboardProgressBarFix();

    // Animate in
    requestAnimationFrame(() => {
      dvrGroup.style.transition = 'all 0.3s ease';
      dvrGroup.style.opacity = '1';
    });

    // Scroll to new section
    setTimeout(() => scrollToElement(dvrGroup), 300);

    // Update progress
    this.updateProgress();
  }

  removeDVRGroup(dvrGroup, dvrIndex) {
    // Destroy Flatpickr instances for this DVR group
    const timeframeGroups = dvrGroup.querySelectorAll('.extraction-timeframe-group');
    timeframeGroups.forEach((group) => {
      const tfIndex = parseInt(group.dataset.groupIndex, 10);
      const startTimeId = this.getTimeframeFieldId('extractionStartTime', dvrIndex, tfIndex);
      const endTimeId = this.getTimeframeFieldId('extractionEndTime', dvrIndex, tfIndex);

      if (this.flatpickrInstances[startTimeId]) {
        this.flatpickrInstances[startTimeId].destroy();
        delete this.flatpickrInstances[startTimeId];
      }
      if (this.flatpickrInstances[endTimeId]) {
        this.flatpickrInstances[endTimeId].destroy();
        delete this.flatpickrInstances[endTimeId];
      }
    });

    // Destroy retention date Flatpickr
    const retentionId = dvrIndex === 0 ? 'dvrRetention' : `dvrRetention_${dvrIndex}`;
    if (this.flatpickrInstances[retentionId]) {
      this.flatpickrInstances[retentionId].destroy();
      delete this.flatpickrInstances[retentionId];
    }

    // Animate out
    dvrGroup.style.transition = 'all 0.3s ease';
    dvrGroup.style.opacity = '0';
    dvrGroup.style.transform = 'scale(0.95)';

    setTimeout(() => {
      dvrGroup.remove();
      this.updateProgress();
    }, 300);
  }

  addTimeFrame(dvrIndex = 0) {
    const containers = this.form.querySelectorAll('.extraction-timeframe-container');
    let container;

    // Find the correct container for this DVR
    containers.forEach(c => {
      if (parseInt(c.dataset.dvrIndex) === dvrIndex) {
        container = c;
      }
    });

    if (!container) return;

    const timeframeIndex = container.children.length;

    // Use the shared createTimeframeGroup method
    const timeFrameGroup = this.createTimeframeGroup(timeframeIndex, dvrIndex);
    timeFrameGroup.style.opacity = '0';

    container.appendChild(timeFrameGroup);

    // Apply autofill prevention to the newly created fields
    this.applyAutofillPrevention(timeFrameGroup.querySelectorAll('input, select, textarea'));

    // Attach validation listeners to new fields
    this.attachValidationListeners(timeFrameGroup);

    // Initialize Flatpickr on new datetime fields
    this.initializeFlatpickrInContainer(container.closest('.dvr-group'), dvrIndex);

    // Setup listeners for the new time frame
    this.setupTimeFrameListeners(timeframeIndex, dvrIndex);

    // Animate in
    requestAnimationFrame(() => {
      timeFrameGroup.style.transition = 'all 0.3s ease';
      timeFrameGroup.style.opacity = '1';
    });

    // Scroll to new section
    setTimeout(() => scrollToElement(timeFrameGroup), 300);

    // Update progress
    this.updateProgress();
  }

  removeTimeFrame(timeFrameGroup, dvrIndex) {
    // Get the timeframe index to clean up Flatpickr instances
    const timeframeIndex = parseInt(timeFrameGroup.dataset.groupIndex, 10);

    const startTimeId = this.getTimeframeFieldId('extractionStartTime', dvrIndex, timeframeIndex);
    const endTimeId = this.getTimeframeFieldId('extractionEndTime', dvrIndex, timeframeIndex);

    // Destroy Flatpickr instances for this timeframe
    if (this.flatpickrInstances[startTimeId]) {
      this.flatpickrInstances[startTimeId].destroy();
      delete this.flatpickrInstances[startTimeId];
    }
    if (this.flatpickrInstances[endTimeId]) {
      this.flatpickrInstances[endTimeId].destroy();
      delete this.flatpickrInstances[endTimeId];
    }

    // Animate out
    timeFrameGroup.style.transition = 'all 0.3s ease';
    timeFrameGroup.style.opacity = '0';
    timeFrameGroup.style.transform = 'scale(0.95)';

    setTimeout(() => {
      timeFrameGroup.remove();
      this.updateProgress();
    }, 300);
  }

  collectFormData() {
    const data = super.collectFormData();

    // Collect multiple DVR groups
    const dvrGroups = this.form.querySelectorAll('.dvr-group');
    data.dvrGroups = [];

    dvrGroups.forEach((dvrGroup, dvrIndex) => {
      const dvr = {
        dvrMakeModel: dvrGroup.querySelector(`[name^="dvrMakeModel"]`)?.value || '',
        isTimeDateCorrect: dvrGroup.querySelector(`[name^="isTimeDateCorrect"]:checked`)?.value || '',
        timeOffset: dvrGroup.querySelector(`[name^="timeOffset"]`)?.value || '',
        dvrRetention: dvrGroup.querySelector(`[name^="dvrRetention"]`)?.value || '',
        hasVideoMonitor: dvrGroup.querySelector(`[name^="hasVideoMonitor"]:checked`)?.value || '',
        dvrUsername: dvrGroup.querySelector(`[name^="dvrUsername"]`)?.value || '',
        dvrPassword: dvrGroup.querySelector(`[name^="dvrPassword"]`)?.value || '',
        extractionTimeFrames: []
      };

      // Collect extraction time frames for this DVR
      const timeFrameGroups = dvrGroup.querySelectorAll('.extraction-timeframe-group');
      timeFrameGroups.forEach((group, index) => {
        const timeFrame = {
          extractionStartTime: group.querySelector(`[name^="extractionStartTime"]`)?.value || '',
          extractionEndTime: group.querySelector(`[name^="extractionEndTime"]`)?.value || '',
          timePeriodType: group.querySelector(`[name^="timePeriodType"]:checked`)?.value || '',
          cameraDetails: group.querySelector(`[name^="cameraDetails"]`)?.value || ''
        };

        dvr.extractionTimeFrames.push(timeFrame);
      });

      data.dvrGroups.push(dvr);
    });

    // Keep first DVR's first time frame fields at root level for backward compatibility
    if (data.dvrGroups.length > 0) {
      const firstDVR = data.dvrGroups[0];
      data.dvrMakeModel = firstDVR.dvrMakeModel;
      data.isTimeDateCorrect = firstDVR.isTimeDateCorrect;
      data.timeOffset = firstDVR.timeOffset;
      data.dvrRetention = firstDVR.dvrRetention;
      data.hasVideoMonitor = firstDVR.hasVideoMonitor;
      data.dvrUsername = firstDVR.dvrUsername;
      data.dvrPassword = firstDVR.dvrPassword;

      // Also set old extractionTimeFrames array for compatibility
      data.extractionTimeFrames = firstDVR.extractionTimeFrames;

      if (firstDVR.extractionTimeFrames.length > 0) {
        const firstFrame = firstDVR.extractionTimeFrames[0];
        data.extractionStartTime = firstFrame.extractionStartTime;
        data.extractionEndTime = firstFrame.extractionEndTime;
        data.timePeriodType = firstFrame.timePeriodType;
        data.cameraDetails = firstFrame.cameraDetails;
      }
    }

    // Add fileNr mapping for PHP system
    data.fileNr = data.occNumber || '';

    // Set request area to city value for PHP system
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = data.city || '';

    // Set occurrence type
    data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = data.offenceType || 'Recovery Request';

    // Format location contact phone
    if (data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE]) {
      data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE] = formatPhone(data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE]);
    }

    // Generate field summaries for third-party
    data[CONFIG.FIELD_NAMES.FILE_DETAILS] = this.generateFileDetails(data);
    data[CONFIG.FIELD_NAMES.REQUEST_DETAILS] = data.incidentDescription || '';

    // Handle conditional fields for display
    data.offenceTypeDisplay = data.offenceType || 'Not specified';

    if (data.city === 'Other' && data.cityOther) {
      data.cityDisplay = data.cityOther;
    } else {
      data.cityDisplay = data.city;
    }

    return data;
  }

  generateFileDetails(data) {
    const sections = [];

    // Form Title Header
    const title = 'CCTV RECOVERY REQUEST';
    const boxWidth = 40; // Fixed width for header
    const horizontalLine = '='.repeat(boxWidth);
    const padding = ' '.repeat(Math.floor((boxWidth - title.length) / 2));

    sections.push(horizontalLine);
    sections.push(`${padding}${title}`);
    sections.push(horizontalLine);

    // === CASE ===
    const caseInfo = [];
    if (data.occNumber) {
      caseInfo.push(`Occurrence: ${data.occNumber}`);
    }
    if (data.offenceTypeDisplay) {
      caseInfo.push(`Offence: ${data.offenceTypeDisplay}`);
    }
    if (caseInfo.length > 0) {
      sections.push('=== CASE ===');
      sections.push(...caseInfo);
      sections.push('');
    }

    // === INVESTIGATOR ===
    const investigatorInfo = [];
    if (data.rName) {
      const badgeText = data.badge ? ` (Badge: ${data.badge})` : '';
      investigatorInfo.push(`Name: ${data.rName}${badgeText}`);
    }
    if (data.requestingPhone) {
      investigatorInfo.push(`Phone: ${data.requestingPhone}`);
    }
    if (data.requestingEmail) {
      investigatorInfo.push(`Email: ${data.requestingEmail}`);
    }
    if (investigatorInfo.length > 0) {
      sections.push('=== INVESTIGATOR ===');
      sections.push(...investigatorInfo);
      sections.push('');
    }

    // === LOCATION ===
    const locationInfo = [];
    if (data.businessName) {
      locationInfo.push(`Business: ${data.businessName}`);
    }
    if (data.locationAddress) {
      const city = data.cityDisplay || '';
      const address = city ? `${data.locationAddress}, ${city}` : data.locationAddress;
      locationInfo.push(`Address: ${address}`);
    } else if (data.cityDisplay) {
      locationInfo.push(`City: ${data.cityDisplay}`);
    }
    if (data.locationContact) {
      const contactPhone = data.locationContactPhone ? ` (${data.locationContactPhone})` : '';
      locationInfo.push(`Contact: ${data.locationContact}${contactPhone}`);
    }
    if (locationInfo.length > 0) {
      sections.push('=== LOCATION ===');
      sections.push(...locationInfo);
      sections.push('');
    }

    // === DVR X === (for each DVR)
    if (data.dvrGroups && data.dvrGroups.length > 0) {
      data.dvrGroups.forEach((dvr, dvrIndex) => {
        sections.push(`=== DVR ${dvrIndex + 1} ===`);

        // DVR Information
        if (dvr.dvrMakeModel) {
          sections.push(`Make/Model: ${dvr.dvrMakeModel}`);
        }
        if (dvr.isTimeDateCorrect) {
          sections.push(`Time Correct: ${dvr.isTimeDateCorrect}`);
          // Show time offset only if time is NOT correct
          if (dvr.isTimeDateCorrect === 'No' && dvr.timeOffset) {
            sections.push(`Time Offset: ${dvr.timeOffset}`);
          }
        }
        if (dvr.dvrRetention) {
          const retention = calculateRetentionDays(dvr.dvrRetention);
          const urgentText = retention.days <= 4 ? ' - URGENT' : '';
          sections.push(`Retention: ${retention.days} days${urgentText}`);
        }
        if (dvr.hasVideoMonitor) {
          sections.push(`Monitor On-Site: ${dvr.hasVideoMonitor}`);
        }

        sections.push('');

        // --- Time Frame X --- (for each time frame within this DVR)
        if (dvr.extractionTimeFrames && dvr.extractionTimeFrames.length > 0) {
          dvr.extractionTimeFrames.forEach((timeFrame, frameIndex) => {
            sections.push(`--- Time Frame ${frameIndex + 1} ---`);

            // Format dates nicely
            if (timeFrame.extractionStartTime && timeFrame.extractionEndTime) {
              const startDate = new Date(timeFrame.extractionStartTime);
              const endDate = new Date(timeFrame.extractionEndTime);

              const formattedStart = this.formatDateTime(startDate);
              const formattedEnd = this.formatDateTime(endDate);

              sections.push(`Period: ${formattedStart} to ${formattedEnd}`);

              // Calculate duration
              const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));
              const durationText = this.formatDuration(durationMinutes);
              sections.push(`Duration: ${durationText}`);
            }

            if (timeFrame.timePeriodType) {
              sections.push(`Time Type: ${timeFrame.timePeriodType}`);
            }

            // Camera details as bullet points
            if (timeFrame.cameraDetails) {
              sections.push('Cameras:');
              const cameraLines = timeFrame.cameraDetails.split('\n').filter(line => line.trim());
              cameraLines.forEach(camera => {
                sections.push(`- ${camera.trim()}`);
              });
            }

            sections.push('');
          });
        }

        // Access Information
        const username = dvr.dvrUsername || '(none)';
        const password = dvr.dvrPassword || '(none)';
        sections.push(`Access: ${username} / ${password}`);
        sections.push('');
      });
    }

    // === INCIDENT ===
    if (data.incidentDescription) {
      sections.push('=== INCIDENT ===');
      sections.push(data.incidentDescription);
    }

    return sections.join('\n');
  }

  /**
   * Format a date object to readable string (e.g., "Dec 3, 2025 14:30")
   */
  formatDateTime(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  }

  /**
   * Format duration in minutes to readable string
   */
  formatDuration(minutes) {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  }

  validateForm() {
    const result = super.validateForm();

    // Validate all extraction time frames
    const timeFrameGroups = this.form.querySelectorAll('.extraction-timeframe-group');
    timeFrameGroups.forEach((group, index) => {
      const startTimeField = group.querySelector('[name^="extractionStartTime"]');
      const endTimeField = group.querySelector('[name^="extractionEndTime"]');

      if (startTimeField && endTimeField && startTimeField.value && endTimeField.value) {
        const dateError = validateDateRange(startTimeField.value, endTimeField.value);
        if (dateError) {
          result.errors[`extractionEndTime_${index}`] = dateError;
          result.isValid = false;
          this.showFieldValidation(endTimeField, dateError);
          if (!result.firstErrorField) {
            result.firstErrorField = endTimeField;
          }
        }
      }
    });

    // Validate DVR retention date is not in the future
    const dvrRetentionField = this.form.querySelector('#dvrRetention');
    if (dvrRetentionField && dvrRetentionField.value) {
      const retention = calculateRetentionDays(dvrRetentionField.value);
      if (retention.days < 0) {
        const error = 'DVR retention date cannot be in the future';
        result.errors.dvrRetention = error;
        result.isValid = false;
        this.showFieldValidation(dvrRetentionField, error);
        if (!result.firstErrorField) {
          result.firstErrorField = dvrRetentionField;
        }
      }
    }

    return result;
  }

  /**
   * Get the PDF filename for recovery form
   * @param {Object} formData - The collected form data
   * @returns {string} The PDF filename
   */
  getPdfFilename(formData) {
    return `FVU_Recovery_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
  }
}

export default RecoveryFormHandler;
