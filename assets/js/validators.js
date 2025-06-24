/**
 * Validation Rules and Functions
 * Pure validation logic - no DOM manipulation
 */

import { CONFIG } from './config.js';

/**
 * Validate a single field value
 * @param {string} value - The value to validate
 * @param {string} fieldName - The field name for specific rules
 * @param {boolean} required - Whether the field is required
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, fieldName, required = false) {
  // Trim the value
  const trimmedValue = value?.trim() || '';
  
  // Check required
  if (required && !trimmedValue) {
    return CONFIG.MESSAGES.REQUIRED_FIELD;
  }
  
  // If not required and empty, it's valid
  if (!trimmedValue) {
    return null;
  }
  
  // Field-specific validation
  switch (fieldName) {
    case CONFIG.FIELD_NAMES.OFFICER_EMAIL:
      return validateEmail(trimmedValue);
      
    case CONFIG.FIELD_NAMES.OFFICER_PHONE:
      return validatePhone(trimmedValue);
      
    case CONFIG.FIELD_NAMES.OCCURRENCE_NUMBER:
      return validateOccurrenceNumber(trimmedValue);
      
    case CONFIG.FIELD_NAMES.TIME_OFFSET:
      return validateTimeOffset(trimmedValue);
      
    case CONFIG.FIELD_NAMES.LOCKER_NUMBER:
      return validateLockerNumber(trimmedValue);
      
    default:
      return null;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {string|null} Error message or null
 */
function validateEmail(email) {
  if (!CONFIG.VALIDATION_PATTERNS.EMAIL.test(email)) {
    return CONFIG.MESSAGES.INVALID_EMAIL;
  }
  return null;
}

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone to validate
 * @returns {string|null} Error message or null
 */
function validatePhone(phone) {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (!CONFIG.VALIDATION_PATTERNS.PHONE.test(digitsOnly)) {
    return CONFIG.MESSAGES.INVALID_PHONE;
  }
  return null;
}

/**
 * Validate occurrence number
 * @param {string} occNumber - Occurrence number to validate
 * @returns {string|null} Error message or null
 */
function validateOccurrenceNumber(occNumber) {
  if (!CONFIG.VALIDATION_PATTERNS.CASE_NUMBER.test(occNumber)) {
    return CONFIG.MESSAGES.INVALID_OCCURRENCE;
  }
  return null;
}

/**
 * Validate time offset (must contain numbers)
 * @param {string} timeOffset - Time offset to validate
 * @returns {string|null} Error message or null
 */
function validateTimeOffset(timeOffset) {
  if (!CONFIG.VALIDATION_PATTERNS.TIME_OFFSET.test(timeOffset)) {
    return CONFIG.MESSAGES.TIME_OFFSET_REQUIRED;
  }
  return null;
}

/**
 * Validate locker number (1-15, optional field)
 * @param {string} lockerNumber - Locker number to validate
 * @returns {string|null} Error message or null
 */
function validateLockerNumber(lockerNumber) {
  // If empty, it's valid (optional field)
  if (!lockerNumber || lockerNumber.trim() === '') {
    return null;
  }
  
  const num = parseInt(lockerNumber, 10);
  
  if (isNaN(num)) {
    return 'Locker number must be a number';
  }
  
  if (num < 1 || num > 15) {
    return 'Locker number must be between 1 and 15';
  }
  
  return null;
}

/**
 * Validate date/time ranges
 * @param {string} startTime - Start time
 * @param {string} endTime - End time
 * @returns {string|null} Error message or null
 */
export function validateDateRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return null; // Let required validation handle this
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (start >= end) {
    return 'End time must be after start time';
  }
  
  // Check if dates are reasonable (not in future)
  const now = new Date();
  if (start > now || end > now) {
    return 'Times cannot be in the future';
  }
  
  return null;
}

/**
 * Validate conditional fields
 * @param {Object} formData - All form data
 * @returns {Object} Validation results by field
 */
export function validateConditionalFields(formData) {
  const errors = {};
  
  // Check media type "Other"
  if (formData.mediaType === 'Other' && !formData.mediaTypeOther?.trim()) {
    errors.mediaTypeOther = CONFIG.MESSAGES.MEDIA_OTHER_REQUIRED;
  }
  
  // Check city "Other"
  if (formData.city === 'Other' && !formData.cityOther?.trim()) {
    errors.cityOther = CONFIG.MESSAGES.CITY_OTHER_REQUIRED;
  }
  
  // Check time offset if time is not correct
  if (formData.isTimeDateCorrect === 'No' && !formData.timeOffset?.trim()) {
    errors.timeOffset = CONFIG.MESSAGES.TIME_OFFSET_REQUIRED;
  }
  
  return errors;
}

/**
 * Validate multiple locations
 * @param {Array} locations - Array of location objects
 * @returns {Object} Validation results by location index and field
 */
export function validateLocations(locations) {
  const errors = {};
  
  locations.forEach((location, index) => {
    // Address is required
    if (!location.locationAddress?.trim()) {
      if (!errors[index]) errors[index] = {};
      errors[index].locationAddress = CONFIG.MESSAGES.REQUIRED_FIELD;
    }
    
    // City is required
    if (!location.city?.trim()) {
      if (!errors[index]) errors[index] = {};
      errors[index].city = CONFIG.MESSAGES.REQUIRED_FIELD;
    }
    
    // If city is "Other", cityOther is required
    if (location.city === 'Other' && !location.cityOther?.trim()) {
      if (!errors[index]) errors[index] = {};
      errors[index].cityOther = CONFIG.MESSAGES.CITY_OTHER_REQUIRED;
    }
  });
  
  return errors;
}

/**
 * Check if all required fields in a form are filled
 * @param {HTMLFormElement} form - The form element
 * @returns {Object} { isComplete: boolean, percentage: number }
 */
export function calculateFormCompletion(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let filledCount = 0;
  
  requiredFields.forEach(field => {
    const value = field.value?.trim();
    
    // Special handling for radio buttons
    if (field.type === 'radio') {
      const radioGroup = form.querySelectorAll(`[name="${field.name}"]`);
      const isChecked = Array.from(radioGroup).some(radio => radio.checked);
      if (isChecked) {
        filledCount++;
      }
    } else if (value) {
      filledCount++;
    }
  });
  
  const percentage = requiredFields.length > 0 
    ? Math.round((filledCount / requiredFields.length) * 100)
    : 0;
  
  return {
    isComplete: filledCount === requiredFields.length,
    percentage
  };
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phone;
}

/**
 * Clean phone number for submission
 * @param {string} phone - Formatted phone number
 * @returns {string} Digits only
 */
export function cleanPhone(phone) {
  return phone.replace(/\D/g, '');
}