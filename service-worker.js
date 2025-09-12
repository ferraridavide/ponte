const CACHE_NAME = 'ponte-cache-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/ponte.jpg',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.url.startsWith(self.location.origin)) {
              cache.put(event.request, copy);
            }
          });
          return resp;
        })
        .catch(() => caches.match('/offline.html'));
    })
  );
});
