/**
 * Theme Manager
 * Centralized theme management for FVU Request System
 * Prevents FOUC and ensures consistent theme across all pages
 */

const THEME_KEY = 'fvu-theme';
const DEFAULT_THEME = 'dark';
const VALID_THEMES = ['dark', 'light'];

/**
 * Get current theme from localStorage or default
 * @returns {string} Current theme
 */
export function getCurrentTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  return VALID_THEMES.includes(saved) ? saved : DEFAULT_THEME;
}

/**
 * Set theme and save to localStorage
 * @param {string} theme - Theme to set ('dark' or 'light')
 */
export function setTheme(theme) {
  if (!VALID_THEMES.includes(theme)) return;
  
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Toggle between dark and light themes
 * @returns {string} New theme after toggle
 */
export function toggleTheme() {
  const current = getCurrentTheme();
  const newTheme = current === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load
 * Call this as early as possible to prevent FOUC
 */
export function initTheme() {
  const theme = getCurrentTheme();
  // Set on documentElement first for immediate effect
  document.documentElement.setAttribute('data-theme', theme);
  // Then on body when it's available
  if (document.body) {
    document.body.setAttribute('data-theme', theme);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.setAttribute('data-theme', theme);
    });
  }
}

/**
 * Setup theme toggle button
 * @param {string} buttonId - ID of the toggle button (default: 'theme-toggle')
 */
export function setupThemeToggle(buttonId = 'theme-toggle') {
  const button = document.getElementById(buttonId);
  if (button) {
    button.addEventListener('click', toggleTheme);
  }
}