/**
 * Form Handler
 * Core form lifecycle management
 */

import { CONFIG } from './config.js';
import { validateField, validateDateRange, validateConditionalFields, validateLocations, calculateFormCompletion, formatPhone } from './validators.js';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge, saveSessionStart } from './storage.js';
import { saveOfficerInfo, loadOfficerInfo, hasOfficerInfo, isFirstTimeUse, acknowledgeStorage, clearOfficerInfo } from './officer-storage.js';
import { debounce, toggleElement, scrollToElement, showToast, createElement, generateId } from './utils.js';
import { calculateRetentionDays, generateFieldSummaries } from './calculations.js';

/**
 * Base FormHandler class
 * Extended by specific form handlers
 */
export class FormHandler {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) {
      throw new Error(`Form with id "${formId}" not found`);
    }
    
    this.formType = this.form.id.replace('-form', '');
    this.isSubmitting = false;
    this.draftTimer = null;
    
    this.init();
  }
  
  init() {
    // Save session start
    saveSessionStart();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load officer info if exists
    this.loadOfficerInfoIfExists();
    
    // Load draft if exists
    this.loadDraftIfExists();
    
    // Initialize progress bar
    this.updateProgress();
  }
  
  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Reset button
    this.form.addEventListener('reset', (e) => this.handleReset(e));
    
    // Field validation on blur
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('blur', () => this.validateSingleField(field));
      
      // Real-time validation for certain fields
      if (field.type === 'tel' || field.name === CONFIG.FIELD_NAMES.OFFICER_EMAIL) {
        field.addEventListener('input', debounce(() => this.validateSingleField(field), 500));
      }
    });
    
    // Auto-save draft on input
    this.form.addEventListener('input', debounce(() => this.saveDraftAuto(), 2000));
    
    // Progress bar updates
    this.form.addEventListener('change', () => this.updateProgress());
    
    // Clear officer info button
    const clearBtn = document.getElementById('clearOfficerInfo');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear saved officer information from this browser?')) {
          if (clearOfficerInfo()) {
            // Clear the fields
            ['rName', 'badge', 'requestingPhone', 'requestingEmail'].forEach(name => {
              const field = this.form.querySelector(`[name="${name}"]`);
              if (field) {
                field.value = '';
                field.classList.remove('is-valid');
              }
            });
            showToast(CONFIG.MESSAGES.OFFICER_INFO_CLEARED, 'info');
          }
        }
      });
    }
  }
  
  validateSingleField(field) {
    const isRequired = field.hasAttribute('required');
    const error = validateField(field.value, field.name, isRequired);
    
    this.showFieldValidation(field, error);
    
    return !error;
  }
  
  showFieldValidation(field, error) {
    const feedbackElement = field.parentElement.querySelector('.invalid-feedback');
    
    if (error) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');
      if (feedbackElement) {
        feedbackElement.textContent = error;
      }
    } else {
      field.classList.remove('is-invalid');
      
      // Only show valid state for required fields with values
      if (field.hasAttribute('required') && field.value.trim()) {
        field.classList.add('is-valid');
      }
      
      if (feedbackElement) {
        feedbackElement.textContent = '';
      }
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    if (this.isSubmitting) return;
    
    this.isSubmitting = true;
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Validating...';
    
    try {
      // Validate form
      const validationResult = this.validateForm();
      
      if (!validationResult.isValid) {
        this.handleValidationErrors(validationResult.errors);
        return;
      }
      
      // Collect form data
      submitButton.textContent = 'Preparing...';
      const formData = this.collectFormData();
      
      // Submit form
      submitButton.textContent = 'Submitting...';
      await this.submitForm(formData);
      
    } catch (error) {
      console.error('Form submission error:', error);
      showToast(CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
    } finally {
      this.isSubmitting = false;
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  }
  
  validateForm() {
    const errors = {};
    let firstErrorField = null;
    
    // Validate all fields
    this.form.querySelectorAll('.form-control').forEach(field => {
      const isRequired = field.hasAttribute('required');
      const error = validateField(field.value, field.name, isRequired);
      
      if (error) {
        errors[field.name] = error;
        if (!firstErrorField) firstErrorField = field;
      }
      
      this.showFieldValidation(field, error);
    });
    
    // Validate conditional fields
    const formData = this.collectFormData();
    const conditionalErrors = validateConditionalFields(formData);
    Object.assign(errors, conditionalErrors);
    
    // Show conditional field errors
    Object.entries(conditionalErrors).forEach(([fieldName, error]) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.showFieldValidation(field, error);
        if (!firstErrorField) firstErrorField = field;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      firstErrorField
    };
  }
  
  handleValidationErrors(errors) {
    const errorCount = Object.keys(errors).length;
    const message = errorCount === 1 
      ? 'Please fix the error below' 
      : `Please fix the ${errorCount} errors below`;
    
    showToast(message, 'error');
    
    // Scroll to first error
    const firstErrorField = this.form.querySelector('.is-invalid');
    if (firstErrorField) {
      scrollToElement(firstErrorField);
      
      // Add shake animation
      firstErrorField.style.animation = `shake ${CONFIG.ANIMATIONS.SHAKE_DURATION}ms`;
      setTimeout(() => {
        firstErrorField.style.animation = '';
        firstErrorField.focus();
      }, CONFIG.ANIMATIONS.SHAKE_DURATION);
    }
  }
  
  collectFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Add form type
    data.formType = this.formType;
    
    // Format phone number
    if (data[CONFIG.FIELD_NAMES.OFFICER_PHONE]) {
      data[CONFIG.FIELD_NAMES.OFFICER_PHONE] = formatPhone(data[CONFIG.FIELD_NAMES.OFFICER_PHONE]);
    }
    
    return data;
  }
  
  async submitForm(formData) {
    // Save officer info automatically
    const officerData = {
      rName: formData.rName,
      badge: formData.badge,
      requestingPhone: formData.requestingPhone,
      requestingEmail: formData.requestingEmail
    };
    
    if (saveOfficerInfo(officerData)) {
      // Subtle feedback that info was saved
      console.log('Officer info saved for next time');
    }
    
    // This will be overridden by specific form handlers
    console.log('Form data ready for submission:', formData);
    showToast('Form submission not implemented yet', 'info');
  }
  
  handleReset(e) {
    if (!confirm('Are you sure you want to clear the form? This will also clear any saved draft.')) {
      e.preventDefault();
      return;
    }
    
    // Clear draft
    clearDraft(this.formType);
    
    // Clear validation states
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
    });
    
    // Reset progress
    setTimeout(() => this.updateProgress(), 100);
    
    showToast('Form cleared', 'info');
  }
  
  saveDraftAuto() {
    if (!CONFIG.FEATURES.SAVE_DRAFTS) return;
    
    const formData = this.collectFormData();
    const saved = saveDraft(this.formType, formData);
    
    if (saved) {
      // Show subtle indicator
      const indicator = document.getElementById('draft-indicator');
      if (indicator) {
        indicator.textContent = 'Draft saved';
        indicator.style.opacity = '1';
        setTimeout(() => {
          indicator.style.opacity = '0';
        }, 2000);
      }
    }
  }
  
  loadOfficerInfoIfExists() {
    const officerInfo = loadOfficerInfo();
    if (!officerInfo) return;
    
    // Show first-time notice if needed
    if (isFirstTimeUse()) {
      showToast(CONFIG.MESSAGES.OFFICER_STORAGE_NOTICE, 'info', 5000);
      acknowledgeStorage();
    }
    
    // Only populate officer fields
    const officerFields = ['rName', 'badge', 'requestingPhone', 'requestingEmail'];
    
    officerFields.forEach(fieldName => {
      if (officerInfo[fieldName]) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (field) {
          field.value = officerInfo[fieldName];
          // Trigger validation to show green border
          this.validateSingleField(field);
        }
      }
    });
    
    // Use existing toast system
    showToast(CONFIG.MESSAGES.OFFICER_INFO_LOADED, 'success', 2000);
  }
  
  loadDraftIfExists() {
    if (!CONFIG.FEATURES.SAVE_DRAFTS) return;
    
    const draft = loadDraft(this.formType);
    if (!draft) return;
    
    const age = getDraftAge(this.formType);
    const message = `Found a draft from ${age}. Load it?`;
    
    if (confirm(message)) {
      this.populateForm(draft);
      showToast(CONFIG.MESSAGES.DRAFT_LOADED, 'success');
      
      // Update progress after loading
      setTimeout(() => this.updateProgress(), 100);
    }
  }
  
  populateForm(data) {
    Object.entries(data).forEach(([key, value]) => {
      const field = this.form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'radio') {
          const radio = this.form.querySelector(`[name="${key}"][value="${value}"]`);
          if (radio) radio.checked = true;
        } else {
          field.value = value;
        }
        
        // Trigger change event for conditional fields
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  }
  
  updateProgress() {
    if (!CONFIG.FEATURES.PROGRESS_BAR) return;
    
    const completion = calculateFormCompletion(this.form);
    const progressBar = document.getElementById('form-progress');
    const progressLabel = document.getElementById('progress-percentage');
    
    if (progressBar) {
      progressBar.style.width = `${completion.percentage}%`;
      
      // Update color based on percentage
      let color;
      if (completion.percentage <= 33) {
        color = CONFIG.PROGRESS_COLORS.LOW;
      } else if (completion.percentage <= 66) {
        color = CONFIG.PROGRESS_COLORS.MEDIUM;
      } else {
        color = CONFIG.PROGRESS_COLORS.HIGH;
      }
      
      progressBar.style.background = color;
    }
    
    if (progressLabel) {
      progressLabel.textContent = `${completion.percentage}%`;
    }
  }
}

/**
 * Upload Form Handler
 * Specific handling for upload form
 */
export class UploadFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.locations = [];
    this.setupUploadSpecificListeners();
  }
  
  setupUploadSpecificListeners() {
    // Media type change
    const mediaTypeField = this.form.querySelector('#mediaType');
    if (mediaTypeField) {
      mediaTypeField.addEventListener('change', (e) => {
        const otherGroup = document.getElementById('mediaTypeOtherGroup');
        const otherField = document.getElementById('mediaTypeOther');
        const showOther = e.target.value === 'Other';
        
        toggleElement(otherGroup, showOther);
        if (showOther) {
          otherField.setAttribute('required', 'required');
        } else {
          otherField.removeAttribute('required');
          otherField.value = '';
          this.showFieldValidation(otherField, null);
        }
      });
    }
    
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
  
  addLocation() {
    const container = document.getElementById('locations-container');
    const index = container.children.length;
    
    const locationGroup = createElement('div', {
      className: 'location-group mt-3',
      dataset: { locationIndex: index }
    });
    
    // Create location fields
    const businessNameGroup = this.createLocationField('businessName', index, 'Business Name', false);
    const addressGroup = this.createLocationField('locationAddress', index, 'Location Address', true);
    const cityGroup = this.createCityField(index);
    
    // Remove button
    const removeBtn = createElement('button', {
      type: 'button',
      className: 'btn btn-sm btn-danger mt-2',
      onclick: () => this.removeLocation(locationGroup)
    }, ' Remove Location');
    
    locationGroup.appendChild(businessNameGroup);
    locationGroup.appendChild(addressGroup);
    locationGroup.appendChild(cityGroup);
    locationGroup.appendChild(removeBtn);
    
    container.appendChild(locationGroup);
    
    // Animate in
    locationGroup.style.opacity = '0';
    requestAnimationFrame(() => {
      locationGroup.style.transition = 'opacity 0.3s';
      locationGroup.style.opacity = '1';
    });
  }
  
  createLocationField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;
    
    const group = createElement('div', { className: 'form-group' });
    
    const labelEl = createElement('label', {
      htmlFor: fieldId,
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
  
  createCityField(index) {
    const fieldName = index === 0 ? 'city' : `city_${index}`;
    const fieldId = index === 0 ? 'city' : `city_${index}`;
    const otherFieldName = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherFieldId = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherGroupId = index === 0 ? 'cityOtherGroup' : `cityOtherGroup_${index}`;
    
    const cityGroup = createElement('div', { className: 'form-group' });
    
    const label = createElement('label', {
      htmlFor: fieldId,
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
  
  removeLocation(locationGroup) {
    locationGroup.style.transition = 'opacity 0.3s';
    locationGroup.style.opacity = '0';
    
    setTimeout(() => {
      locationGroup.remove();
      this.updateProgress();
    }, 300);
  }
  
  setupLocationVideoListeners(index) {
    // City change handler
    const cityId = index === 0 ? 'city' : `city_${index}`;
    const cityField = this.form.querySelector(`#${cityId}`);
    if (cityField) {
      cityField.addEventListener('change', (e) => {
        const otherGroupId = index === 0 ? 'cityOtherGroup' : `cityOtherGroup_${index}`;
        const otherFieldId = index === 0 ? 'cityOther' : `cityOther_${index}`;
        const otherGroup = document.getElementById(otherGroupId);
        const otherField = document.getElementById(otherFieldId);
        const showOther = e.target.value === 'Other';
        
        toggleElement(otherGroup, showOther);
        if (showOther) {
          otherField.setAttribute('required', 'required');
        } else {
          otherField.removeAttribute('required');
          otherField.value = '';
          this.showFieldValidation(otherField, null);
        }
      });
    }
    
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
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--border-color); opacity: 0;'
    });
    
    // Create location section
    const locationSection = createElement('section', { className: 'form-section' });
    locationSection.innerHTML = `
      <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Location Information</h2>
    `;
    
    // Location fields
    const businessNameGroup = this.createLocationField('businessName', index, 'Business Name', false);
    const addressGroup = this.createLocationField('locationAddress', index, 'Location Address', true);
    const cityGroup = this.createCityField(index);
    
    locationSection.appendChild(businessNameGroup);
    locationSection.appendChild(addressGroup);
    locationSection.appendChild(cityGroup);
    
    // Create video timeframe section
    const videoSection = createElement('section', { className: 'form-section' });
    videoSection.innerHTML = `
      <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Video Timeframe</h2>
    `;
    
    // Video timeframe fields
    const startTimeGroup = this.createTimeField('videoStartTime', index, 'Video Start Time', true);
    const endTimeGroup = this.createTimeField('videoEndTime', index, 'Video End Time', true);
    const timeSyncGroup = this.createTimeSyncField(index);
    const dvrDateGroup = this.createDvrDateField(index);
    
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
  
  createTimeField(baseName, index, label, required) {
    const fieldName = index === 0 ? baseName : `${baseName}_${index}`;
    const fieldId = index === 0 ? baseName : `${baseName}_${index}`;
    
    const group = createElement('div', { className: 'form-group' });
    
    const labelEl = createElement('label', {
      htmlFor: fieldId,
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
  
  createTimeSyncField(index) {
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
  
  createDvrDateField(index) {
    const fieldName = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const fieldId = index === 0 ? 'dvrEarliestDate' : `dvrEarliestDate_${index}`;
    const retentionId = index === 0 ? 'retentionCalculation' : `retentionCalculation_${index}`;
    
    const group = createElement('div', { className: 'form-group' });
    
    const label = createElement('label', {
      htmlFor: fieldId,
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
    
    // Add change listener for retention calculation
    input.addEventListener('change', (e) => {
      if (e.target.value) {
        const retention = calculateRetentionDays(e.target.value);
        retentionDiv.textContent = retention.message;
        retentionDiv.className = 'text-info mt-2';
      } else {
        retentionDiv.textContent = '';
      }
    });
    
    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(small);
    group.appendChild(retentionDiv);
    
    return group;
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
    
    // Set request area
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = CONFIG.FORM_TYPES.UPLOAD;
    
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
    // For now, just log the data
    console.log('Upload form ready for submission:', formData);
    
    // In production, this would:
    // 1. Generate PDF using pdf-generator
    // 2. Generate JSON using json-generator
    // 3. Submit via api-client
    
    showToast('Upload form validated successfully! (Submission not implemented)', 'success');
    
    // Clear draft on successful submission
    clearDraft(this.formType);
  }
}