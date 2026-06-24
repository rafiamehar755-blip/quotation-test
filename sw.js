const CACHE_NAME = 'ahmad-aluminium-v3'; // Incremented version to clear old traps

const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'Ahmad_Aluminium_Logo.png',
  'Signature-Ahmad.png'
];

// Install Event - Force the new service worker to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event - Wipe out any old cached files automatically
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network-First for your app files, Normal fetch for Google Sheets
self.addEventListener('fetch', (event) => {
  // Only intercept files belonging to your Github website
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, fall back to the cache
          return caches.match(event.request);
        })
    );
  } else {
    // Let Google Sheets and WhatsApp bypass the cache entirely so they always fetch fresh data
    event.respondWith(fetch(event.request));
  }
});
