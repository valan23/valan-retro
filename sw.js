const CACHE_NAME = 'valan-retro-v2';
// Aquí solo ponemos lo que SI está físicamente en tu GitHub
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './played.js',
  './consoles.js',
  './utils.js',
  './main.js',
  './games.js',
  './wishlist.js',
  './scroll_nav.js',
  './images/covers/default.webp'
];

// 1. Instalación: Guardar archivos locales
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Limpiar cachés antiguas
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// 3. Intercepción: Aquí ocurre la magia para Google Sheets
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cachedResponse) => {
      // Si está en caché, lo devolvemos, pero TAMBIÉN intentamos actualizarlo
      const fetchPromise = fetch(evt.request).then((networkResponse) => {
        // Si la respuesta es válida, la guardamos en caché para la próxima vez
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(evt.request, responseToCache);
          });
        }
        return networkResponse;
      });

      // Devolvemos la respuesta cacheada (si existe) o esperamos a la red
      return cachedResponse || fetchPromise;
    })
  );
});
