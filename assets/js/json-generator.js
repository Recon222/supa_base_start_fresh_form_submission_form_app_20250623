/**
 * JSON Generator
 * Creates structured JSON from form data
 */

import { calculateRetentionDays, calculateVideoDuration, parseTimeOffset } from './calculations.js';

/**
 * Generate JSON from form data
 * @param {Object} formData - Form data
 * @param {string} formType - Type of form
 * @returns {Blob} JSON blob
 */
export function generateJSON(formData, formType) {
  const jsonData = {
    metadata: {
      formType: formType,
      version: '1.0',
      generated: new Date().toISOString(),
      generator: 'FVU Request System'
    },
    formData: cleanFormData(formData),
    calculations: generateCalculations(formData, formType)
  };
  
  // Pretty print the JSON
  const jsonString = JSON.stringify(jsonData, null, 2);
  
  return new Blob([jsonString], { type: 'application/json' });
}

/**
 * Clean form data for JSON output
 * @param {Object} formData - Raw form data
 * @returns {Object} Cleaned data
 */
function cleanFormData(formData) {
  const cleaned = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    // Skip internal fields
    if (key.startsWith('_') || key === 'formType') {
      return;
    }
    
    // Convert empty strings to null
    cleaned[key] = value === '' ? null : value;
  });
  
  return cleaned;
}

/**
 * Generate calculations based on form type
 * @param {Object} formData - Form data
 * @param {string} formType - Form type
 * @returns {Object} Calculations
 */
function generateCalculations(formData, formType) {
  const calculations = {};
  
  if (formType === 'upload') {
    // DVR retention calculation
    if (formData.dvrEarliestDate) {
      const retention = calculateRetentionDays(formData.dvrEarliestDate);
      calculations.retentionDays = retention.days;
      calculations.retentionStatus = retention.message;
      calculations.isUrgent = retention.isUrgent;
    }
    
    // Video duration
    if (formData.videoStartTime && formData.videoEndTime) {
      const duration = calculateVideoDuration(formData.videoStartTime, formData.videoEndTime);
      calculations.videoDuration = {
        totalMinutes: duration.totalMinutes,
        formatted: duration.formatted
      };
    }
    
    // Time offset
    if (formData.isTimeDateCorrect === 'No' && formData.timeOffset) {
      const offset = parseTimeOffset(formData.timeOffset);
      calculations.timeOffset = {
        hours: offset.hours,
        minutes: offset.minutes,
        seconds: offset.seconds,
        direction: offset.direction,
        formatted: offset.formatted
      };
    }
    
    // Multiple locations count
    if (formData.locations && formData.locations.length > 1) {
      calculations.locationCount = formData.locations.length;
    }
  }
  
  return calculations;
}