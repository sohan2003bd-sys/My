const CACHE_NAME = "khatabook-cache-v2"; // bumped so every browser's stale cache gets cleared once
const ASSETS_TO_CACHE = [
  "./index.html",
  "./order-form.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];
// index.html / order-form.html change often (new features/fixes) — these must
// always be fetched fresh from the network when possible, only falling back
// to the cached copy when offline. Static assets rarely change, so those stay
// cache-first for speed.
const NETWORK_FIRST = ["/index.html", "/order-form.html", "/"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests; let everything else (Firebase, fonts, QR/CDN scripts) pass through
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST.includes(url.pathname) || event.request.mode === "navigate";

  if (isNetworkFirst) {
    // Network-first: always try to get the latest file from the server first,
    // so new deployments show up immediately. Only use the cached copy if the
    // device is offline (fetch fails).
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets (icons, manifest) — these rarely change, so
  // serving instantly from cache (with a background refresh) is fine.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
