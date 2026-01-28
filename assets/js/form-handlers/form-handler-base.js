/**
 * Form Handler Base Class
 * Core form lifecycle management for all form handlers
 */

import { CONFIG } from '../config.js';
import { validateField, validateConditionalFields, calculateFormCompletion, formatPhone } from '../validators.js';
import { saveDraft, loadDraft, clearDraft, getDraftAge, saveSessionStart } from '../storage.js';
import { saveOfficerInfo, loadOfficerInfo, isFirstTimeUse, acknowledgeStorage, clearOfficerInfo } from '../officer-storage.js';
import { debounce, scrollToElement, showToast, downloadBlob } from '../utils.js';
import { generatePDF } from '../pdf-generator.js';
import { generateJSON } from '../json-generator.js';
import { showConfirmModal } from '../notifications.js';
import { submitWithRetry } from '../api-client.js';

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

  /**
   * Initialize the form handler using Template Method Pattern
   *
   * Initialization sequence:
   * 1. Pre-field setup (no field dependencies)
   * 2. Build fields via hook (subclasses implement)
   * 3. Post-field setup (field-dependent configuration)
   * 4. Load saved state
   * 5. Update UI
   */
  init() {
    // ===== PHASE 1: Pre-field setup (no dependencies) =====
    saveSessionStart();

    // ===== PHASE 2: Build fields via Template Method hook =====
    // Subclasses override this to create dynamic fields
    this.buildFields();

    // ===== PHASE 3: Field-dependent setup =====
    // These methods require all fields to exist in the DOM
    this.configureAutofill();
    this.setupEventListeners();
    this.setupKeyboardProgressBarFix();

    // ===== PHASE 4: Load saved state =====
    this.loadOfficerInfoIfExists();
    this.loadDraftIfExists();

    // ===== PHASE 5: Update UI =====
    this.updateProgress();
  }

  /**
   * Hook for subclasses to build dynamic form fields
   * Called during initialization, BEFORE field-dependent setup runs
   *
   * Override this in subclasses that build fields dynamically via FormFieldBuilder.
   * The base implementation is empty for backward compatibility with forms
   * that use static HTML fields.
   *
   * @protected
   */
  buildFields() {
    // Default: no-op for backward compatibility
    // Subclasses override to build dynamic fields
  }

  /**
   * Hide progress bar when iOS keyboard is open
   * On iOS, position:fixed elements at bottom:0 jump around when the keyboard opens.
   * This hides the progress bar when any input is focused and shows it again on blur.
   */
  setupKeyboardProgressBarFix() {
    // Only apply on iOS where the keyboard causes fixed positioning issues
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    const progressContainer = document.querySelector('.progress-container');
    if (!progressContainer) return;

    // Hide progress bar only for inputs that trigger the iOS keyboard
    // Excludes: select (dropdowns), date/time pickers, checkbox, radio, hidden
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="number"], input:not([type]), textarea');
    inputs.forEach(el => {
      el.addEventListener('focus', () => {
        progressContainer.style.opacity = '0';
        progressContainer.style.pointerEvents = 'none';
      });
      el.addEventListener('blur', () => {
        progressContainer.style.opacity = '1';
        progressContainer.style.pointerEvents = '';
      });
    });
  }

  /**
   * Configure browser autofill behavior based on feature flag
   * When BROWSER_AUTOFILL is false, disables all browser autofill suggestions
   */
  configureAutofill() {
    if (CONFIG.FEATURES.BROWSER_AUTOFILL === false) {
      // Set autocomplete="off" on the form itself
      this.form.setAttribute('autocomplete', 'off');

      // Inject decoy fields BEFORE applying field-level prevention
      this.injectDecoyFields();

      // Apply aggressive autofill prevention to all input fields
      const fields = this.form.querySelectorAll('input, select, textarea');
      this.applyAutofillPrevention(fields);

      console.log('Browser autofill disabled via feature flag with aggressive prevention');
    } else {
      console.log('Browser autofill enabled via feature flag');
    }
  }

  /**
   * Inject invisible decoy fields to fool browser autofill heuristics
   * Browsers will fill these instead of real fields
   */
  injectDecoyFields() {
    // Create decoy container at the very start of the form
    const decoyContainer = document.createElement('div');
    decoyContainer.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    decoyContainer.setAttribute('aria-hidden', 'true');
    decoyContainer.setAttribute('tabindex', '-1');

    // Create decoy fields that browsers commonly target
    const decoyFields = [
      { name: 'username', type: 'text', autocomplete: 'username' },
      { name: 'email', type: 'email', autocomplete: 'email' },
      { name: 'organization', type: 'text', autocomplete: 'organization' },
      { name: 'address-line1', type: 'text', autocomplete: 'address-line1' },
      { name: 'address-level2', type: 'text', autocomplete: 'address-level2' },
      { name: 'tel', type: 'tel', autocomplete: 'tel' }
    ];

    decoyFields.forEach(field => {
      const input = document.createElement('input');
      input.type = field.type;
      input.name = `decoy_${field.name}`;
      input.setAttribute('autocomplete', field.autocomplete);
      input.tabIndex = -1;
      decoyContainer.appendChild(input);
    });

    // Insert at the very beginning of the form
    this.form.insertBefore(decoyContainer, this.form.firstChild);
  }

  /**
   * Apply autofill prevention to specific elements
   * Uses multiple aggressive techniques to block modern browser autofill
   * Can be called on dynamically created fields
   * @param {NodeList|HTMLElement|Array} elements - Elements to apply autofill prevention to
   */
  applyAutofillPrevention(elements) {
    if (CONFIG.FEATURES.BROWSER_AUTOFILL !== false) {
      return; // Only apply if autofill is disabled
    }

    // Convert single element to array
    if (elements instanceof HTMLElement) {
      elements = [elements];
    }

    elements.forEach(field => {
      // Skip hidden fields, submit buttons, and decoy fields
      if (field.type === 'hidden' ||
          field.type === 'submit' ||
          field.type === 'button' ||
          field.name?.startsWith('decoy_')) {
        return;
      }

      // TECHNIQUE 1: Use "one-time-code" which browsers respect more than "off"
      // This is the most effective single technique for modern Chrome/Edge
      field.setAttribute('autocomplete', 'one-time-code');

      // TECHNIQUE 2: Add random data attribute to confuse browser heuristics
      field.setAttribute('data-form-type', 'forensic-' + Math.random().toString(36).substr(2, 9));

      // TECHNIQUE 3: Obfuscate the name attribute (but preserve it for form submission)
      // Store original name in data attribute
      if (field.name && field.name !== 'decoy_field') {
        field.setAttribute('data-real-name', field.name);
        // Add random suffix to name to prevent pattern matching
        const randomSuffix = '_' + Math.random().toString(36).substr(2, 5);
        field.setAttribute('data-name-suffix', randomSuffix);
        // We'll restore the original name on form submit
      }

      // TECHNIQUE 4: Make readonly initially, remove on user interaction
      // This prevents autofill from triggering on page load
      // Skip date/datetime inputs as they need to be interactive for the picker to work
      if (field.type !== 'radio' &&
          field.type !== 'checkbox' &&
          field.type !== 'date' &&
          field.type !== 'datetime-local' &&
          field.type !== 'time' &&
          field.tagName !== 'SELECT' &&
          !field.hasAttribute('readonly')) {

        field.setAttribute('readonly', 'readonly');
        field.style.backgroundColor = field.style.backgroundColor || 'transparent';

        // Remove readonly on ANY user interaction
        const removeReadonly = () => {
          field.removeAttribute('readonly');
          // Remove all listeners after first interaction
          field.removeEventListener('focus', removeReadonly);
          field.removeEventListener('click', removeReadonly);
          field.removeEventListener('touchstart', removeReadonly);
        };

        field.addEventListener('focus', removeReadonly, { once: true });
        field.addEventListener('click', removeReadonly, { once: true });
        field.addEventListener('touchstart', removeReadonly, { once: true, passive: true });
      }

      // TECHNIQUE 5: For text/tel/email fields that commonly trigger autofill,
      // add additional protective measures
      if (field.type === 'text' || field.type === 'tel' || field.type === 'email') {
        // Prevent Chrome's aggressive address autofill
        field.setAttribute('autocompletetype', 'false');
        field.setAttribute('aria-autocomplete', 'none');

        // Block common autofill triggers
        if (field.name?.toLowerCase().includes('name')) {
          field.setAttribute('autocomplete', 'nope');
        }
        if (field.name?.toLowerCase().includes('phone') || field.type === 'tel') {
          field.setAttribute('autocomplete', 'tel-national');
        }
        if (field.name?.toLowerCase().includes('email') || field.type === 'email') {
          field.setAttribute('autocomplete', 'email-new');
        }
        if (field.name?.toLowerCase().includes('address')) {
          field.setAttribute('autocomplete', 'nope-address');
        }
        if (field.name?.toLowerCase().includes('city')) {
          field.setAttribute('autocomplete', 'nope-city');
        }
        if (field.name?.toLowerCase().includes('business')) {
          field.setAttribute('autocomplete', 'nope-organization');
        }
      }

      // Track user interaction timing - MUST come before input listener
      // This ensures legitimate user actions are marked before input event fires
      field.addEventListener('keydown', function() {
        field.setAttribute('data-user-edited', 'true');
        field.dataset.lastInteraction = Date.now();
      });

      field.addEventListener('paste', function() {
        field.setAttribute('data-user-edited', 'true');
        field.dataset.lastInteraction = Date.now();
      });

      // Track change events from dropdowns, date pickers, and other UI controls
      // This is critical for SELECT elements and date inputs
      field.addEventListener('change', function() {
        field.setAttribute('data-user-edited', 'true');
        field.dataset.lastInteraction = Date.now();
      });

      // TECHNIQUE 6: Add input event listener to detect and clear autofill
      // Only applies to text-like inputs, not SELECT or date inputs
      if (field.tagName !== 'SELECT' &&
          field.type !== 'date' &&
          field.type !== 'datetime-local' &&
          field.type !== 'time') {

        field.addEventListener('input', function(e) {
          // If value appears instantly (typical of autofill), clear it after a brief delay
          // This gives the browser time to autofill, then we remove it
          if (!field.hasAttribute('data-user-edited')) {
            setTimeout(() => {
              if (field.value && !field.hasAttribute('data-user-edited')) {
                // Check if this was likely autofill by checking if user didn't actually type
                const timeSinceInteraction = Date.now() - (field.dataset.lastInteraction || 0);
                if (timeSinceInteraction > 1000) {
                  field.value = '';
                }
              }
            }, 100);
          }
        });
      }
    });
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // Reset button
    this.form.addEventListener('reset', (e) => this.handleReset(e));

    // Field validation on blur only
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('blur', () => this.validateSingleField(field));
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

    // Get the Flatpickr alternate input if this field has one
    // When altInput: true, Flatpickr hides the original input and creates a visible altInput
    const flatpickrAltInput = field._flatpickr?.altInput;

    if (error) {
      field.classList.add('is-invalid');
      field.classList.remove('is-valid');

      // Also apply to Flatpickr's visible alternate input
      if (flatpickrAltInput) {
        flatpickrAltInput.classList.add('is-invalid');
        flatpickrAltInput.classList.remove('is-valid');
      }

      if (feedbackElement) {
        feedbackElement.textContent = error;
      }
    } else {
      field.classList.remove('is-invalid');

      // Also clear from Flatpickr's visible alternate input
      if (flatpickrAltInput) {
        flatpickrAltInput.classList.remove('is-invalid');
      }

      // Only show valid state for required fields with values
      if (field.hasAttribute('required') && field.value.trim()) {
        field.classList.add('is-valid');

        // Also apply valid state to Flatpickr's visible alternate input
        if (flatpickrAltInput) {
          flatpickrAltInput.classList.add('is-valid');
        }
      } else if (flatpickrAltInput) {
        // Remove valid class if conditions not met
        flatpickrAltInput.classList.remove('is-valid');
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

  /**
   * Get the PDF filename for this form type
   * Override in subclasses to provide form-specific filenames
   * @param {Object} formData - The collected form data
   * @returns {string} The PDF filename
   */
  getPdfFilename(formData) {
    return `FVU_Request_${formData.occNumber || 'NoOccNum'}.pdf`;
  }

  async submitForm(formData) {
    // Save officer info automatically
    this.saveOfficerInfoFromFormData(formData);

    try {
      // Generate PDF and JSON
      const [pdfBlob, jsonBlob] = await Promise.all([
        generatePDF(formData, this.formType),
        generateJSON(formData, this.formType)
      ]);

      console.log(`${this.formType} form ready for submission:`, formData);
      console.log('PDF generated:', pdfBlob.size, 'bytes');
      console.log('JSON generated:', jsonBlob.size, 'bytes');

      // Submit to API with retry logic (Supabase or PHP)
      const result = await submitWithRetry(formData, pdfBlob, jsonBlob);

      if (result.success) {
        // Download PDF locally with form-specific filename
        const pdfFilename = this.getPdfFilename(formData);
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

  /**
   * Get user-friendly error message based on error type
   * @param {Error} error - The error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error) {
    // Check for specific error types
    if (error.name === 'AbortError' || error.details?.code === 'ETIMEDOUT') {
      return CONFIG.MESSAGES.ERROR_TIMEOUT;
    }

    if (!navigator.onLine || error.details?.offline) {
      return CONFIG.MESSAGES.ERROR_OFFLINE;
    }

    if (error.status >= 500 && error.status < 600) {
      return CONFIG.MESSAGES.ERROR_SERVER;
    }

    if (error.status === 429) {
      return CONFIG.MESSAGES.ERROR_RATE_LIMITED;
    }

    if (error.message?.toLowerCase().includes('pdf')) {
      return CONFIG.MESSAGES.ERROR_PDF_GENERATION;
    }

    // Default error message with details if available
    if (error.message && error.message !== 'Network error') {
      return `${CONFIG.MESSAGES.ERROR_UNKNOWN} Details: ${error.message}`;
    }

    return CONFIG.MESSAGES.ERROR_UNKNOWN;
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

    // Clear validation states (including Flatpickr altInputs)
    this.form.querySelectorAll('.form-control').forEach(field => {
      field.classList.remove('is-valid', 'is-invalid');

      // Also clear from Flatpickr's visible alternate input if present
      const flatpickrAltInput = field._flatpickr?.altInput;
      if (flatpickrAltInput) {
        flatpickrAltInput.classList.remove('is-valid', 'is-invalid');
      }
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

      // Also clear from Flatpickr's visible alternate input if present
      const flatpickrAltInput = field._flatpickr?.altInput;
      if (flatpickrAltInput) {
        flatpickrAltInput.classList.remove('is-valid', 'is-invalid');
      }

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
