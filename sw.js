const CACHE_NAME = 'pushup-tracker-v1';
let urlsToCache = [
    './', // Base path relative to the scope of the service worker
    'index.html',
    'app.js',
    'favicon.svg',
    'favicon.ico',
    'apple-touch-icon.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
    'favicon-16x16.png',
    'favicon-32x32.png',
    'manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                    // Cache hit - return response
                    if (response) {
                        return response;
                    }
                    // Not in cache - fetch from network
                    return fetch(event.request);
                }
            )
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => {
                    return cacheName.startsWith('pushup-tracker-') && cacheName !== CACHE_NAME;
                }).map(cacheName => {
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('Service Worker: Old caches cleared.');
        })
    );
});

