/**
 * Header Component
 * Reusable header for all form pages
 * Handles rendering, theme toggle, and draft button behavior
 */

import { initTheme, setupThemeToggle } from './theme-manager.js';

/**
 * Generate header HTML and inject into the DOM
 * @param {string} formTitle - The title to display in the header
 * @returns {HTMLElement} The created header element
 */
export function createHeader(formTitle) {
  // Create header element
  const header = document.createElement('header');
  header.className = 'main-header';

  header.innerHTML = `
    <div class="container">
      <div class="header-content">
        <div class="header-left">
          <a href="index.html" class="btn btn-secondary btn-sm">← Back</a>
          <div class="header-divider"></div>
          <h1 class="form-title">${formTitle}</h1>
        </div>
        <div class="header-right">
          <button class="draft-button" id="draft-button">
            <svg class="draft-icon" viewBox="0 0 20 20" fill="none">
              <path d="M3 3C3 2.44772 3.44772 2 4 2H13L17 6V17C17 17.5523 16.5523 18 16 18H4C3.44772 18 3 17.5523 3 17V3Z" stroke="currentColor" stroke-width="2"/>
              <rect x="6" y="2" width="8" height="5" fill="currentColor"/>
              <rect x="6" y="11" width="8" height="3" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="draft-text">Auto-save active</span>
          </button>
          <button class="theme-toggle" id="theme-toggle">
            🌓
          </button>
        </div>
      </div>
    </div>
  `;

  return header;
}

/**
 * Initialize and inject header into the page
 * Call this from your form's script tag
 * @param {string} formTitle - The title to display in the header
 */
export function initHeader(formTitle) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectHeader(formTitle);
    });
  } else {
    injectHeader(formTitle);
  }
}

/**
 * Internal function to inject header
 */
function injectHeader(formTitle) {
  // Find the background animation element (header should come after it)
  const backgroundAnim = document.querySelector('.background-animation');

  if (!backgroundAnim) {
    console.error('Header component: Could not find .background-animation element');
    return;
  }

  // Create and inject header
  const header = createHeader(formTitle);
  backgroundAnim.insertAdjacentElement('afterend', header);

  // Initialize theme
  initTheme();
  setupThemeToggle();
}

/**
 * Standalone function to just create and return the header element
 * Useful if you want to manually control injection
 * @param {string} formTitle - The title to display in the header
 * @returns {HTMLElement} The header element
 */
export function getHeaderElement(formTitle) {
  return createHeader(formTitle);
}
