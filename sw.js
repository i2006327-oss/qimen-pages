const CACHE_NAME = "qimen-pwa-v26";
const SCOPE = self.registration.scope;
const ASSETS = [
  "",
  "index.html",
  "qimen_static.html",
  "qimen_static_core.js?v=26",
  "qimen_static_app.js?v=26",
  "qimen_cases.js?v=26",
  "lunar.js?v=26",
  "number_static.html",
  "number_core.js?v=26",
  "styles.css?v=26",
  "manifest.webmanifest",
  "icon.svg"
].map((path) => new URL(path, SCOPE).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })))));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== new URL(SCOPE).origin) return;
  const networkFirst = event.request.mode === "navigate" || /\.(html|js|css)$/i.test(url.pathname);
  event.respondWith((async () => {
    if (!networkFirst) {
      return (await caches.match(event.request)) || fetch(event.request);
    }
    try {
      const response = await fetch(new Request(event.request, { cache: "reload" }));
      if (!response.ok) throw new Error("HTTP " + response.status);
      const cache = await caches.open(CACHE_NAME);
      await cache.put(event.request, response.clone());
      return response;
    } catch (error) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      throw error;
    }
  })());
});
