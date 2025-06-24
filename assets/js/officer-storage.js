/**
 * Officer Information Storage
 * Manages persistent officer data in localStorage
 */

import { CONFIG } from './config.js';

// Use CONFIG for all constants
const STORAGE_KEY = CONFIG.OFFICER_STORAGE.KEY;
const STORAGE_VERSION = CONFIG.OFFICER_STORAGE.VERSION;
const FIRST_TIME_KEY = CONFIG.OFFICER_STORAGE.FIRST_TIME_KEY;

/**
 * Check if this is first time using officer storage
 * @returns {boolean} Is first time
 */
export function isFirstTimeUse() {
  return !localStorage.getItem(FIRST_TIME_KEY);
}

/**
 * Mark that user has been notified about storage
 */
export function acknowledgeStorage() {
  localStorage.setItem(FIRST_TIME_KEY, 'true');
}

/**
 * Save officer information to localStorage
 * @param {Object} officerData - Officer information
 * @returns {boolean} Success status
 */
export function saveOfficerInfo(officerData) {
  if (!CONFIG.OFFICER_STORAGE.ENABLED) return false;
  
  try {
    const dataToStore = {
      version: STORAGE_VERSION,
      data: {
        rName: officerData.rName || '',
        badge: officerData.badge || '',
        requestingPhone: officerData.requestingPhone || '',
        requestingEmail: officerData.requestingEmail || ''
      },
      savedAt: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    return true;
  } catch (error) {
    console.error('Error saving officer info:', error);
    return false;
  }
}

/**
 * Load officer information from localStorage
 * @returns {Object|null} Officer data or null
 */
export function loadOfficerInfo() {
  if (!CONFIG.OFFICER_STORAGE.ENABLED) return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Version check for future compatibility
    if (parsed.version !== STORAGE_VERSION) {
      // Handle version mismatch if needed in future
      return null;
    }
    
    return parsed.data;
  } catch (error) {
    console.error('Error loading officer info:', error);
    return null;
  }
}

/**
 * Clear stored officer information
 * @returns {boolean} Success status
 */
export function clearOfficerInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing officer info:', error);
    return false;
  }
}

/**
 * Check if officer info exists
 * @returns {boolean} Exists
 */
export function hasOfficerInfo() {
  return localStorage.getItem(STORAGE_KEY) !== null;
}