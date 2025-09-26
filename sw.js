// List of hostnames that are considered "local"
const localHostnames = [
    "localhost", // Standard local server
    "127.0.0.1", // Standard local IP
    "pushup-app.lndo.site", // Your Lando development URL
];

const IS_LOCAL =
    localHostnames.includes(window.location.hostname) ||
    window.location.hostname.endsWith(".lndo.site");
const IS_PRODUCTION = !IS_LOCAL;

if (IS_LOCAL) {
    console.log("Running in Local Development Mode.");
    console.log("Skipping Service Worker registration in local environment.");
} else {
    console.log("Running in Production Mode.");
}

const CACHE_NAME = "pushup-tracker-v1";
let urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/icon-192.png",
    "/icon-512.png",
];

if (IS_PRODUCTION) {
    urlsToCache = [
        "./",
        "./index.html",
        "./style.css",
        "./app.js",
        "./icon-192.png",
        "./icon-512.png",
    ];
}

// Install event: open a cache and add the core files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache");
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event: serve cached content when offline
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Cache hit - return response
            if (response) {
                return response;
            }
            // Not in cache - fetch from network
            return fetch(event.request);
        })
    );
});
