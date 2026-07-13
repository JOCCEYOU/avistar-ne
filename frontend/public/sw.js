const CACHE_NAME = 'avistar-ne-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/classes/ApiClient.js',
  './assets/js/classes/AuthManager.js',
  './assets/js/classes/SightingManager.js',
  './assets/js/classes/AdminManager.js',
  './assets/js/classes/MapManager.js',
  './assets/js/classes/ModalManager.js',
  './assets/js/classes/StatsManager.js',
  './assets/js/classes/ActivityFeed.js',
  './assets/js/classes/Router.js',
  './img-frontend/Captura_de_pantalla_2026-06-08_170731-removebg-preview.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn('[ServiceWorker] Cache error:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones API o uploads para que no se entreguen desde el cache estático de la PWA
  if (event.request.url.includes('/api/') || event.request.url.includes('/uploads/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retornar de cache y actualizar en segundo plano (Stale-While-Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline */});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
