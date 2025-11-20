/**
 * Recovery Form Handler
 * Specific handling for recovery form with DVR system details
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { validateDateRange, formatPhone } from '../validators.js';
import { debounce, toggleElement } from '../utils.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { submitForm } from '../api-client.js';
import { showToast, downloadBlob } from '../utils.js';
import { CONFIG } from '../config.js';

/**
 * Recovery Form Handler
 * Handles video recovery requests from DVR systems
 */
export class RecoveryFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.setupRecoverySpecificListeners();
  }

  setupRecoverySpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Setup "Other" fields
    conditionalHandler.setupOtherField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther');
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');

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
          this.showFieldValidation(offsetField, null);
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

    // Phone number formatting for location contact
    const locationPhoneField = this.form.querySelector('#locationContactPhone');
    if (locationPhoneField) {
      locationPhoneField.addEventListener('input', debounce(() => this.validateSingleField(locationPhoneField), 500));
    }
  }

  collectFormData() {
    const data = super.collectFormData();

    // Set request area
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = CONFIG.FORM_TYPES.RECOVERY;

    // Set occurrence type
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = data.offenceTypeOther;
    } else if (data.offenceType) {
      data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = data.offenceType;
    } else {
      data[CONFIG.FIELD_NAMES.OCCURRENCE_TYPE] = 'Recovery Request';
    }

    // Set occurrence date to extraction start date
    if (data.extractionStartTime) {
      data[CONFIG.FIELD_NAMES.OCCURRENCE_DATE] = data.extractionStartTime.split('T')[0];
    }

    // Format location contact phone
    if (data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE]) {
      data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE] = formatPhone(data[CONFIG.FIELD_NAMES.LOCATION_CONTACT_PHONE]);
    }

    // Generate field summaries for third-party
    data[CONFIG.FIELD_NAMES.FILE_DETAILS] = this.generateFileDetails(data);
    data[CONFIG.FIELD_NAMES.REQUEST_DETAILS] = data.incidentDescription || '';

    // Handle conditional fields for display
    if (data.offenceType === 'Other' && data.offenceTypeOther) {
      data.offenceTypeDisplay = data.offenceTypeOther;
    } else {
      data.offenceTypeDisplay = data.offenceType || 'Not specified';
    }

    if (data.city === 'Other' && data.cityOther) {
      data.cityDisplay = data.cityOther;
    } else {
      data.cityDisplay = data.city;
    }

    return data;
  }

  generateFileDetails(data) {
    const details = [];

    // Add location info
    if (data.businessName) {
      details.push(`Business: ${data.businessName}`);
    }
    details.push(`Location: ${data.locationAddress}, ${data.cityDisplay}`);

    // Add extraction time info
    if (data.extractionStartTime && data.extractionEndTime) {
      const startDate = new Date(data.extractionStartTime);
      const endDate = new Date(data.extractionEndTime);
      const duration = Math.round((endDate - startDate) / (1000 * 60)); // minutes
      details.push(`Extraction period: ${duration} minutes`);
    }

    // Add time period type
    if (data.timePeriodType) {
      details.push(`Time type: ${data.timePeriodType}`);
    }

    // Add camera info
    if (data.cameraDetails) {
      const cameraCount = data.cameraDetails.split('\n').filter(c => c.trim()).length;
      details.push(`${cameraCount} camera(s) listed`);
    }

    return details.join(' | ');
  }

  validateForm() {
    const result = super.validateForm();

    // Additional validation for extraction date range
    const startTimeField = this.form.querySelector('#extractionStartTime');
    const endTimeField = this.form.querySelector('#extractionEndTime');

    if (startTimeField && endTimeField && startTimeField.value && endTimeField.value) {
      const dateError = validateDateRange(startTimeField.value, endTimeField.value);
      if (dateError) {
        result.errors.extractionEndTime = dateError;
        result.isValid = false;
        this.showFieldValidation(endTimeField, dateError);
        if (!result.firstErrorField) {
          result.firstErrorField = endTimeField;
        }
      }
    }

    return result;
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

      console.log('Recovery form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');

      // Submit to API (Supabase or PHP)
      const result = await submitForm(formData, pdfBlob, jsonBlob);

      if (result.success) {
        // Download PDF locally
        const pdfFilename = `FVU_Recovery_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
        downloadBlob(pdfBlob, pdfFilename);

        showToast(`${CONFIG.MESSAGES.SUBMISSION_SUCCESS}. ID: ${result.submissionId || result.ticketNumber}`, 'success');

        // Clear the form after successful submission
        this.clearFormAfterSubmission();
      } else {
        showToast(result.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
      }

    } catch (error) {
      console.error('Error during submission:', error);
      showToast(error.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');

      // Save draft on error
      this.saveDraftAuto();
    }
  }
}

export default RecoveryFormHandler;
