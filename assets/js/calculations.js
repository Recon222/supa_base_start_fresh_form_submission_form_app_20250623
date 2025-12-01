/**
 * Business Logic and Calculations
 * Pure functions for form-specific calculations
 */

/**
 * Calculate DVR retention days
 * @param {string} earliestDate - Earliest date available on DVR
 * @returns {Object} Retention info { days: number, message: string, isUrgent: boolean }
 */
export function calculateRetentionDays(earliestDate) {
  if (!earliestDate) {
    return {
      days: null,
      message: '',
      isUrgent: false
    };
  }
  
  const earliest = new Date(earliestDate);
  const today = new Date();
  
  // Reset time portions for accurate day calculation
  earliest.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = today - earliest;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Determine urgency
  let message = '';
  let isUrgent = false;

  if (diffDays < 0) {
    message = 'Invalid date: Earliest date cannot be in the future';
    isUrgent = false;
  } else if (diffDays === 0) {
    message = 'DVR retention: Less than 1 day - URGENT';
    isUrgent = true;
  } else if (diffDays === 1) {
    message = 'DVR retention: 1 day - URGENT';
    isUrgent = true;
  } else if (diffDays <= 4) {
    message = `DVR retention: ${diffDays} days - URGENT`;
    isUrgent = true;
  } else {
    message = `DVR retention: ${diffDays} days`;
    isUrgent = false;
  }

  return {
    days: diffDays >= 0 ? diffDays : null,
    message,
    isUrgent
  };
}

/**
 * Calculate video duration
 * @param {string} startTime - Video start time
 * @param {string} endTime - Video end time
 * @returns {Object} Duration info { hours: number, minutes: number, formatted: string }
 */
export function calculateVideoDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    return {
      hours: 0,
      minutes: 0,
      formatted: ''
    };
  }
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Calculate difference in milliseconds
  const diffMs = end - start;
  
  if (diffMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      formatted: 'Invalid duration'
    };
  }
  
  // Convert to hours and minutes
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // Format the duration
  let formatted = '';
  if (hours > 0) {
    formatted = `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) {
      formatted += ` ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  } else {
    formatted = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return {
    hours,
    minutes,
    totalMinutes,
    formatted
  };
}

/**
 * Parse time offset string into structured format
 * @param {string} offsetString - Time offset string (e.g., "DVR is 1hr 5min 30sec AHEAD")
 * @returns {Object} Parsed offset { hours: number, minutes: number, seconds: number, direction: string, formatted: string }
 */
export function parseTimeOffset(offsetString) {
  if (!offsetString) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
      direction: '',
      formatted: ''
    };
  }
  
  const str = offsetString.toLowerCase();
  
  // Extract numbers for hours, minutes, seconds
  const hourMatch = str.match(/(\d+)\s*h(?:ou)?r?s?/);
  const minMatch = str.match(/(\d+)\s*m(?:in)?(?:ute)?s?/);
  const secMatch = str.match(/(\d+)\s*s(?:ec)?(?:ond)?s?/);
  
  const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
  const minutes = minMatch ? parseInt(minMatch[1]) : 0;
  const seconds = secMatch ? parseInt(secMatch[1]) : 0;
  
  // Determine direction
  let direction = 'AHEAD'; // Default
  if (str.includes('behind') || str.includes('slow')) {
    direction = 'BEHIND';
  } else if (str.includes('ahead') || str.includes('fast')) {
    direction = 'AHEAD';
  }
  
  // Format the offset
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
  
  const formatted = parts.length > 0 
    ? `DVR is ${parts.join(' ')} ${direction} of real time`
    : offsetString;
  
  return {
    hours,
    minutes,
    seconds,
    direction,
    formatted,
    totalMinutes: (hours * 60) + minutes + (seconds / 60)
  };
}

/**
 * Calculate adjusted time based on offset
 * @param {string} dvrTime - Time shown on DVR
 * @param {Object} offset - Parsed time offset
 * @returns {Date} Actual time
 */
export function calculateActualTime(dvrTime, offset) {
  if (!dvrTime || !offset) return null;
  
  const dvr = new Date(dvrTime);
  const offsetMs = ((offset.hours * 60) + offset.minutes) * 60 * 1000 + (offset.seconds * 1000);
  
  // If DVR is ahead, subtract offset; if behind, add offset
  const actualTime = new Date(dvr.getTime() + (offset.direction === 'BEHIND' ? offsetMs : -offsetMs));
  
  return actualTime;
}

/**
 * Generate summary of form data for third-party fields
 * @param {Object} formData - Form data
 * @returns {Object} Summary fields for third-party integration
 */
export function generateFieldSummaries(formData) {
  const summaries = {};
  
  // File Details - combine evidence and media info
  const fileDetailsParts = [];
  if (formData.evidenceBag) {
    fileDetailsParts.push(`Evidence Bag: ${formData.evidenceBag}`);
  }
  if (formData.mediaType) {
    const mediaType = formData.mediaType === 'Other' ? formData.mediaTypeOther : formData.mediaType;
    fileDetailsParts.push(`Media Type: ${mediaType}`);
  }
  
  // Include first location info for file details
  if (formData.locations && formData.locations.length > 0) {
    const firstLocation = formData.locations[0];
    if (firstLocation.businessName) {
      fileDetailsParts.push(`Location: ${firstLocation.businessName}`);
    } else if (firstLocation.locationAddress) {
      fileDetailsParts.push(`Location: ${firstLocation.locationAddress}`);
    }
  }
  
  summaries.fileDetails = fileDetailsParts.join(' | ') || 'Video upload request';
  
  // Request Details - comprehensive summary
  const detailsParts = [];
  
  // Basic info
  detailsParts.push(`Upload Request - ${formData.occNumber || 'No occurrence number'}`);
  
  // Process each location
  if (formData.locations) {
    formData.locations.forEach((location, index) => {
      if (formData.locations.length > 1) {
        detailsParts.push(`\nLocation ${index + 1}:`);
      }
      
      // Location info
      const locParts = [];
      if (location.businessName) {
        locParts.push(location.businessName);
      }
      if (location.locationAddress) {
        locParts.push(location.locationAddress);
      }
      const city = location.city === 'Other' ? location.cityOther : location.city;
      if (city) {
        locParts.push(city);
      }
      if (locParts.length > 0) {
        detailsParts.push(`Address: ${locParts.join(', ')}`);
      }
      
      // Time info
      if (location.videoStartTime && location.videoEndTime) {
        const duration = calculateVideoDuration(location.videoStartTime, location.videoEndTime);
        detailsParts.push(`Video Period: ${formatDateTimeForSummary(location.videoStartTime)} to ${formatDateTimeForSummary(location.videoEndTime)} (${duration.formatted})`);
      }
      
      // Time sync info
      if (location.isTimeDateCorrect === 'No' && location.timeOffset) {
        const offset = parseTimeOffset(location.timeOffset);
        detailsParts.push(`Time Offset: ${offset.formatted}`);
      }
      
      // Retention info
      if (location.dvrEarliestDate) {
        const retention = calculateRetentionDays(location.dvrEarliestDate);
        detailsParts.push(retention.message);
      }
    });
  }
  
  // Additional info
  if (formData.otherInfo) {
    detailsParts.push(`\nAdditional Info: ${formData.otherInfo}`);
  }
  
  // Multiple locations summary
  if (formData.locations && formData.locations.length > 1) {
    detailsParts.push(`\nTotal Locations: ${formData.locations.length} locations on single media`);
  }
  
  summaries.rfsDetails = detailsParts.join('\n');
  
  return summaries;
}

/**
 * Format datetime for summary display
 * @param {string} datetime - Datetime string
 * @returns {string} Formatted datetime
 */
function formatDateTimeForSummary(datetime) {
  if (!datetime) return '';
  
  const d = new Date(datetime);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return d.toLocaleDateString('en-US', options);
}