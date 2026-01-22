/**
 * Upload Form Handler
 * Specific handling for upload form with dynamic location-video groups
 */

import { FormHandler } from './form-handler-base.js';
import { ConditionalFieldHandler } from './conditional-field-handler.js';
import { FormFieldBuilder } from './form-field-builder.js';
import { validateDateRange, validateLocations } from '../validators.js';
import { toggleElement, scrollToElement, createElement } from '../utils.js';
import { calculateRetentionDays } from '../calculations.js';
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

    // Apply autofill prevention to the newly created fields
    const newFields = locationVideoGroup.querySelectorAll('input, select, textarea');
    this.applyAutofillPrevention(newFields);

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
