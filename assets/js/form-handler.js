/**
 * Form Handler
 * Core form lifecycle management
 */

import { CONFIG } from './config.js';
import { validateField, validateDateRange, validateConditionalFields, validateLocations, calculateFormCompletion, formatPhone } from './validators.js';
import { saveDraft, loadDraft, clearDraft, hasDraft, getDraftAge, saveSessionStart } from './storage.js';
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
    
    // City change
    const cityField = this.form.querySelector('#city');
    if (cityField) {
      cityField.addEventListener('change', (e) => {
        const otherGroup = document.getElementById('cityOtherGroup');
        const otherField = document.getElementById('cityOther');
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
    const timeSyncRadios = this.form.querySelectorAll('[name="isTimeDateCorrect"]');
    timeSyncRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const warningEl = document.getElementById('timeSyncWarning');
        const offsetGroup = document.getElementById('timeOffsetGroup');
        const offsetField = document.getElementById('timeOffset');
        
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
    
    // DVR retention calculation
    const dvrDateField = this.form.querySelector('#dvrEarliestDate');
    if (dvrDateField) {
      dvrDateField.addEventListener('change', (e) => {
        const retentionEl = document.getElementById('retentionCalculation');
        if (e.target.value) {
          const retention = calculateRetentionDays(e.target.value);
          retentionEl.textContent = retention.message;
          retentionEl.className = retention.isUrgent ? 'text-danger mt-2' : 'text-info mt-2';
        } else {
          retentionEl.textContent = '';
        }
      });
    }
    
    // Add location button
    const addLocationBtn = document.getElementById('addLocationBtn');
    if (addLocationBtn) {
      addLocationBtn.addEventListener('click', () => this.addLocation());
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
    const fieldId = `${baseName}_${index}`;
    
    return createElement('div', { className: 'form-group' }, [
      createElement('label', {
        htmlFor: fieldId,
        className: 'form-label'
      }, label + (required ? ' *' : '')),
      createElement('input', {
        type: 'text',
        className: 'form-control',
        id: fieldId,
        name: fieldName,
        required: required ? 'required' : null
      }),
      createElement('div', { className: 'invalid-feedback' })
    ]);
  }
  
  createCityField(index) {
    const fieldName = index === 0 ? 'city' : `city_${index}`;
    const fieldId = `city_${index}`;
    const otherFieldName = index === 0 ? 'cityOther' : `cityOther_${index}`;
    const otherFieldId = `cityOther_${index}`;
    
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
    
    const cityGroup = createElement('div', { className: 'form-group' }, [
      createElement('label', {
        htmlFor: fieldId,
        className: 'form-label'
      }, 'City *'),
      citySelect,
      createElement('div', { className: 'invalid-feedback' })
    ]);
    
    // Other city field
    const otherGroup = createElement('div', {
      className: 'form-group d-none',
      id: `cityOtherGroup_${index}`
    }, [
      createElement('label', {
        htmlFor: otherFieldId,
        className: 'form-label'
      }, 'Specify City *'),
      createElement('input', {
        type: 'text',
        className: 'form-control',
        id: otherFieldId,
        name: otherFieldName,
        placeholder: 'Enter city name'
      }),
      createElement('small', { className: 'form-text' }, 'Please enter the city name'),
      createElement('div', { className: 'invalid-feedback' })
    ]);
    
    // City change handler
    citySelect.addEventListener('change', (e) => {
      const showOther = e.target.value === 'Other';
      toggleElement(otherGroup, showOther);
      const otherField = otherGroup.querySelector('input');
      if (showOther) {
        otherField.setAttribute('required', 'required');
      } else {
        otherField.removeAttribute('required');
        otherField.value = '';
      }
    });
    
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
  
  collectFormData() {
    const data = super.collectFormData();
    
    // Collect multiple locations
    const locationGroups = this.form.querySelectorAll('.location-group');
    data.locations = [];
    
    locationGroups.forEach((group, index) => {
      const location = {
        businessName: group.querySelector(`[name^="businessName"]`).value,
        locationAddress: group.querySelector(`[name^="locationAddress"]`).value,
        city: group.querySelector(`[name^="city"]`).value
      };
      
      if (location.city === 'Other') {
        location.cityOther = group.querySelector(`[name^="cityOther"]`).value;
      }
      
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
    
    // Additional validation for date range
    const startTime = this.form.querySelector('#videoStartTime').value;
    const endTime = this.form.querySelector('#videoEndTime').value;
    
    const dateError = validateDateRange(startTime, endTime);
    if (dateError) {
      result.errors.videoEndTime = dateError;
      result.isValid = false;
      
      const endField = this.form.querySelector('#videoEndTime');
      this.showFieldValidation(endField, dateError);
    }
    
    // Validate locations
    const locationGroups = this.form.querySelectorAll('.location-group');
    const locations = [];
    
    locationGroups.forEach(group => {
      locations.push({
        locationAddress: group.querySelector('[name^="locationAddress"]').value,
        city: group.querySelector('[name^="city"]').value,
        cityOther: group.querySelector('[name^="cityOther"]')?.value
      });
    });
    
    const locationErrors = validateLocations(locations);
    if (Object.keys(locationErrors).length > 0) {
      result.isValid = false;
      
      // Show location errors
      Object.entries(locationErrors).forEach(([index, errors]) => {
        const group = locationGroups[index];
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