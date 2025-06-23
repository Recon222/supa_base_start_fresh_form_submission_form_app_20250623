/**
 * Storage Management
 * Handles draft saving/loading with expiry
 */

import { CONFIG } from './config.js';

/**
 * Save form draft to localStorage
 * @param {string} formType - Type of form (analysis, upload, recovery)
 * @param {Object} formData - Form data to save
 * @returns {boolean} Success status
 */
export function saveDraft(formType, formData) {
  if (!CONFIG.FEATURES.SAVE_DRAFTS) return false;
  
  try {
    const draft = {
      formType,
      data: formData,
      timestamp: Date.now(),
      expires: Date.now() + (CONFIG.DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
    };
    
    const key = `${CONFIG.DRAFT_KEY_PREFIX}${formType}`;
    localStorage.setItem(key, JSON.stringify(draft));
    
    // Clean up expired drafts
    cleanupExpiredDrafts();
    
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

/**
 * Load form draft from localStorage
 * @param {string} formType - Type of form
 * @returns {Object|null} Draft data or null
 */
export function loadDraft(formType) {
  if (!CONFIG.FEATURES.SAVE_DRAFTS) return null;
  
  try {
    const key = `${CONFIG.DRAFT_KEY_PREFIX}${formType}`;
    const draftString = localStorage.getItem(key);
    
    if (!draftString) return null;
    
    const draft = JSON.parse(draftString);
    
    // Check if draft is expired
    if (draft.expires && Date.now() > draft.expires) {
      localStorage.removeItem(key);
      return null;
    }
    
    return draft.data;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

/**
 * Clear draft for a specific form
 * @param {string} formType - Type of form
 * @returns {boolean} Success status
 */
export function clearDraft(formType) {
  try {
    const key = `${CONFIG.DRAFT_KEY_PREFIX}${formType}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing draft:', error);
    return false;
  }
}

/**
 * Check if a draft exists
 * @param {string} formType - Type of form
 * @returns {boolean} Draft exists
 */
export function hasDraft(formType) {
  const draft = loadDraft(formType);
  return draft !== null;
}

/**
 * Get draft age in human-readable format
 * @param {string} formType - Type of form
 * @returns {string|null} Age string or null
 */
export function getDraftAge(formType) {
  try {
    const key = `${CONFIG.DRAFT_KEY_PREFIX}${formType}`;
    const draftString = localStorage.getItem(key);
    
    if (!draftString) return null;
    
    const draft = JSON.parse(draftString);
    const age = Date.now() - draft.timestamp;
    
    // Convert to human-readable
    const minutes = Math.floor(age / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    return null;
  }
}

/**
 * Clean up expired drafts from all forms
 */
export function cleanupExpiredDrafts() {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith(CONFIG.DRAFT_KEY_PREFIX)) {
        try {
          const draftString = localStorage.getItem(key);
          const draft = JSON.parse(draftString);
          
          if (draft.expires && now > draft.expires) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted draft
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up drafts:', error);
  }
}

/**
 * Save session start time
 * @returns {boolean} Success status
 */
export function saveSessionStart() {
  try {
    sessionStorage.setItem('fvu_session_start', Date.now().toString());
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get remaining session time in minutes
 * @returns {number} Minutes remaining
 */
export function getSessionTimeRemaining() {
  try {
    const startTime = sessionStorage.getItem('fvu_session_start');
    if (!startTime) return CONFIG.SESSION_TIMEOUT_MINUTES;
    
    const elapsed = Date.now() - parseInt(startTime);
    const elapsedMinutes = elapsed / (1000 * 60);
    const remaining = CONFIG.SESSION_TIMEOUT_MINUTES - elapsedMinutes;
    
    return Math.max(0, Math.floor(remaining));
  } catch (error) {
    return CONFIG.SESSION_TIMEOUT_MINUTES;
  }
}

/**
 * Check if session is about to expire
 * @returns {boolean} Is warning needed
 */
export function isSessionWarningNeeded() {
  const remaining = getSessionTimeRemaining();
  return remaining <= 5 && remaining > 0;
}

/**
 * Check if session has expired
 * @returns {boolean} Is expired
 */
export function isSessionExpired() {
  return getSessionTimeRemaining() <= 0;
}

/**
 * Clear all form data from storage
 * Used after successful submission
 */
export function clearAllFormData() {
  try {
    // Clear all drafts
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CONFIG.DRAFT_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear session data
    sessionStorage.clear();
    
    return true;
  } catch (error) {
    console.error('Error clearing form data:', error);
    return false;
  }
}

/**
 * Get storage usage info
 * @returns {Object} Storage info
 */
export function getStorageInfo() {
  try {
    const drafts = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(CONFIG.DRAFT_KEY_PREFIX)) {
        const formType = key.replace(CONFIG.DRAFT_KEY_PREFIX, '');
        drafts.push({
          formType,
          age: getDraftAge(formType),
          size: localStorage.getItem(key).length
        });
      }
    });
    
    return {
      drafts,
      totalSize: JSON.stringify(localStorage).length,
      sessionRemaining: getSessionTimeRemaining()
    };
  } catch (error) {
    return {
      drafts: [],
      totalSize: 0,
      sessionRemaining: CONFIG.SESSION_TIMEOUT_MINUTES
    };
  }
}