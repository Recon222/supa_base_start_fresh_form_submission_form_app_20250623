/**
 * API Client
 * Handles form submission to third-party system
 */

import { CONFIG } from './config.js';

/**
 * Submit form data to the API
 * @param {Object} formData - Form data object
 * @param {Blob} pdfBlob - Generated PDF file
 * @param {Blob} jsonBlob - Generated JSON file
 * @returns {Promise<Object>} API response
 */
export async function submitForm(formData, pdfBlob, jsonBlob) {
  // Create FormData for multipart submission
  const submission = new FormData();
  
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
        throw new APIError(data.message || 'Server error', data);
      }
      
      return data;
    } catch (jsonError) {
      // Non-JSON response
      throw new APIError('Invalid response format', { responseText });
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', { timeout: true });
    }
    
    if (error instanceof APIError) {
      throw error;
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