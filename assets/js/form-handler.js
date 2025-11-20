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
import { generatePDF } from './pdf-generator.js';
import { generateJSON } from './json-generator.js';
import { showConfirmModal } from './notifications.js';
import { submitForm } from './api-client.js';
import { ConditionalFieldHandler } from './form-handlers/conditional-field-handler.js';
import { FormFieldBuilder } from './form-handlers/form-field-builder.js';

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
    this.hasStartedWorking = false; // Track if user has started typing
    
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
    
    // Track first input to switch button state immediately
    this.form.addEventListener('input', () => {
      if (!this.hasStartedWorking) {
        this.hasStartedWorking = true;
        this.updateDraftButton(); // Switch to auto-save active immediately
      }
    }, { once: true }); // Only run once
    
    // Auto-save draft on input
    this.form.addEventListener('input', debounce(() => {
      this.saveDraftAuto();
    }, 2000));
    
    // Progress bar updates
    this.form.addEventListener('change', () => this.updateProgress());
    
    // Clear officer info button
    const clearBtn = document.getElementById('clearOfficerInfo');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal({
          title: 'Clear Investigator Information',
          message: 'Clear saved investigator information from this browser?\n\nThis will remove your saved name, badge, phone, and email.',
          confirmText: 'Clear Information',
          cancelText: 'Cancel',
          type: 'warning'
        });
        
        if (confirmed) {
          if (clearOfficerInfo()) {
            // Clear the fields
            ['rName', 'badge', 'requestingPhone', 'requestingEmail'].forEach(name => {
              const field = this.form.querySelector(`[name="${name}"]`);
              if (field) {
                field.value = '';
                field.classList.remove('is-valid');
              }
            });
            
            // Also clear any draft for this form
            clearDraft(this.formType);
            this.updateDraftButton(); // Update button state
            
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
    
    // Use beautiful modal instead of ugly confirm()
    const formTypeDisplay = this.formType.charAt(0).toUpperCase() + this.formType.slice(1);
    const confirmed = await showConfirmModal({
      title: `Confirm ${formTypeDisplay} Submission`,
      message: `Are you sure you want to submit this ${formTypeDisplay} Request?\n\nThis action cannot be undone and the form will be cleared after submission.`,
      confirmText: 'Submit Request',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    if (!confirmed) {
      return; // User cancelled
    }
    
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
      console.log('Investigator info saved for next time');
    }
    
    // This will be overridden by specific form handlers
    // But provide a base implementation for safety
    try {
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);
      
      const result = await submitForm(formData, pdfBlob, jsonBlob);
      
      if (result.success) {
        showToast(`${CONFIG.MESSAGES.SUBMISSION_SUCCESS}. ID: ${result.submissionId || result.ticketNumber}`, 'success');
        this.clearFormAfterSubmission();
      } else {
        showToast(result.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
      }
    } catch (error) {
      console.error('Error during submission:', error);
      showToast(error.message || CONFIG.MESSAGES.SUBMISSION_ERROR, 'error');
      this.saveDraftAuto();
    }
  }
  
  async handleReset(e) {
    e.preventDefault(); // Always prevent default first
    
    const confirmed = await showConfirmModal({
      title: 'Clear Form',
      message: 'Are you sure you want to clear the form?\n\nThis will also clear any saved draft.',
      confirmText: 'Clear Form',
      cancelText: 'Cancel',
      type: 'warning'
    });
    
    if (!confirmed) {
      return;
    }
    
    // Clear draft
    clearDraft(this.formType);
    
    // Clear validation states
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');
    });
    
    // Reset the form
    this.form.reset();
    
    // Reset progress
    setTimeout(() => this.updateProgress(), 100);
    
    showToast('Form cleared', 'info');
  }
  
  /**
   * Clear form after successful submission
   * More thorough than reset - clears all states
   */
  clearFormAfterSubmission() {
    // Clear draft first
    clearDraft(this.formType);
    
    // Clear all form fields without triggering reset event
    this.form.querySelectorAll('.form-control').forEach(field => {
      if (field.type === 'checkbox' || field.type === 'radio') {
        field.checked = false;
      } else {
        field.value = '';
      }
      field.classList.remove('is-valid', 'is-invalid');
      
      // Clear any error messages
      const feedback = field.parentElement.querySelector('.invalid-feedback');
      if (feedback) {
        feedback.textContent = '';
      }
    });
    
    // Reset progress to 0
    const progressBar = document.getElementById('form-progress');
    const progressLabel = document.getElementById('progress-percentage');
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.background = CONFIG.PROGRESS_COLORS.LOW;
    }
    if (progressLabel) {
      progressLabel.textContent = '0%';
    }
    
    // Update draft button to show no draft exists
    this.hasStartedWorking = false;
    this.updateDraftButton();
    
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Show success message
    showToast('Form cleared', 'info');
  }
  
  saveDraftAuto() {
    if (!CONFIG.FEATURES.SAVE_DRAFTS) return;
    
    const formData = this.collectFormData();
    saveDraft(this.formType, formData);
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
    
    // Just update button state - NO MORE POPUPS!
    this.updateDraftButton();
  }
  
  updateDraftButton() {
    const draftBtn = document.getElementById('draft-button');
    if (!draftBtn) return;
    
    const draftText = draftBtn.querySelector('.draft-text');
    
    // If user has started working, always show auto-save active
    if (this.hasStartedWorking) {
      draftBtn.className = 'draft-button auto-save';
      draftText.textContent = 'Auto-save active';
      draftBtn.onclick = null;
      return;
    }
    
    // Otherwise, check for draft
    const draft = loadDraft(this.formType);
    
    if (draft) {
      const age = getDraftAge(this.formType);
      draftBtn.className = 'draft-button load-draft';
      draftText.textContent = `Load Draft (${age})`;
      
      // Wire up click to load draft
      draftBtn.onclick = () => this.loadDraftFromButton();
    } else {
      draftBtn.className = 'draft-button auto-save';
      draftText.textContent = 'Auto-save active';
      draftBtn.onclick = null;
    }
  }
  
  loadDraftFromButton() {
    const draft = loadDraft(this.formType);
    if (!draft) return;
    
    // Load the draft
    this.populateForm(draft);
    showToast(CONFIG.MESSAGES.DRAFT_LOADED, 'success');
    
    // Mark that user has started working
    this.hasStartedWorking = true;
    
    // Update button to auto-save state
    this.updateDraftButton();
    
    // Update progress after loading
    setTimeout(() => this.updateProgress(), 100);
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
  
  addLocation() {
    const container = document.getElementById('locations-container');
    const index = container.children.length;
    
    const locationGroup = createElement('div', {
      className: 'location-group mt-3',
      dataset: { locationIndex: index }
    });
    
    // Create location fields
    const businessNameGroup = FormFieldBuilder.createLocationField('businessName', index, 'Business Name', false);
    const addressGroup = FormFieldBuilder.createLocationField('locationAddress', index, 'Location Address', true);
    const cityGroup = FormFieldBuilder.createCityField(index);
    
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
  
  removeLocation(locationGroup) {
    locationGroup.style.transition = 'opacity 0.3s';
    locationGroup.style.opacity = '0';
    
    setTimeout(() => {
      locationGroup.remove();
      this.updateProgress();
    }, 300);
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
      style: 'background: var(--glass-bg); border-radius: var(--border-radius); padding: 2rem; margin-bottom: 2rem; border: 1px solid var(--border-color); opacity: 0;'
    });
    
    // Create location section
    const locationSection = createElement('section', { className: 'form-section' });
    locationSection.innerHTML = `
      <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Location Information</h2>
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
      <h2 style="color: var(--color-primary); margin-bottom: 1.5rem;">Video Timeframe</h2>
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
    // Save officer info automatically
    const officerData = {
      rName: formData.rName,
      badge: formData.badge,
      requestingPhone: formData.requestingPhone,
      requestingEmail: formData.requestingEmail
    };
    
    if (saveOfficerInfo(officerData)) {
      console.log('Investigator info saved for next time');
    }
    
    try {
      // Generate PDF and JSON
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);
      
      console.log('Upload form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');
      
      // Submit to API (Supabase or PHP)
      const result = await submitForm(formData, pdfBlob, jsonBlob);
      
      if (result.success) {
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

/**
 * Analysis Form Handler
 * Specific handling for analysis form
 */
export class AnalysisFormHandler extends FormHandler {
  constructor(formId) {
    super(formId);
    this.setupAnalysisSpecificListeners();
  }
  
  setupAnalysisSpecificListeners() {
    // Initialize conditional field handler
    const conditionalHandler = new ConditionalFieldHandler(this);

    // Setup all "Other" fields
    conditionalHandler.setupOtherField('offenceType', 'offenceTypeOtherGroup', 'offenceTypeOther');
    conditionalHandler.setupOtherField('videoLocation', 'videoLocationOtherGroup', 'videoLocationOther');
    conditionalHandler.setupOtherField('city', 'cityOtherGroup', 'cityOther');
    conditionalHandler.setupOtherField('serviceRequired', 'serviceRequiredOtherGroup', 'serviceRequiredOther');
    
    // Set occurrence date from recording date
    const recordingDateField = this.form.querySelector('#recordingDate');
    if (recordingDateField) {
      recordingDateField.addEventListener('change', (e) => {
        const occDateField = this.form.querySelector('#occDate');
        if (occDateField && e.target.value) {
          occDateField.value = e.target.value;
        }
      });
    }
  }
  
  collectFormData() {
    const data = super.collectFormData();
    
    // Set request area
    data[CONFIG.FIELD_NAMES.REQUEST_AREA] = CONFIG.FORM_TYPES.ANALYSIS;
    
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
    const details = [];
    if (data.videoLocation) {
      const location = data.videoLocation === 'Other' ? data.videoLocationOther : data.videoLocation;
      details.push(`Location: ${location}`);
    }
    if (data.videoSeizedFrom) details.push(`Seized from: ${data.videoSeizedFrom}`);
    if (data.fileNames) {
      const fileCount = data.fileNames.split('\n').filter(f => f.trim()).length;
      details.push(`${fileCount} file(s) listed`);
    }
    return details.join(' | ');
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
      console.log('Investigator info saved for next time');
    }
    
    try {
      // Generate PDF and JSON
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);
      
      console.log('Analysis form ready for submission:', formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');
      
      // Submit to API (Supabase or PHP)
      const result = await submitForm(formData, pdfBlob, jsonBlob);
      
      if (result.success) {
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

/**
 * Recovery Form Handler
 * Specific handling for recovery form
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
    // Save officer info automatically
    const officerData = {
      rName: formData.rName,
      badge: formData.badge,
      requestingPhone: formData.requestingPhone,
      requestingEmail: formData.requestingEmail
    };
    
    if (saveOfficerInfo(officerData)) {
      console.log('Investigator info saved for next time');
    }
    
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