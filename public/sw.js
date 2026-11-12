// Engineering Path service worker.
// Pages: network first (fresh content when online), cached copy when offline.
// Hashed build assets in /_astro/: cache first, they never change.
// Everything else on this site: cached copy right away, refreshed in the background.
// Bump VERSION to drop every old cache on the next visit.
const VERSION = 'v2';
const SHELL = `shell-${VERSION}`;
const PAGES = `pages-${VERSION}`;
const ASSETS = `assets-${VERSION}`;
const OFFLINE_URL = '/offline/';
const NETWORK_TIMEOUT_MS = 4000;
// Caps so saved pages can't fill the device. The oldest entries go first.
const MAX_PAGES = 600;
const MAX_ASSETS = 1500;

const PRECACHE = [
  '/',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  const keep = new Set([SHELL, PAGES, ASSETS]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function save(cacheName, key, res, max) {
  const cache = await caches.open(cacheName);
  await cache.put(key, res);
  await trim(cache, max);
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

async function networkFirstPage(request, event) {
  // Pages are static, so "?anything" is the same page: save one copy per path.
  const url = new URL(request.url);
  const key = url.origin + url.pathname;
  const cache = await caches.open(PAGES);
  const network = fetch(request);
  // Registered now, not when the response arrives: if the timeout below serves the
  // cached copy first, the late response still gets saved for next time.
  event.waitUntil(
    network.then((res) => (res.ok ? save(PAGES, key, res.clone(), MAX_PAGES) : undefined)).catch(() => {}),
  );
  try {
    // A slow mobile connection shouldn't hold up a page we already have.
    const cached = await cache.match(key);
    return await (cached ? Promise.race([network, timeout(NETWORK_TIMEOUT_MS)]) : network);
  } catch {
    const cached = (await cache.match(key)) || (await caches.match(key));
    return cached || (await caches.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request, event) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) event.waitUntil(save(ASSETS, request, res.clone(), MAX_ASSETS));
  return res;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) event.waitUntil(save(ASSETS, request, res.clone(), MAX_ASSETS));
      return res;
    })
    .catch(() => cached || Response.error());
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request, event));
  } else if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(request, event));
  } else {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
