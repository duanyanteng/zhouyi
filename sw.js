const CACHE = 'qkyd-v5.0';
const ASSET_VERSION = '20260624-2';
const PRECACHE = [
    'index.html',
    'share.html',
    'style.css?v=20260624-2',
    'css/base.css?v=20260624-2',
    'css/components.css?v=20260624-2',
    'css/panels.css?v=20260624-2',
    `js/app.js?v=${ASSET_VERSION}`,
    `js/state.js?v=${ASSET_VERSION}`,
    `js/utils.js?v=${ASSET_VERSION}`,
    `js/gua-data.js?v=${ASSET_VERSION}`,
    `js/calendar.js?v=${ASSET_VERSION}`,
    `js/bazi.js?v=${ASSET_VERSION}`,
    `js/liuyao.js?v=${ASSET_VERSION}`,
    `js/fengshui.js?v=${ASSET_VERSION}`,
    `js/fengshui-advanced.js?v=${ASSET_VERSION}`,
    `js/chat.js?v=${ASSET_VERSION}`,
    `js/xingming.js?v=${ASSET_VERSION}`,
    `js/meihua.js?v=${ASSET_VERSION}`,
    `js/hehun.js?v=${ASSET_VERSION}`,
    `js/ziwei.js?v=${ASSET_VERSION}`,
    `js/hepan.js?v=${ASSET_VERSION}`,
    `js/shuzi.js?v=${ASSET_VERSION}`,
    `js/qimen.js?v=${ASSET_VERSION}`,
    `js/export.js?v=${ASSET_VERSION}`,
    `js/settings.js?v=${ASSET_VERSION}`,
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
    // 只处理 GET 请求
    if (e.request.method !== 'GET') return;

    // 对于 CDN 资源，使用网络优先策略
    const url = new URL(e.request.url);
    if (url.hostname.includes('cdnjs.cloudflare.com') ||
        url.hostname.includes('cdn.jsdelivr.net') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
        e.respondWith(
            fetch(e.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return response;
            }).catch(() => caches.match(e.request))
        );
        return;
    }

    // 对于本地资源，使用缓存优先策略
    e.respondWith(
        caches.match(e.request).then(cached => {
            if (cached) {
                // 后台更新缓存
                fetch(e.request).then(response => {
                    if (response.ok) {
                        caches.open(CACHE).then(c => c.put(e.request, response));
                    }
                }).catch(() => {});
                return cached;
            }
            return fetch(e.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE).then(c => c.put(e.request, clone));
                }
                return response;
            }).catch(() => new Response('离线模式', { status: 503 }));
        })
    );
});
