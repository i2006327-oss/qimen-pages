const CACHE_NAME = "qimen-pwa-v17";
const SCOPE = self.registration.scope;
const ASSETS = [
  "",
  "index.html",
  "qimen_static.html",
  "qimen_static_core.js?v=17",
  "qimen_static_app.js?v=17",
  "lunar.js?v=17",
  "number_static.html",
  "number_core.js?v=17",
  "styles.css?v=17",
  "manifest.webmanifest",
  "icon.svg"
].map((path) => new URL(path, SCOPE).toString());

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
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
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
