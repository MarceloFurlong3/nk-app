// ═══════════════════════════════════════════════════════════════
// NK DISTRIBUCIONES — sw.js
// Service Worker: cachea los archivos para que funcione offline
// ═══════════════════════════════════════════════════════════════

const CACHE_NAME = 'nk-app-v1';

// Archivos que se cachean al instalar
const ARCHIVOS = [
  './',
  './index.html',
  './shared.js',
  './manifest.json',
  './views/remito.js',
  './views/editor.js',
  './views/panel.js',
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap'
];

// Instalar: cachear todos los archivos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// Activar: borrar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache first para archivos propios, network first para Apps Script
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Las llamadas al Apps Script siempre van a la red (datos en tiempo real)
  if (url.includes('script.google.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{"error":"sin conexión"}', { headers: {'Content-Type':'application/json'} })));
    return;
  }

  // Para todo lo demás: cache first, si no hay red usa cache
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Solo cachear respuestas válidas
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const copia = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
        return response;
      });
    })
  );
});
