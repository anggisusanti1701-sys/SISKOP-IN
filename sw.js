/* Service worker sederhana: hanya menyimpan "cangkang" aplikasi.
   Data laporan (Google Apps Script) TIDAK pernah disimpan di perangkat. */
const CACHE = 'siskopin-v1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Hanya tangani GET milik situs sendiri; permintaan ke Apps Script dibiarkan lewat
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  // Utamakan versi terbaru dari internet; pakai simpanan bila offline
  e.respondWith(
    fetch(req).then(res => {
      const salinan = res.clone();
      caches.open(CACHE).then(c => c.put(req, salinan));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
