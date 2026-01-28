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

    // Convert empty strings and placeholder values to null
    cleaned[key] = (value === '' || value === '_placeholder_') ? null : value;
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
    // Process each location
    if (formData.locations) {
      calculations.locations = formData.locations.map((location, index) => {
        const locCalc = {
          index: index + 1
        };
        
        // DVR retention calculation
        if (location.dvrEarliestDate) {
          const retention = calculateRetentionDays(location.dvrEarliestDate);
          locCalc.retentionDays = retention.days;
          locCalc.retentionStatus = retention.message;
        }
        
        // Video duration
        if (location.videoStartTime && location.videoEndTime) {
          const duration = calculateVideoDuration(location.videoStartTime, location.videoEndTime);
          locCalc.videoDuration = {
            totalMinutes: duration.totalMinutes,
            formatted: duration.formatted
          };
        }
        
        // Time offset
        if (location.isTimeDateCorrect === 'No' && location.timeOffset) {
          const offset = parseTimeOffset(location.timeOffset);
          locCalc.timeOffset = {
            hours: offset.hours,
            minutes: offset.minutes,
            seconds: offset.seconds,
            direction: offset.direction,
            formatted: offset.formatted
          };
        }
        
        return locCalc;
      });
      
      calculations.locationCount = formData.locations.length;
    }
  }
  
  if (formType === 'analysis') {
    // Count file names if provided
    if (formData.fileNames) {
      const fileCount = formData.fileNames.split('\n').filter(f => f.trim()).length;
      calculations.fileCount = fileCount;
      calculations.hasMultipleFiles = fileCount > 1;
    }
    
    // Days since recording
    if (formData.recordingDate) {
      const recordingDate = new Date(formData.recordingDate);
      const today = new Date();
      const daysSince = Math.floor((today - recordingDate) / (1000 * 60 * 60 * 24));
      calculations.daysSinceRecording = daysSince;
    }
    
    // Analysis type information
    calculations.analysisType = {
      service: formData.serviceRequiredDisplay || formData.serviceRequired,
      jobRequired: formData.jobRequired,
      isUrgent: formData.jobRequired === 'Urgent' || formData.serviceRequired === 'Make Playable'
    };
    
    // Evidence location summary
    calculations.evidenceLocation = {
      storageType: formData.videoLocationDisplay || formData.videoLocation,
      hasPhysicalLocation: !!formData.bagNumber || !!formData.lockerNumber,
      bagNumber: formData.bagNumber || null,
      lockerNumber: formData.lockerNumber || null
    };
  }
  
  return calculations;
}