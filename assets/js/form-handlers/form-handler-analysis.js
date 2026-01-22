/**
 * Analysis Form Handler
 * Specific handling for analysis form with conditional fields
 */

import { FormHandler } from './form-handler-base.js';
import { FormFieldBuilder } from './form-field-builder.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { submitWithRetry } from '../api-client.js';
import { showToast, downloadBlob, toggleElement, debounce } from '../utils.js';
import { CONFIG } from '../config.js';

/**
 * Analysis Form Handler
 * Handles video analysis requests with conditional field logic
 */
export class AnalysisFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);

    // Store Flatpickr instances for programmatic access
    this.flatpickrInstances = {};

    // Build initial form fields via FormFieldBuilder
    this.buildInitialFields();

    // Setup analysis-specific listeners (conditionals, etc.)
    this.setupAnalysisSpecificListeners();

    // Initialize Flatpickr on date fields (AFTER fields are built)
    this.initializeFlatpickrFields();
  }

  /**
   * Build all initial form fields via FormFieldBuilder
   * Creates sections for case info, investigator, video source, and work request
   */
  buildInitialFields() {
    this.buildCaseSection();
    this.buildInvestigatorSection();
    this.buildVideoSourceSection();
    this.buildWorkRequestSection();

    // Attach validation listeners to all built fields
    this.attachValidationListeners(this.form);

    // Re-apply iOS keyboard fix for dynamically created fields
    // The base class init() runs before buildInitialFields(), so dynamic fields miss the fix
    this.setupKeyboardProgressBarFix();

    // Apply autofill prevention to newly created dynamic fields
    // The base class configureAutofill() runs in init() before buildInitialFields() creates these fields
    if (CONFIG.FEATURES.BROWSER_AUTOFILL === false) {
      this.applyAutofillPrevention(this.form.querySelectorAll('.form-control'));
    }
  }

  /**
   * Build case information section
   */
  buildCaseSection() {
    const container = document.getElementById('case-section-container');
    if (!container) {
      // Expected during Phase 2 - HTML still has hardcoded fields
      // Phase 3 will add container divs and remove hardcoded fields
      console.debug('[AnalysisForm] case-section-container not found - using hardcoded HTML fields');
      return;
    }

    const section = FormFieldBuilder.createCaseInformationSection();
    container.appendChild(section);
  }

  /**
   * Build investigator section
   */
  buildInvestigatorSection() {
    const container = document.getElementById('investigator-section-container');
    if (!container) {
      console.debug('[AnalysisForm] investigator-section-container not found - using hardcoded HTML fields');
      return;
    }

    const section = FormFieldBuilder.createInvestigatorSection();
    container.appendChild(section);
  }

  /**
   * Build video source section
   */
  buildVideoSourceSection() {
    const container = document.getElementById('video-source-section-container');
    if (!container) {
      console.debug('[AnalysisForm] video-source-section-container not found - using hardcoded HTML fields');
      return;
    }

    const section = FormFieldBuilder.createVideoSourceSection();
    container.appendChild(section);
  }

  /**
   * Build work request section
   */
  buildWorkRequestSection() {
    const container = document.getElementById('work-request-section-container');
    if (!container) {
      console.debug('[AnalysisForm] work-request-section-container not found - using hardcoded HTML fields');
      return;
    }

    const section = FormFieldBuilder.createWorkRequestSection();
    container.appendChild(section);
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

  setupAnalysisSpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Setup all "Other" fields - standard pattern
    // Note: offenceType "Other" option will be added in Phase 3 via FormFieldBuilder
    conditionalHandler.setupOtherField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther');
    conditionalHandler.setupOtherField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther');
    conditionalHandler.setupOtherField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther');

    // Also setup city "Other" field (present in current HTML)
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');

    // Special handling for "Locker" selection in videoLocation
    // This shows bagNumber and lockerNumber fields (both OPTIONAL)
    // Note: lockerInfoGroup container will be added in Phase 3 via FormFieldBuilder
    const videoLocationSelect = this.form.querySelector('#videoLocation');
    if (videoLocationSelect) {
      videoLocationSelect.addEventListener('change', (e) => {
        // Use document.getElementById for container groups (may be outside form scope)
        const lockerGroup = document.getElementById('lockerInfoGroup');
        if (lockerGroup) {
          const showLocker = e.target.value === 'Locker';
          toggleElement(lockerGroup, showLocker);

          // Use form-scoped querySelector for form fields
          const bagField = this.form.querySelector('#bagNumber');
          const lockerField = this.form.querySelector('#lockerNumber');

          // Note: bagNumber and lockerNumber are OPTIONAL - do NOT add required attribute
          if (!showLocker) {
            // Clear values and validation when hiding
            if (bagField) {
              bagField.value = '';
              this.showFieldValidation(bagField, null);
            }
            if (lockerField) {
              lockerField.value = '';
              this.showFieldValidation(lockerField, null);
            }
          }
        }
      });
    }

    // Recording date validation (past date only) - handled by Flatpickr onChange
    // Fallback for browsers without Flatpickr
    const recordingDateField = this.form.querySelector('#recordingDate');
    if (recordingDateField) {
      recordingDateField.addEventListener('change', () => this.validateSingleField(recordingDateField));
    }
  }

  /**
   * Initialize Flatpickr on all date fields
   * Must be called AFTER buildInitialFields() so DOM elements exist
   */
  initializeFlatpickrFields() {
    // Recording date field with past-date restriction
    const recordingDateField = this.form.querySelector('#recordingDate');
    if (recordingDateField && typeof window !== 'undefined' && window.flatpickr) {
      this.flatpickrInstances.recordingDate = window.flatpickr(recordingDateField, {
        ...CONFIG.FLATPICKR_CONFIG.DATE,
        maxDate: 'today', // Prevent future dates

        // Trigger validation on change
        onChange: (selectedDates, dateStr) => {
          this.validateSingleField(recordingDateField);
        }
      });
    }
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
    if (data.recordingDate && this.flatpickrInstances.recordingDate) {
      // setDate(date, triggerChange) - second param triggers onChange callback
      this.flatpickrInstances.recordingDate.setDate(data.recordingDate, true);
    }
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

  collectFormData() {
    const data = super.collectFormData();

    // Add fileNr mapping for PHP system
    data.fileNr = data.occNumber || '';

    // Set request area to city value for PHP system
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = data.city || '';

    // Map occurrence type
    data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = data.offenceType === 'Other' ?
      data.offenceTypeOther : data.offenceType;

    // Generate field summaries for third-party
    data[CONFIG.FIELD_NAMES.FILE_DETAILS] = this.generateFileDetails(data);
    data[CONFIG.FIELD_NAMES.REQUEST_DETAILS] = data.requestDetails || '';

    // Handle conditional fields for display
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      data.offenceTypeDisplay = data.offenceTypeOther;
    } else {
      data.offenceTypeDisplay = data.offenceType;
    }

    if (data.videoLocation === 'Other' && data.videoLocationOther) {
      data.videoLocationDisplay = data.videoLocationOther;
    } else {
      data.videoLocationDisplay = data.videoLocation;
    }

    if (data.city === 'Other' && data.cityOther) {
      data.cityDisplay = data.cityOther;
    } else {
      data.cityDisplay = data.city;
    }

    if (data.serviceRequired === 'Other' && data.serviceRequiredOther) {
      data.serviceRequiredDisplay = data.serviceRequiredOther;
    } else {
      data.serviceRequiredDisplay = data.serviceRequired;
    }

    return data;
  }

  generateFileDetails(data) {
    const sections = [];

    // Form Title Header
    const title = 'FORENSIC ANALYSIS REQUEST';
    const boxWidth = 40; // Fixed width for header
    const horizontalLine = '='.repeat(boxWidth);
    const padding = ' '.repeat(Math.floor((boxWidth - title.length) / 2));

    sections.push(horizontalLine);
    sections.push(`${padding}${title}`);
    sections.push(horizontalLine);

    // Section 1: Case Information
    const caseFields = [];
    if (data.occNumber) caseFields.push(`Occurrence: ${data.occNumber}`);
    if (data.offenceTypeDisplay) caseFields.push(`Offence: ${data.offenceTypeDisplay}`);
    if (data.jobRequired) caseFields.push(`Priority: ${data.jobRequired}`);
    if (caseFields.length > 0) {
      sections.push('=== CASE ===\n' + caseFields.join('\n'));
    }

    // Section 2: Evidence Location
    const evidenceFields = [];
    if (data.videoLocationDisplay) evidenceFields.push(`Storage: ${data.videoLocationDisplay}`);
    if (data.bagNumber) evidenceFields.push(`Bag #: ${data.bagNumber}`);
    if (data.lockerNumber) evidenceFields.push(`Locker: ${data.lockerNumber}`);
    if (evidenceFields.length > 0) {
      sections.push('=== EVIDENCE ===\n' + evidenceFields.join('\n'));
    }

    // Section 3: Investigator
    const investigatorFields = [];
    if (data.rName && data.badge) {
      investigatorFields.push(`Name: ${data.rName} (Badge: ${data.badge})`);
    } else if (data.rName) {
      investigatorFields.push(`Name: ${data.rName}`);
    } else if (data.badge) {
      investigatorFields.push(`Badge: ${data.badge}`);
    }
    if (data.requestingPhone) investigatorFields.push(`Phone: ${data.requestingPhone}`);
    if (data.requestingEmail) investigatorFields.push(`Email: ${data.requestingEmail}`);
    if (investigatorFields.length > 0) {
      sections.push('=== INVESTIGATOR ===\n' + investigatorFields.join('\n'));
    }

    // Section 4: Location Details
    const locationFields = [];
    if (data.videoSeizedFrom) locationFields.push(`Seized From: ${data.videoSeizedFrom}`);
    if (data.businessName) locationFields.push(`Business: ${data.businessName}`);
    if (data.locationAddress) {
      const city = data.cityDisplay || '';
      const address = city ? `${data.locationAddress}, ${city}` : data.locationAddress;
      locationFields.push(`Address: ${address}`);
    } else if (data.cityDisplay) {
      locationFields.push(`City: ${data.cityDisplay}`);
    }
    if (data.recordingDate) locationFields.push(`Recording Date: ${data.recordingDate}`);
    if (locationFields.length > 0) {
      sections.push('=== LOCATION ===\n' + locationFields.join('\n'));
    }

    // Section 5: File Names
    if (data.fileNames) {
      const fileList = data.fileNames.split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)
        .join('\n');
      if (fileList) {
        sections.push('=== FILES ===\n' + fileList);
      }
    }

    // Section 6: Service Required
    if (data.serviceRequiredDisplay) {
      sections.push('=== SERVICE ===\n' + data.serviceRequiredDisplay);
    }

    // Section 7: Request Details
    if (data.requestDetails) {
      sections.push('=== REQUEST ===\n' + data.requestDetails);
    }

    // Section 8: Additional Information
    if (data.additionalInfo) {
      sections.push('=== ADDITIONAL ===\n' + data.additionalInfo);
    }

    return sections.join('\n\n');
  }

  async submitForm(formData) {
    // Save officer info using base class method
    this.saveOfficerInfoFromFormData(formData);

    try {
      // Generate PDF and JSON
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);

      console.log('Analysis form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');

      // Submit to API with retry logic (Supabase or PHP)
      const result = await submitWithRetry(formData, pdfBlob, jsonBlob);

      if (result.success) {
        // Download PDF locally
        const pdfFilename = `FVU_Analysis_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
        downloadBlob(pdfBlob, pdfFilename);

        showToast(`${CONFIG.MESSAGES.SUBMISSION_SUCCESS}. ID: ${result.submissionId || result.ticketNumber}`, 'success');

        // Clear the form after successful submission
        this.clearFormAfterSubmission();
      } else {
        showToast(result.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
      }

    } catch (error) {
      console.error('Error during submission:', error);

      // Determine specific error type and show appropriate message
      const errorMessage = this.getErrorMessage(error);
      showToast(errorMessage, 'error');

      // Save draft on error
      this.saveDraftAuto();
    }
  }
}

export default AnalysisFormHandler;
