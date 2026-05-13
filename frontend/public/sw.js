const CACHE_VERSION = "v2";
const CACHE_NAME = `destiny-mirror-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  // Don't pre-cache pages — let network-first handle it.
  // Just activate immediately.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete ALL old caches on new SW version
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET and API requests
  if (request.method !== "GET" || request.url.includes("/api/")) {
    return;
  }

  // NETWORK-FIRST: Always try fresh content first, fall back to cache.
  // This ensures after a deployment, users always get the new code.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
