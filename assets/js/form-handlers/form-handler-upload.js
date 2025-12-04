/**
 * Upload Form Handler
 * Specific handling for upload form with dynamic location-video groups
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { FormFieldBuilder } from './form-field-builder.js';
import { validateField, validateDateRange, validateLocations } from '../validators.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { submitWithRetry } from '../api-client.js';
import { showToast, downloadBlob } from '../utils.js';
import { toggleElement, scrollToElement, createElement } from '../utils.js';
import { calculateRetentionDays, generateFieldSummaries } from '../calculations.js';
import { CONFIG } from '../config.js';

/**
 * Upload Form Handler
 * Handles dynamic location-video groups and media uploads
 */
export class UploadFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.locations = [];
    this.setupUploadSpecificListeners();
  }

  setupUploadSpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Media type "Other" field
    conditionalHandler.setupOtherField('mediaType', 'mediaTypeOtherGroup', 'mediaTypeOther');

    // Setup listeners for the first location-video group
    this.setupLocationVideoListeners(0);

    // DVR retention calculation
    const dvrDateField = this.form.querySelector('#dvrEarliestDate');
    if (dvrDateField) {
      dvrDateField.addEventListener('change', (e) => {
        const retentionEl = document.getElementById('retentionCalculation');
        if (e.target.value) {
          const retention = calculateRetentionDays(e.target.value);
          retentionEl.textContent = retention.message;
          retentionEl.className = 'text-info mt-2';
        } else {
          retentionEl.textContent = '';
        }
      });
    }

    // Add location button
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
      addLocationBtn.addEventListener('click', () => this.addLocationVideo());
    }

    // Set incident date to today (hidden field)
    const occDateField = this.form.querySelector('#occDate');
    if (occDateField) {
      occDateField.value = new Date().toISOString().split('T')[0];
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
          offsetField.removeAttribute('required');
          offsetField.value = '';
        } else {
          toggleElement(warningEl, false);
          toggleElement(offsetGroup, true);
          offsetField.setAttribute('required', 'required');
        }
      });
    });
  }

  addLocationVideo() {
    const container = document.getElementById('location-video-container');
    const index = container.children.length;

    const locationVideoGroup = createElement('div', {
      className: 'location-video-group',
      dataset: { groupIndex: index },
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 2px solid var(--color-primary); opacity: 0;'
    });

    // Location header (like "DVR 1")
    const header = createElement('h2', {
      style: 'color: var(--color-primary); margin-bottom: 1.5rem; text-align: center; font-size: 1.5rem;'
    }, `Location ${index + 1}`);
    locationVideoGroup.appendChild(header);

    // Create location section
    const locationSection = createElement('section', { className: 'form-section' });
    locationSection.innerHTML = `
      <h3 style="color: var(--color-primary); margin-bottom: 1.5rem;">Location Information</h3>
    `;

    // Location fields
    const businessNameGroup = FormFieldBuilder.createLocationField('businessName', index, 'Business Name', false);
    const addressGroup = FormFieldBuilder.createLocationField('locationAddress', index, 'Location Address', true);
    const cityGroup = FormFieldBuilder.createCityField(index);

    locationSection.appendChild(businessNameGroup);
    locationSection.appendChild(addressGroup);
    locationSection.appendChild(cityGroup);

    // Create video timeframe section
    const videoSection = createElement('section', { className: 'form-section' });
    videoSection.innerHTML = `
      <h3 style="color: var(--color-primary); margin-bottom: 1.5rem;">Video Timeframe</h3>
    `;

    // Video timeframe fields
    const startTimeGroup = FormFieldBuilder.createTimeField('videoStartTime', index, 'Video Start Time', true);
    const endTimeGroup = FormFieldBuilder.createTimeField('videoEndTime', index, 'Video End Time', true);
    const timeSyncGroup = FormFieldBuilder.createTimeSyncField(index);
    const dvrDateGroup = FormFieldBuilder.createDvrDateField(index, (e) => {
      if (e.target.value) {
        const retentionId = index === 0 ? 'retentionCalculation' : `retentionCalculation_${index}`;
        const retentionDiv = document.getElementById(retentionId);
        const retention = calculateRetentionDays(e.target.value);
        retentionDiv.textContent = retention.message;
        retentionDiv.className = 'text-info mt-2';
      }
    });

    videoSection.appendChild(startTimeGroup);
    videoSection.appendChild(endTimeGroup);
    videoSection.appendChild(timeSyncGroup);
    videoSection.appendChild(dvrDateGroup);

    // Remove button
    const removeBtn = createElement('button', {
      type: 'button',
      className: 'btn btn-danger',
      style: 'margin-top: 1rem; width: 100%;',
      onclick: () => this.removeLocationVideo(locationVideoGroup)
    }, '× Remove This Location');

    locationVideoGroup.appendChild(locationSection);
    locationVideoGroup.appendChild(videoSection);
    locationVideoGroup.appendChild(removeBtn);

    container.appendChild(locationVideoGroup);

    // Setup listeners for the new group
    this.setupLocationVideoListeners(index);

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
    locationVideoGroup.style.transition = 'all 0.3s ease';
    locationVideoGroup.style.opacity = '0';
    locationVideoGroup.style.transform = 'scale(0.95)';

    setTimeout(() => {
      locationVideoGroup.remove();
      this.updateProgress();
    }, 300);
  }

  collectFormData() {
    const data = super.collectFormData();

    // Collect multiple location-video groups
    const locationVideoGroups = this.form.querySelectorAll('.location-video-group');
    data.locations = [];

    locationVideoGroups.forEach((group, index) => {
      const location = {
        businessName: group.querySelector(`[name^="businessName"]`).value,
        locationAddress: group.querySelector(`[name^="locationAddress"]`).value,
        city: group.querySelector(`[name^="city"]`).value
      };

      if (location.city === 'Other') {
        location.cityOther = group.querySelector(`[name^="cityOther"]`).value;
      }

      // Add video timeframe data
      location.videoStartTime = group.querySelector(`[name^="videoStartTime"]`).value;
      location.videoEndTime = group.querySelector(`[name^="videoEndTime"]`).value;
      location.isTimeDateCorrect = group.querySelector(`[name^="isTimeDateCorrect"]:checked`)?.value || '';

      if (location.isTimeDateCorrect === 'No') {
        location.timeOffset = group.querySelector(`[name^="timeOffset"]`).value;
      }

      location.dvrEarliestDate = group.querySelector(`[name^="dvrEarliestDate"]`).value;

      data.locations.push(location);
    });

    // Handle media type "Other"
    if (data.mediaType === 'Other' && data.mediaTypeOther) {
      data.mediaTypeDisplay = data.mediaTypeOther;
    } else {
      data.mediaTypeDisplay = data.mediaType;
    }

    // Generate field summaries for third-party
    const summaries = generateFieldSummaries(data);
    Object.assign(data, summaries);

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
        locationAddress: group.querySelector('[name^="locationAddress"]').value,
        city: group.querySelector('[name^="city"]').value,
        cityOther: group.querySelector('[name^="cityOther"]')?.value
      });
    });

    // Validate locations
    const locationErrors = validateLocations(locations);
    if (Object.keys(locationErrors).length > 0) {
      result.isValid = false;

      // Show location errors
      Object.entries(locationErrors).forEach(([index, errors]) => {
        const group = locationVideoGroups[index];
        Object.entries(errors).forEach(([fieldName, error]) => {
          const field = group.querySelector(`[name^="${fieldName}"]`);
          if (field) {
            this.showFieldValidation(field, error);
          }
        });
      });
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

      console.log('Upload form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');

      // Submit to API with retry logic (Supabase or PHP)
      const result = await submitWithRetry(formData, pdfBlob, jsonBlob);

      if (result.success) {
        // Download PDF locally
        const pdfFilename = `FVU_Upload_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
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

export default UploadFormHandler;
