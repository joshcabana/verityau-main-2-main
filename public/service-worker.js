// Service Worker for caching and offline support
const CACHE_NAME = 'verity-v1.0.0';
const STATIC_CACHE_NAME = 'verity-static-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.ico',
  '/favicon.png',
  '/og-image.jpg',
  '/placeholder.svg',
  '/robots.txt'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.addAll(STATIC_ASSETS);
      self.skipWaiting(); // Activate immediately
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE_NAME && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      self.clients.claim(); // Take control immediately
    })()
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache strategy: Stale-While-Revalidate for API calls
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Cache strategy: Cache-First for static assets
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|webp|svg|woff2?|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Don't cache if not successful
          if (!response.ok) return response;

          const responseClone = response.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        });
      })
    );
    return;
  }

  // Network-first for HTML pages (except API routes)
  event.respondWith(
    fetch(event.request).catch(() => {
      // If offline, try to serve from cache
      return caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || caches.match('/');
      });
    })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  const options = {
    body: data.body || 'You have a new message',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: data.tag || 'message-notification',
    data: {
      url: data.url || '/',
      matchId: data.matchId,
    },
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'New Message', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
