const CACHE_NAME = "khatabook-cache-v8"; // bumped: add /privacy to precache + network-first list

const ASSETS_TO_CACHE = [
  "./",
  "./order-form",
  "./privacy",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// index.html / order-form / privacy change occasionally (new features/fixes,
// policy updates) — these must always be preferred fresh from the network,
// falling back to cache only when offline or when the network is too slow to
// be worth waiting on.
// firebase.json has cleanUrls: true, so the real URLs Firebase serves have no
// .html extension ("/", "/order-form", "/privacy") — precaching or matching
// the .html versions instead would mean fetching a URL that gets
// 301-redirected, and a redirected response served through respondWith() for
// a navigation fails outright on Safari/iOS ("Response served by service
// worker has redirections") and can error in Chrome too. The .html names are
// kept here as a defensive fallback only, in case cleanUrls is ever turned off.
const NETWORK_FIRST_FILES = ["order-form", "privacy", "index.html", "order-form.html", "privacy.html"];

// If the network hasn't answered within this window, stop making the user
// wait and serve the cached copy instantly instead — the network request
// keeps running in the background and still updates the cache for next time.
const NETWORK_TIMEOUT_MS = 3500;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache each asset independently (not cache.addAll) so one missing or
      // renamed file can't fail the whole install and leave the app with
      // zero offline cache.
      Promise.allSettled(ASSETS_TO_CACHE.map((url) => cache.add(url)))
    )
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
  const isNetworkFirst =
    event.request.mode === "navigate" ||
    NETWORK_FIRST_FILES.some((f) => url.pathname.endsWith("/" + f));

  event.respondWith(isNetworkFirst ? networkFirst(event) : cacheFirst(event));
});

// Network-first with a timeout fallback: race the network against a short
// clock. Whichever is ready first wins — but the network fetch is never
// cancelled, so a slow-but-successful response still updates the cache for
// next visit even after the timeout has already served the cached copy.
async function networkFirst(event) {
  // ignoreSearch: true — order-form links carry a per-shop "?shop=UID" query
  // string, but the underlying cached page is the same regardless of which
  // shop's link it was. Without this, a cache lookup for "order-form?shop=abc"
  // would never match the precached "order-form" entry.
  const cachedPromise = caches.match(event.request, { ignoreSearch: true });

  // cache: "no-store" bypasses the browser's own HTTP cache entirely — needed
  // because Firebase Hosting sets a default Cache-Control: max-age=3600 on
  // deployed files unless firebase.json overrides it, which would otherwise
  // let the browser silently serve a stale index.html for up to an hour
  // without this fetch() ever reaching the network.
  const networkRequest = new Request(event.request, { cache: "no-store" });

  const networkPromise = fetch(networkRequest).then((response) => {
    if (response && response.ok) {
      const clone = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)));
    }
    return response;
  });

  const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve("timeout"), NETWORK_TIMEOUT_MS));

  const first = await Promise.race([networkPromise, timeoutPromise]).catch(() => "timeout");
  if (first && first !== "timeout") return first; // network answered in time — freshest copy

  // Network was slow or already failed — serve the cached copy immediately if we have one.
  const cached = await cachedPromise;
  if (cached) return cached;

  // No cache yet (e.g. very first visit while offline) — nothing left but to
  // wait on the network result, success or failure.
  return networkPromise;
}

// Cache-first for static assets (icons, manifest) — these rarely change, so
// serving instantly from cache is fine, with a background refresh in case
// they ever do change.
async function cacheFirst(event) {
  const cached = await caches.match(event.request, { ignoreSearch: true });
  const fetchPromise = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// নোটিফিকেশনে ট্যাপ করলে অ্যাপ খুলে/ফোকাস করে Orders পেজে নিয়ে যায়
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
  const cached = await caches.match(event.request, { ignoreSearch: true });
  const fetchPromise = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// নোটিফিকেশনে ট্যাপ করলে অ্যাপ খুলে/ফোকাস করে Orders পেজে নিয়ে যায়
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
  const cached = await caches.match(event.request, { ignoreSearch: true });
  const fetchPromise = fetch(event.request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)));
      }
      return response;
    })
    .catch(() => cached);
  return cached || fetchPromise;
}

// নোটিফিকেশনে ট্যাপ করলে অ্যাপ খুলে/ফোকাস করে Orders পেজে নিয়ে যায়
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("./");
    })
  );
});
