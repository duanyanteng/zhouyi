const CACHE = 'qkyd-v8';
const ASSET_VERSION = '20260618-3';
const PRECACHE = [
  'index.html',
  'style.css?v=20260618-3',
  `css/base.css?v=20260602-1`,
  `css/components.css?v=20260602-1`,
  `css/panels.css?v=${ASSET_VERSION}`,
  `js/app.js?v=${ASSET_VERSION}`,
  `js/state.js?v=${ASSET_VERSION}`,
  `js/utils.js?v=${ASSET_VERSION}`,
  `js/gua-data.js?v=${ASSET_VERSION}`,
  `js/calendar.js?v=${ASSET_VERSION}`,
  `js/bazi.js?v=${ASSET_VERSION}`,
  `js/liuyao.js?v=${ASSET_VERSION}`,
  `js/fengshui.js?v=${ASSET_VERSION}`,
  `js/chat.js?v=${ASSET_VERSION}`,
  `js/xingming.js?v=${ASSET_VERSION}`,
  `js/meihua.js?v=${ASSET_VERSION}`,
  `js/hehun.js?v=${ASSET_VERSION}`,
  `js/ziwei.js?v=${ASSET_VERSION}`,
  `js/hepan.js?v=${ASSET_VERSION}`,
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
