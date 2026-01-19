/**
 * FVU Request System - Service Worker
 * Version: 1.0.0
 *
 * Caching Strategy:
 * - PHP Pages: Network-first (sessions require fresh content)
 * - Static Assets: Cache-first (JS, CSS, images)
 * - API Calls: Network-only (submissions must reach server)
 */

// Version number - INCREMENT THIS WITH EVERY DEPLOYMENT
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `fvu-cache-${CACHE_VERSION}`;

// Complete list of static assets to pre-cache
const STATIC_ASSETS = [
  // PHP Pages (will be cached after first network load)
  '/',
  '/index.php',
  '/upload.php',
  '/analysis.php',
  '/recovery.php',

  // CSS
  '/assets/css/forms.css',
  '/assets/css/header.css',
  '/assets/css/notifications.css',

  // Core JavaScript Modules
  '/assets/js/config.js',
  '/assets/js/utils.js',
  '/assets/js/validators.js',
  '/assets/js/storage.js',
  '/assets/js/officer-storage.js',
  '/assets/js/calculations.js',
  '/assets/js/header-component.js',
  '/assets/js/theme-manager.js',
  '/assets/js/api-client.js',
  '/assets/js/pdf-generator.js',
  '/assets/js/pdf-templates.js',
  '/assets/js/json-generator.js',
  '/assets/js/notifications.js',
  '/assets/js/logo-data.js',
  '/assets/js/pwa-register.js',

  // Form Handlers
  '/assets/js/form-handlers/form-handler-base.js',
  '/assets/js/form-handlers/form-handler-upload.js',
  '/assets/js/form-handlers/form-handler-analysis.js',
  '/assets/js/form-handlers/form-handler-recovery.js',
  '/assets/js/form-handlers/form-field-builder.js',
  '/assets/js/form-handlers/conditional-field-handler.js',

  // Third-Party Libraries
  '/lib/pdfmake.min.js',
  '/lib/vfs_fonts.js',

  // Images
  '/assets/images/homicide-logo-300x300.svg',
  '/assets/images/peel-logo.svg',

  // PWA Assets
  '/manifest.json',
  '/assets/images/icons/icon-192x192.png',
  '/assets/images/icons/icon-512x512.png'
];

// URLs that should NEVER be cached (API endpoints)
const NETWORK_ONLY_URLS = [
  'rfs_request_process.php',
  '/api/',
  'supabase.co'
];

// URLs that should use network-first strategy
const NETWORK_FIRST_URLS = [
  '.php'
];

/**
 * Install Event
 * Pre-caches all static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching static assets');

        // Cache assets one by one to handle failures gracefully
        return Promise.allSettled(
          STATIC_ASSETS.map(async (url) => {
            try {
              const response = await fetch(url, { credentials: 'same-origin' });
              if (response.ok) {
                await cache.put(url, response);
                console.log('[SW] Cached:', url);
              } else {
                console.warn('[SW] Failed to cache (HTTP error):', url, response.status);
              }
            } catch (error) {
              console.warn('[SW] Failed to cache:', url, error.message);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Pre-caching complete');
        // Force activation without waiting for existing workers to finish
        return self.skipWaiting();
      })
  );
});

/**
 * Activate Event
 * Cleans up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('fvu-cache-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleared');
        // Take control of all clients immediately
        return self.clients.claim();
      })
      .then(() => {
        // Notify all clients about the update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION
            });
          });
        });
      })
  );
});

/**
 * Fetch Event
 * Implements caching strategies based on request type
 */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests (form submissions, etc.)
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Check if this URL should never be cached
  if (NETWORK_ONLY_URLS.some(pattern => url.pathname.includes(pattern) || url.href.includes(pattern))) {
    return; // Let the browser handle it normally
  }

  // Determine caching strategy
  const isPhpPage = NETWORK_FIRST_URLS.some(pattern => url.pathname.includes(pattern));

  if (isPhpPage) {
    // Network-first for PHP pages (session compatibility)
    event.respondWith(networkFirstStrategy(event.request));
  } else {
    // Cache-first for static assets
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

/**
 * Network-first strategy
 * Try network, fall back to cache
 * Used for PHP pages to ensure session compatibility
 */
async function networkFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    // Try network first
    const networkResponse = await fetch(request, {
      credentials: 'same-origin',
      // Set a reasonable timeout
      signal: AbortSignal.timeout(10000)
    });

    // If successful, update cache and return
    if (networkResponse.ok) {
      // Clone response before caching (response can only be read once)
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // Network returned error, try cache
    throw new Error(`Network response not OK: ${networkResponse.status}`);

  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    // Network failed, try cache
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    // No cache available, return offline fallback
    console.log('[SW] No cache available for:', request.url);
    return createOfflineResponse(request);
  }
}

/**
 * Cache-first strategy
 * Try cache, fall back to network
 * Used for static assets
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);

  // Try cache first
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background (stale-while-revalidate)
    fetch(request, { credentials: 'same-origin' })
      .then((networkResponse) => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {
        // Network update failed, that's okay - we have cache
      });

    return cachedResponse;
  }

  // No cache, try network
  try {
    const networkResponse = await fetch(request, { credentials: 'same-origin' });

    if (networkResponse.ok) {
      // Cache for future use
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.log('[SW] Network failed for static asset:', request.url);
    return createOfflineResponse(request);
  }
}

/**
 * Create offline fallback response
 */
function createOfflineResponse(request) {
  const url = new URL(request.url);

  // For HTML/PHP pages, return an offline message
  if (url.pathname.endsWith('.php') || url.pathname === '/') {
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - FVU Request System</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .offline-container {
            text-align: center;
            max-width: 400px;
          }
          .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #1B3A6B;
          }
          p {
            color: #888;
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }
          .retry-btn {
            background: #1B3A6B;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
          }
          .retry-btn:hover {
            background: #2B5AA8;
          }
          .draft-note {
            margin-top: 1.5rem;
            padding: 1rem;
            background: rgba(27, 58, 107, 0.2);
            border-radius: 6px;
            font-size: 0.875rem;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">&#128268;</div>
          <h1>You're Offline</h1>
          <p>
            The FVU Request System requires a network connection.
            Please check your connection and try again.
          </p>
          <button class="retry-btn" onclick="location.reload()">
            Retry Connection
          </button>
          <div class="draft-note">
            <strong>Your drafts are safe.</strong><br>
            Any form data you've entered is saved locally
            and will be available when you reconnect.
          </div>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
      statusText: 'Service Unavailable'
    });
  }

  // For other resources, return a simple error
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable'
  });
}

/**
 * Message handler for client communication
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
