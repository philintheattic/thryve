const CACHE_NAME = "thryve-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "index.html",
  "css/styles.css",
  "js/script.js",
  "manifest.json",
];

// Install Service Worker & Cache Files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Service Worker & Clean Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch Strategy: Network First, Fallback to Cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response & update cache
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // Serve cache when offline
  );
});
