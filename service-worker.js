const CACHE_NAME = "spotify-clone-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./about.html",
  "./style.css",
  "./about.css",
  "./script.js",
  "./logo.jpg",
  "./favicon.ico",
  "./playing.gif"
];

// Install event - cache files
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Caching app shell");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type === "error") {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache audio files separately
          if (event.request.url.includes("/songs/") || event.request.url.includes("/covers/")) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return offline page or cached response
          return caches.match(event.request);
        });
    })
  );
});

// Background sync for liked songs
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-liked-songs") {
    event.waitUntil(syncLikedSongs());
  }
});

async function syncLikedSongs() {
  try {
    // Sync liked songs data if needed
    console.log("Syncing liked songs...");
  } catch (error) {
    console.error("Sync failed:", error);
  }
}
