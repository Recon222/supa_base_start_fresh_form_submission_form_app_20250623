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

    // Setup listeners for the first time frame
    this.setupTimeFrameListeners(0);

    // Add time frame button
    const addTimeFrameBtn = document.getElementById('addTimeFrameBtn');
    if (addTimeFrameBtn) {
      addTimeFrameBtn.addEventListener('click', () => this.addTimeFrame());
    }

    // Phone number formatting for location contact
    const locationPhoneField = this.form.querySelector('#locationContactPhone');
    if (locationPhoneField) {
      locationPhoneField.addEventListener('input', debounce(() => this.validateSingleField(locationPhoneField), 500));
    }

    // DVR retention calculation and future date validation
    const dvrRetentionField = this.form.querySelector('#dvrRetention');
    if (dvrRetentionField) {
      dvrRetentionField.addEventListener('change', (e) => {
        const retentionEl = document.getElementById('retentionCalculation');
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

  setupTimeFrameListeners(index) {
    // Extraction time validation
    const startTimeId = index === 0 ? 'extractionStartTime' : `extractionStartTime_${index}`;
    const endTimeId = index === 0 ? 'extractionEndTime' : `extractionEndTime_${index}`;

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

  addTimeFrame() {
    const container = document.getElementById('extraction-timeframe-container');
    const index = container.children.length;

    const timeFrameGroup = createElement('div', {
      className: 'extraction-timeframe-group',
      dataset: { groupIndex: index },
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--border-color); opacity: 0;'
    });

    // Create section
    const section = createElement('section', { className: 'form-section' });
    const heading = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem;'
    }, `Video Extraction Details - Time Frame ${index + 1}`);
    section.appendChild(heading);

    // Create form row for start and end times
    const formRow = createElement('div', { className: 'form-row' });
    const startTimeGroup = FormFieldBuilder.createExtractionTimeField('extractionStartTime', index, 'Time Period From', true);
    const endTimeGroup = FormFieldBuilder.createExtractionTimeField('extractionEndTime', index, 'Time Period To', true);
    formRow.appendChild(startTimeGroup);
    formRow.appendChild(endTimeGroup);
    section.appendChild(formRow);

    // Add time period type field
    const timePeriodTypeGroup = FormFieldBuilder.createTimePeriodTypeField(index);
    section.appendChild(timePeriodTypeGroup);

    // Add camera details field
    const cameraDetailsGroup = FormFieldBuilder.createCameraDetailsField(index);
    section.appendChild(cameraDetailsGroup);

    timeFrameGroup.appendChild(section);

    // Remove button
    const removeBtn = createElement('button', {
      type: 'button',
      className: 'btn btn-danger',
      style: 'margin-top: 1rem; width: 100%;',
      onclick: () => this.removeTimeFrame(timeFrameGroup)
    }, `× Remove Time Frame ${index + 1}`);

    timeFrameGroup.appendChild(removeBtn);
    container.appendChild(timeFrameGroup);

    // Setup listeners for the new time frame
    this.setupTimeFrameListeners(index);

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

  removeTimeFrame(timeFrameGroup) {
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

    // Collect multiple extraction time frames
    const timeFrameGroups = this.form.querySelectorAll('.extraction-timeframe-group');
    data.extractionTimeFrames = [];

    timeFrameGroups.forEach((group, index) => {
      const timeFrame = {
        extractionStartTime: group.querySelector(`[name^="extractionStartTime"]`).value,
        extractionEndTime: group.querySelector(`[name^="extractionEndTime"]`).value,
        timePeriodType: group.querySelector(`[name^="timePeriodType"]:checked`)?.value || '',
        cameraDetails: group.querySelector(`[name^="cameraDetails"]`).value
      };

      data.extractionTimeFrames.push(timeFrame);
    });

    // Keep first time frame fields at root level for backward compatibility
    if (data.extractionTimeFrames.length > 0) {
      const firstFrame = data.extractionTimeFrames[0];
      data.extractionStartTime = firstFrame.extractionStartTime;
      data.extractionEndTime = firstFrame.extractionEndTime;
      data.timePeriodType = firstFrame.timePeriodType;
      data.cameraDetails = firstFrame.cameraDetails;
    }

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
