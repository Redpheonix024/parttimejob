// Service Worker: sw.js
const CACHE_NAME = 'parttimejob-v1.1'; // Increment version to force update
const OFFLINE_URL = '/offline.html';

// List of files to cache during installation
const urlsToCache = [
  '/',
  '/offline.html',
  '/favicon.ico',
  // Add other important static assets here
];

// Install event - cache the application shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately
  event.waitUntil(clients.claim());
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, serve the offline page if offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // For other requests, try the cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise, try the network
      return fetch(event.request).catch(() => {
        // If both cache and network fail, return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        return new Response('You are offline', {
          status: 408,
          statusText: 'Network request failed',
        });
      });
    })
  );
});
