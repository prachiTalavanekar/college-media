// Service Worker for CampusConnect PWA
const CACHE_NAME = 'campusconnect-v6';
const urlsToCache = [
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Install event - cache resources with error handling
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        // Cache resources one by one to handle failures gracefully
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn('Failed to cache:', url, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('Service worker installed successfully');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service worker installation failed:', err);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function(event) {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Never cache API requests - always fetch from network
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(function(error) {
          console.log('API fetch failed:', error);
          throw error;
        })
    );
    return;
  }

  // Never cache HTML documents to prevent stale state issues
  if (event.request.destination === 'document' || 
      event.request.url.includes('.html') ||
      event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .catch(function(error) {
          console.log('Network fetch failed for document:', error);
          return caches.match('/').then(response => response || new Response('Offline'));
        })
    );
    return;
  }

  // For other resources, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available
        if (response) {
          return response;
        }
        
        // Fetch from network with error handling
        return fetch(event.request)
          .then(function(response) {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching (only for static assets)
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function(error) {
            console.log('Fetch failed:', error);
            throw error;
          });
      })
  );
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', function(event) {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Push notification event
self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body || 'New notification from CampusConnect',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: data.primaryKey || 1,
          url: data.url || '/'
        },
        actions: [
          {
            action: 'explore',
            title: 'View',
            icon: '/favicon.ico'
          },
          {
            action: 'close',
            title: 'Close',
            icon: '/favicon.ico'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(data.title || 'CampusConnect', options)
      );
    } catch (error) {
      console.error('Error handling push notification:', error);
    }
  }
});

// Notification click event
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'explore') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(function(clientList) {
        // Check if app is already open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});

// Background sync event (for offline functionality)
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncData());
  }
});

// Message event for communication with main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function syncData() {
  // Implement background sync logic here
  // This could sync offline posts, likes, comments, etc.
  console.log('Background sync triggered');
  return Promise.resolve();
}