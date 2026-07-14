const CACHE_NAME = 'cooltech-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './vendor/html2pdf.bundle.min.js',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Cache each asset individually instead of cache.addAll(), which aborts
            // the ENTIRE install if even one request fails. That previously meant a
            // single flaky asset (like the external CDN script) could silently leave
            // nothing cached at all, breaking offline use of the app and PDF export.
            return Promise.all(
                ASSETS.map(url => cache.add(url).catch(err => {
                    console.error('Failed to cache', url, err);
                }))
            );
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(cachedResponse => {
            return cachedResponse || fetch(e.request);
        })
    );
});