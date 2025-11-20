/**
 * Form Handler Base Class
 * Core form lifecycle management for all form handlers
 */

import { CONFIG } from '../config.js';
import { validateField, validateConditionalFields, calculateFormCompletion, formatPhone } from '../validators.js';
import { saveDraft, loadDraft, clearDraft, getDraftAge, saveSessionStart } from '../storage.js';
import { saveOfficerInfo, loadOfficerInfo, isFirstTimeUse, acknowledgeStorage, clearOfficerInfo } from '../officer-storage.js';
import { debounce, scrollToElement, showToast } from '../utils.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { showConfirmModal } from '../notifications.js';
import { submitForm } from '../api-client.js';

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

  /**
   * Save officer info from form data
   * Extracted to base class to avoid duplication in subclasses
   */
  saveOfficerInfoFromFormData(formData) {
    const officerData = {
      rName: formData.rName,
      badge: formData.badge,
      requestingPhone: formData.requestingPhone,
      requestingEmail: formData.requestingEmail
    };

    if (saveOfficerInfo(officerData)) {
      console.log('Investigator info saved for next time');
    }
  }

  async submitForm(formData) {
    // Save officer info automatically
    this.saveOfficerInfoFromFormData(formData);

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
