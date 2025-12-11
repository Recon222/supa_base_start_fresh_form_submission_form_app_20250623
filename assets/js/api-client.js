/**
 * API Client
 * Handles form submission to third-party system or Supabase
 */

import { CONFIG } from './config.js';
import { submitToSupabase } from './supabase.js';

/**
 * Convert blob to base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} Base64 string
 */
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Submit form data with retry logic
 * @param {Object} formData - Form data object
 * @param {Blob} pdfBlob - Generated PDF file
 * @param {Blob} jsonBlob - Generated JSON file
 * @param {number} maxRetries - Maximum retry attempts (default: 3)
 * @returns {Promise<Object>} API response
 */
export async function submitWithRetry(formData, pdfBlob, jsonBlob, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await submitForm(formData, pdfBlob, jsonBlob);
    } catch (error) {
      // Don't retry client errors (4xx) - these are validation failures
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Submission attempt ${attempt} failed. Retrying in ${delay/1000}s...`);
      console.log('Error details:', error.message);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Submit form data to the API (internal function)
 * @param {Object} formData - Form data object
 * @param {Blob} pdfBlob - Generated PDF file
 * @param {Blob} jsonBlob - Generated JSON file
 * @returns {Promise<Object>} API response
 */
async function submitForm(formData, pdfBlob, jsonBlob) {
  // If Supabase is enabled, use Supabase submission
  if (CONFIG.USE_SUPABASE) {
    try {
      // Convert blobs to base64 for storage
      const pdfBase64 = await blobToBase64(pdfBlob);
      const jsonBase64 = await blobToBase64(jsonBlob);
      
      // Add file data to formData
      const submissionData = {
        ...formData,
        attachments: [
          {
            type: 'pdf',
            filename: `${formData.reqArea}_${Date.now()}.pdf`,
            data: pdfBase64,
            size: pdfBlob.size
          },
          {
            type: 'json',
            filename: `${formData.reqArea}_${Date.now()}.json`,
            data: jsonBase64,
            size: jsonBlob.size
          }
        ]
      };
      
      const result = await submitToSupabase(submissionData);
      
      return {
        success: true,
        message: 'Request submitted successfully',
        ticketNumber: result.data.id,
        submissionId: result.data.id
      };
    } catch (error) {
      console.error('Supabase submission error:', error);
      throw new APIError('Failed to submit to Supabase', { originalError: error });
    }
  }
  
  // Original PHP submission logic
  const submission = new FormData();

  // Map requestDetails to rfsDetails for Phil's server
  if (formData.requestDetails) {
    formData.rfsDetails = formData.requestDetails;
  }

  // Map occType to Phil's fat_occTypes table IDs
  // Our forms only use: Homicide (1), Missing Person (2)
  const occTypeMap = {
    'homicide': '1',
    'missing person': '2'
  };

  // Convert occType text to Phil's ID, default to 1 (Homicide)
  if (formData.occType) {
    const lookupKey = formData.occType.toLowerCase().trim();
    formData.occType = occTypeMap[lookupKey] || '1';
  } else {
    formData.occType = '1';
  }

  // Set reqArea to Phil's fat_servicing table ID for "Homicide and Missing Persons"
  // serviceID 36 = "Homicide and Missing Persons"
  formData.reqArea = '36';

  // Set rfsHeader (File Desc) based on form type
  const rfsHeaderMap = {
    'upload': 'FVU Upload Request',
    'analysis': 'FVU Analysis Request',
    'recovery': 'FVU Recovery Request'
  };
  formData.rfsHeader = rfsHeaderMap[formData.formType] || 'FVU Request';

  // Set ticketStatus (Request Type) based on form type
  // Maps to Phil's fat_rfs_types table:
  // 1 = Video Analysis (was Video Clarification)
  // 2 = Video Extraction (was Video Timeline)
  // 4 = Video Upload
  const ticketStatusMap = {
    'analysis': '1',
    'recovery': '2',
    'upload': '4'
  };
  formData.ticketStatus = ticketStatusMap[formData.formType] || '1';

  // Add all form fields using their field names
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      submission.append(key, value);
    }
  });
  
  // Add file attachments
  const timestamp = Date.now();
  submission.append('fileAttachmentA', pdfBlob, `${formData.formType}_${timestamp}.pdf`);
  submission.append('fileAttachmentB', jsonBlob, `${formData.formType}_${timestamp}.json`);
  
  // For development, mock the response
  if (CONFIG.IS_DEVELOPMENT) {
    return mockSubmission(submission);
  }
  
  // Production submission
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      body: submission,
      signal: AbortSignal.timeout(CONFIG.API_TIMEOUT)
    });
    
    const responseText = await response.text();
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new APIError(
          data.message || 'Server error',
          { ...data, status: response.status }
        );
      }

      return data;
    } catch (jsonError) {
      // Non-JSON response
      throw new APIError('Invalid response format', {
        responseText,
        status: response.status
      });
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', { timeout: true, code: 'ETIMEDOUT' });
    }

    if (error instanceof APIError) {
      throw error;
    }

    // Network error - check if offline
    if (!navigator.onLine) {
      throw new APIError('Network offline', {
        originalError: error,
        offline: true
      });
    }

    throw new APIError('Network error', { originalError: error });
  }
}

/**
 * Mock submission for development
 * @param {FormData} submission - Form data
 * @returns {Promise<Object>} Mock response
 */
async function mockSubmission(submission) {
  // Log submission data
  console.log('Mock submission:', {
    fields: Object.fromEntries(submission.entries()),
    files: {
      pdf: submission.get('fileAttachmentA')?.name,
      json: submission.get('fileAttachmentB')?.name
    }
  });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Random success/failure for testing
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      message: 'Ticket created successfully',
      ticketNumber: `TEST-${Date.now().toString().slice(-6)}`
    };
  } else {
    return {
      success: false,
      message: 'Missing required fields',
      fields: ['rName', 'occDate']
    };
  }
}

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'APIError';
    this.details = details;
    this.status = details.status || null;
  }
}

/**
 * Check API health/availability
 * @returns {Promise<boolean>} API is available
 */
export async function checkAPIHealth() {
  if (CONFIG.IS_DEVELOPMENT) {
    return true;
  }
  
  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}