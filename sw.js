const root = self.registration.scope;
const prefix = 'ugt-sanir-portal:' + root + ':';
const cacheName = prefix + 'v12';
const files = ['index.html', 'portal.css', 'ambulancia.png', 'portal.js', 'manifest.webmanifest', 'icon-sanir-180.png', 'icon-sanir-192.png', 'icon-sanir-512.png'];
const urls = files.map(file => new URL(file, root).href);

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(urls.map(url => new Request(url, {cache: 'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(prefix) && key !== cacheName).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const isHome = request.mode === 'navigate' && [root, urls[0]].includes(request.url.split('?')[0]);
  if (!isHome && !urls.includes(request.url)) return;
  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const key = isHome ? urls[0] : request.url;
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.put(key, response.clone()).catch(() => {});
        return response;
      }
      return await cache.match(key) || response;
    } catch {
      return await cache.match(key) || Response.error();
    }
  })());
});
