// Thanima Food Agency - offline cache. Network first (always the newest app when online), cache when offline.
const CACHE = 'thanima-v143';
const CORE = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('googleapis.com') && !url.hostname.startsWith('fonts')) return;
  if (url.hostname.endsWith('firebaseio.com') || (url.hostname.endsWith('firebaseapp.com') && url.pathname.startsWith('/__/'))) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
