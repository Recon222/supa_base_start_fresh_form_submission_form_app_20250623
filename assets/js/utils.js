/**
 * Utility Functions
 * Shared helpers used across the application
 */

import { CONFIG } from './config.js';

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type from CONFIG.DATE_FORMATS
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'DISPLAY') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  switch (format) {
    case 'INPUT':
      return d.toISOString().split('T')[0];
      
    case 'DATETIME':
      return d.toISOString().slice(0, 16);
      
    case 'TIMESTAMP':
      return d.toISOString().slice(0, 19).replace('T', ' ');
      
    case 'DISPLAY':
    default:
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }
}

/**
 * Format datetime for display
 * @param {string|Date} datetime - DateTime to format
 * @returns {string} Formatted datetime
 */
export function formatDateTime(datetime) {
  if (!datetime) return '';
  
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '';
  
  const date = formatDate(d, 'DISPLAY');
  const time = d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
  
  return `${date} at ${time}`;
}

/**
 * Show/hide element with optional animation
 * @param {HTMLElement} element - Element to show/hide
 * @param {boolean} show - Show or hide
 * @param {boolean} animate - Use fade animation
 */
export function toggleElement(element, show, animate = true) {
  if (!element) return;
  
  if (show) {
    element.classList.remove('d-none');
    if (animate) {
      element.style.opacity = '0';
      element.offsetHeight; // Force reflow
      element.style.transition = `opacity ${CONFIG.ANIMATIONS.FADE_DURATION}ms`;
      element.style.opacity = '1';
    }
  } else {
    if (animate) {
      element.style.transition = `opacity ${CONFIG.ANIMATIONS.FADE_DURATION}ms`;
      element.style.opacity = '0';
      setTimeout(() => {
        element.classList.add('d-none');
        element.style.opacity = '';
        element.style.transition = '';
      }, CONFIG.ANIMATIONS.FADE_DURATION);
    } else {
      element.classList.add('d-none');
    }
  }
}

/**
 * Smooth scroll to element
 * @param {HTMLElement} element - Element to scroll to
 * @param {Object} options - Scroll options
 */
export function scrollToElement(element, options = {}) {
  if (!element) return;
  
  const defaultOptions = {
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  };
  
  element.scrollIntoView({ ...defaultOptions, ...options });
}

/**
 * Create element with attributes and content
 * @param {string} tag - HTML tag
 * @param {Object} attrs - Attributes
 * @param {string|HTMLElement|Array} content - Content
 * @returns {HTMLElement} Created element
 */
export function createElement(tag, attrs = {}, content = null) {
  const element = document.createElement(tag);

  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'htmlFor') {
      // htmlFor is the DOM property that maps to the 'for' HTML attribute
      if (typeof value === 'string' && value) {
        element.setAttribute('for', value);
      }
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add content
  if (content !== null) {
    if (typeof content === 'string') {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach(child => {
        if (child) element.appendChild(child);
      });
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }
  }
  
  return element;
}

/**
 * Show temporary toast message
 * @param {string} message - Message to show
 * @param {string} type - Type: success, error, warning, info
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
  // Remove any existing toast
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) {
    existingToast.remove();
  }
  
  // Create toast
  const toast = createElement('div', {
    className: `toast-message toast-${type}`,
    style: `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem 2rem;
      background: var(--surface-elevated);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: var(--z-toast);
      opacity: 0;
      transition: opacity 0.3s ease;
    `
  }, message);
  
  // Add type-specific styling
  const typeColors = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)'
  };
  
  toast.style.borderColor = typeColors[type] || typeColors.info;
  
  // Add to body and animate in
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  // Remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Generate unique ID
 * @param {string} prefix - Prefix for the ID
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Is in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Name for downloaded file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}