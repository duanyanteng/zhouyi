const CACHE = 'qkyd-v5';
const PRECACHE = [
  'index.html',
  'style.css?v=20260527-3',
  'js/app.js?v=20260527-3',
  'js/state.js',
  'js/utils.js',
  'js/calendar.js',
  'js/bazi.js',
  'js/liuyao.js',
  'js/fengshui.js',
  'js/chat.js',
  'js/xingming.js',
  'js/meihua.js',
  'js/hehun.js',
  'js/ziwei.js',
  'images/bg.png',
  'manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    )).then(() => clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('离线', {status:503})))
  );
});
