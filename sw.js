// Bei jeder Änderung an den App-Dateien die Version erhöhen, damit das iPhone die neue Fassung lädt.
const CACHE = 'stundenzettel-v1';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Erst Netz, bei Fehler (z. B. Flugmodus) aus dem Cache – so kommen Updates an, und offline startet die App trotzdem.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok && new URL(event.request.url).origin === location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
