/**
 * Notifications Module
 * Provides consistent UI notifications: modals, alerts, confirmations
 * Uses existing glassmorphic design system
 */

import { createElement } from './utils.js';

// Track active modal for cleanup
let activeModal = null;
let focusTrap = null;

/**
 * Show confirmation modal
 * @param {Object} options - Modal configuration
 * @param {string} options.title - Modal title
 * @param {string} options.message - Modal message  
 * @param {string} options.confirmText - Confirm button text (default: 'Confirm')
 * @param {string} options.cancelText - Cancel button text (default: 'Cancel')
 * @param {string} options.type - Modal type: 'warning', 'danger', 'success', 'info'
 * @returns {Promise<boolean>} - Resolves true if confirmed, false if cancelled
 */
export function showConfirmModal(options) {
  // Ensure only one modal at a time
  if (activeModal) {
    closeModal();
  }
  
  return new Promise((resolve) => {
    // Set defaults
    const config = {
      title: 'Confirm Action',
      message: 'Are you sure you want to continue?',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      type: 'warning',
      ...options
    };
    
    // Create modal structure
    const modal = createModalStructure(config);
    
    // Get buttons for event handlers
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    // Button handlers
    const handleConfirm = () => {
      closeModal();
      resolve(true);
    };
    
    const handleCancel = () => {
      closeModal();
      resolve(false);
    };
    
    // Add event listeners
    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    
    // Click outside to cancel
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        handleCancel();
      }
    });
    
    // Escape key to cancel
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Store cleanup function
    modal._cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      document.removeEventListener('keydown', handleEscape);
    };
    
    // Add to DOM and show
    document.body.appendChild(modal);
    activeModal = modal;
    
    // Setup focus trap
    setupFocusTrap(modal);
    
    // Trigger animation
    requestAnimationFrame(() => {
      modal.classList.add('show');
      confirmBtn.focus();
    });
  });
}

/**
 * Create modal DOM structure
 * @private
 */
function createModalStructure(config) {
  const modalHTML = `
    <div class="modal-overlay">
      <div class="modal-content modal-${config.type}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-header">
          <h3 class="modal-title" id="modal-title">${config.title}</h3>
        </div>
        <div class="modal-body">
          ${config.type === 'warning' ? '<div class="modal-icon">⚠️</div>' : ''}
          <p class="modal-message">${config.message}</p>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary modal-cancel">
            ${config.cancelText}
          </button>
          <button type="button" class="btn btn-primary modal-confirm">
            ${config.confirmText}
          </button>
        </div>
      </div>
    </div>
  `;
  
  const wrapper = createElement('div');
  wrapper.innerHTML = modalHTML;
  return wrapper.firstElementChild;
}

/**
 * Close active modal
 * @private
 */
function closeModal() {
  if (!activeModal) return;
  
  activeModal.classList.remove('show');
  
  // Clean up after animation
  setTimeout(() => {
    if (activeModal._cleanup) {
      activeModal._cleanup();
    }
    if (focusTrap) {
      focusTrap.cleanup();
      focusTrap = null;
    }
    activeModal.remove();
    activeModal = null;
  }, 300);
}

/**
 * Setup focus trap for accessibility
 * @private
 */
function setupFocusTrap(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  modal.addEventListener('keydown', trapFocus);
  
  focusTrap = {
    cleanup: () => modal.removeEventListener('keydown', trapFocus)
  };
}