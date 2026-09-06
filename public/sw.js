/* ByUsi Studio Service Worker
 * 策略：静态资源缓存优先 + 后台更新；导航请求网络优先、失败回退缓存首页；
 * 带查询串的请求（如配置版本轮询）一律走网络，保证热更新可感知。
 */
const CACHE_NAME = 'byusi-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/no-js-warning.css',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirstWithRefresh(request) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 带查询串的请求（版本轮询、缓存穿透等）不缓存，直接走网络
  if (url.search) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          const cache = await caches.open(CACHE_NAME);
          cache.put('/', response.clone());
          return response;
        } catch (error) {
          const cached = await caches.match('/');
          if (cached) return cached;
          throw error;
        }
      })(),
    );
    return;
  }

  event.respondWith(cacheFirstWithRefresh(request));
});
