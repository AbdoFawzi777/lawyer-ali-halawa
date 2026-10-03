/**
 * Service Worker for High-Performance Caching
 * Lawyer Ali Ali Mahmoud Halawa Legal Platform
 */

const CACHE_NAME = 'halawa-law-cache-v2';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/tailwind.min.css',
  './css/style.css',
  './js/app.js',
  './assets/lawyer-courtroom-gown.webp',
  './assets/lawyer-justice-ministry.webp',
  './assets/lawyer-court-entrance.webp',
  './assets/lawyer-portrait-suit.webp'
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for static assets, Network-First for HTML navigation
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only handle GET requests
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip external Google Sheets POST or analytics
  if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com') && !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Network-First for HTML navigation requests
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-First for static images, CSS, JS, and Fonts
  event.respondWith(
    caches.match(req).then((cachedResp) => {
      if (cachedResp) {
        // Fetch in background to update cache (Stale-While-Revalidate)
        fetch(req).then((networkResp) => {
          if (networkResp && networkResp.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(req, networkResp));
          }
        }).catch(() => {});
        return cachedResp;
      }

      return fetch(req).then((networkResp) => {
        if (!networkResp || networkResp.status !== 200 || networkResp.type !== 'basic') {
          return networkResp;
        }
        const responseToCache = networkResp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, responseToCache));
        return networkResp;
      });
    })
  );
});
