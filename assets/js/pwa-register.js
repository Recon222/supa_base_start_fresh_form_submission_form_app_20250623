/**
 * PWA Service Worker Registration
 * Handles installation prompts, updates, and offline status
 *
 * @module pwa-register
 */

import { CONFIG } from './config.js';

// Guard against double initialization
let pwaInitialized = false;

// Store the deferred install prompt for later use
let deferredInstallPrompt = null;

// Track if the app is installed
let isAppInstalled = false;

// Store controllerchange handler reference to prevent memory leak
let controllerChangeHandler = null;

/**
 * Register the service worker
 * Called on page load
 */
export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers not supported');
    return;
  }

  console.log('[PWA] Initializing service worker registration');
  console.log('[PWA] SW Path:', CONFIG.PWA.SW_PATH);
  console.log('[PWA] SW Scope:', CONFIG.PWA.SW_SCOPE);
  console.log('[PWA] Current location:', window.location.pathname);

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register(CONFIG.PWA.SW_PATH, {
        scope: CONFIG.PWA.SW_SCOPE
      });

      console.log('[PWA] Service Worker registered successfully');
      console.log('[PWA] Registration scope:', registration.scope);

      // Check for updates on page load
      registration.update();

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateNotification(registration);
          }
        });
      });

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      showUpdateNotification(null, event.data.version);
    }
  });
}

/**
 * Handle the beforeinstallprompt event
 * Capture the prompt for later use
 */
export function setupInstallPrompt() {
  console.log('[PWA] Setting up install prompt listener');

  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('[PWA] beforeinstallprompt event fired!');

    // Prevent the mini-infobar from appearing on mobile
    event.preventDefault();

    // Store the event for later use
    deferredInstallPrompt = event;

    console.log('[PWA] Install prompt available - showing install button');

    // Show custom install button
    showInstallButton();
  });

  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed successfully');
    deferredInstallPrompt = null;
    isAppInstalled = true;
    hideInstallButton();
  });
}

/**
 * Programmatically trigger the install prompt
 * Call this from a user-initiated action (button click)
 */
export async function promptInstall() {
  if (!deferredInstallPrompt) {
    console.log('[PWA] Install prompt not available');
    return { outcome: 'unavailable' };
  }

  // Show the install prompt
  deferredInstallPrompt.prompt();

  // Wait for user response
  const { outcome } = await deferredInstallPrompt.userChoice;

  console.log('[PWA] Install prompt outcome:', outcome);

  // Clear the stored prompt (can only be used once)
  deferredInstallPrompt = null;

  return { outcome };
}

/**
 * Check if the app is running in standalone mode (installed)
 */
export function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true
    || isAppInstalled;
}

/**
 * Check if install prompt is available
 */
export function canInstall() {
  return deferredInstallPrompt !== null;
}

/**
 * Show the install button in the UI
 * Integrates with the header component
 */
function showInstallButton() {
  // Don't show if already installed
  if (isInstalled()) {
    return;
  }

  // Check if install button exists
  let installBtn = document.getElementById('pwa-install-btn');

  if (!installBtn) {
    // Create install button if it doesn't exist
    installBtn = createInstallButton();
  }

  installBtn.style.display = 'flex';
}

/**
 * Hide the install button
 */
function hideInstallButton() {
  const installBtn = document.getElementById('pwa-install-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
}

/**
 * Create the install button element
 */
function createInstallButton() {
  const button = document.createElement('button');
  button.id = 'pwa-install-btn';
  button.className = 'btn btn-primary btn-sm';
  button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right: 6px;">
      <path d="M8 1v10M4 7l4 4 4-4M2 14h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Install App
  `;
  button.style.cssText = `
    display: none;
    align-items: center;
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  `;

  button.addEventListener('click', async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      hideInstallButton();
    }
  });

  // Try to insert into landing header first (index.html)
  const landingHeaderContent = document.querySelector('.landing-header-content');
  if (landingHeaderContent) {
    landingHeaderContent.insertBefore(button, landingHeaderContent.firstChild);
  } else {
    // Fallback: Try to insert into form page header
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
      headerRight.insertBefore(button, headerRight.firstChild);
    }
  }

  return button;
}

/**
 * Show update notification to user
 * @param {ServiceWorkerRegistration|null} registration - The SW registration to use for triggering update
 * @param {string} version - Optional version string to display
 */
function showUpdateNotification(registration = null, version = '') {
  // Prevent duplicate banners
  if (document.getElementById('pwa-update-banner')) {
    return;
  }

  // Use the existing toast system if available
  if (typeof window.showToast === 'function') {
    window.showToast(
      'A new version is available. Refresh to update.',
      'info',
      10000 // 10 second duration
    );
    return;
  }

  // Fallback: Create a simple notification banner
  const banner = document.createElement('div');
  banner.id = 'pwa-update-banner';
  banner.style.cssText = `
    position: fixed;
    top: env(safe-area-inset-top, 0);
    left: env(safe-area-inset-left, 0);
    right: env(safe-area-inset-right, 0);
    background: #1B3A6B;
    color: white;
    padding: 0.75rem 1rem;
    text-align: center;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    font-size: 0.875rem;
  `;

  banner.innerHTML = `
    <span>A new version is available${version ? ` (${version})` : ''}.</span>
    <button id="pwa-update-btn" style="
      background: white;
      color: #1B3A6B;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    ">Refresh Now</button>
    <button id="pwa-dismiss-btn" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    ">Later</button>
  `;

  document.body.appendChild(banner);

  // Set up controller change listener BEFORE triggering skip waiting
  // Remove old listener if exists to prevent memory leak
  if (controllerChangeHandler) {
    navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
  }

  let refreshing = false;
  controllerChangeHandler = () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);

  document.getElementById('pwa-update-btn').addEventListener('click', () => {
    if (registration && registration.waiting) {
      // Tell waiting SW to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: just reload
      window.location.reload();
    }
  });

  document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
    banner.remove();
  });
}

/**
 * Setup offline/online status indicators
 */
export function setupOnlineStatus() {
  function updateStatus() {
    const isOnline = navigator.onLine;

    // Update any offline indicators in the UI
    document.body.classList.toggle('is-offline', !isOnline);

    // Dispatch custom event for other components to react
    window.dispatchEvent(new CustomEvent('onlineStatusChange', {
      detail: { online: isOnline }
    }));

    // Show toast if going offline
    if (!isOnline && typeof window.showToast === 'function') {
      window.showToast(
        'You are offline. Your drafts are saved locally.',
        'warning',
        5000
      );
    }
  }

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // Initial check
  updateStatus();
}

/**
 * Detect iOS Safari and show installation instructions
 */
export function showIOSInstallInstructions() {
  // Check if iOS Safari
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true;

  // Check if we've shown this before
  const hasShownInstructions = localStorage.getItem('fvu_ios_install_shown');

  if (isIOS && isSafari && !isStandalone && !hasShownInstructions) {
    // Show instructions after a short delay
    setTimeout(() => {
      showIOSPrompt();
    }, 3000);
  }
}

function showIOSPrompt() {
  const prompt = document.createElement('div');
  prompt.id = 'ios-install-prompt';
  prompt.style.cssText = `
    position: fixed;
    bottom: calc(20px + env(safe-area-inset-bottom, 0));
    left: calc(20px + env(safe-area-inset-left, 0));
    right: calc(20px + env(safe-area-inset-right, 0));
    background: white;
    color: #333;
    padding: 1rem;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  prompt.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 1rem;">
      <img src="/assets/images/icons/icon-152x152.png" alt="" style="width: 48px; height: 48px; border-radius: 10px;">
      <div style="flex: 1;">
        <div style="font-weight: 600; margin-bottom: 0.25rem;">Add to Home Screen</div>
        <div style="font-size: 0.875rem; color: #666; line-height: 1.4;">
          Install the FVU Request System for quick access: tap
          <svg width="20" height="20" viewBox="0 0 20 20" style="vertical-align: middle;">
            <path d="M10 2v10M6 6l4-4 4 4M3 12v5h14v-5" stroke="#007AFF" stroke-width="1.5" fill="none"/>
          </svg>
          then "Add to Home Screen"
        </div>
      </div>
      <button id="ios-prompt-close" style="
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #999;
        cursor: pointer;
        padding: 0;
        line-height: 1;
      ">&times;</button>
    </div>
  `;

  document.body.appendChild(prompt);

  document.getElementById('ios-prompt-close').addEventListener('click', () => {
    prompt.remove();
    localStorage.setItem('fvu_ios_install_shown', 'true');
  });

  // Auto-dismiss after 15 seconds
  setTimeout(() => {
    if (prompt.parentNode) {
      prompt.remove();
      localStorage.setItem('fvu_ios_install_shown', 'true');
    }
  }, 15000);
}

/**
 * Initialize all PWA functionality
 * Call this once on app startup
 */
export function initPWA() {
  if (pwaInitialized) {
    console.log('[PWA] Already initialized, skipping');
    return;
  }
  pwaInitialized = true;

  registerServiceWorker();
  setupInstallPrompt();
  setupOnlineStatus();
  showIOSInstallInstructions();

  // Log installation status
  if (isInstalled()) {
    console.log('[PWA] Running as installed app');
  }
}

// Auto-initialize if this script is loaded directly
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWA);
} else {
  initPWA();
}
