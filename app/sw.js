/* Funcionamiento sin conexión: primero la red (para tener siempre la última versión) y, si no hay, la copia guardada. */
const CACHE = 'mi-rodilla-v4'; /* el prefijo es interno (nombre antiguo de la app); solo se sube el número */
const ARCHIVOS = ['./', './index.html', './estilos.css', './app.js', './protocolo.js', './aprender.js', './manifest.webmanifest', './iconos/icono-192.png', './iconos/icono-180.png', './iconos/icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then(r => { if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); } return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
