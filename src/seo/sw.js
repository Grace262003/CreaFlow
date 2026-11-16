/* Service worker Creaflow : rend le site installable (Android, PC) et affiche une page claire hors connexion.
   HTML : réseau d'abord (les mises à jour du site sont immédiates). Fichiers à empreinte (main-XXXX.js…) : cache d'abord. L'API n'est jamais mise en cache. */
const V = 'cf-v1';
const CORE = ['/offline.html', '/assets/logo-wordmark.png', '/favicon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const HASHED = /-[A-Z0-9]{8}\.(js|css)$/;
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.startsWith('/api/') || u.pathname === '/sw.js') return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(() => caches.match('/offline.html')));
  } else if (HASHED.test(u.pathname) || /\.(png|jpg|jpeg|svg|ico|woff2?)$/.test(u.pathname)) {
    e.respondWith(caches.match(r).then((hit) => {
      const net = fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(V).then((c) => c.put(r, copy)); } return res; }).catch(() => hit);
      return hit && HASHED.test(u.pathname) ? hit : hit || net;
    }));
  }
});