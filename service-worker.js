// Listen for messages from the main thread to schedule notifications
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'schedule-notification') {
    const { title, options, delayMs } = event.data;
    // Use setTimeout to schedule notification (note: survives as long as SW is alive)
    setTimeout(() => {
      self.registration.showNotification(title, options);
    }, delayMs || 2 * 60 * 1000); // Default: 2 minutes
  }
});
const CACHE_NAME = 'tapgas-cache-v2'; // Increment for each deploy
const urlsToCache = [
  '/tapgas/',
  '/tapgas/index.html',
  '/tapgas/manifest.json',
  '/tapgas/vite.svg',
  // Add other assets as needed
];

self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/tapgas/');
        }
        return undefined;
      })
  );
});

self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform any background sync tasks here
      console.log('[ServiceWorker] Background sync completed')
    );
  }
});
