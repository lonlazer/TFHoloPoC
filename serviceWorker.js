// Perform install steps
let cacheName = 'TFHoloPoC_Cache';
let contentToCache = [
    'https://aframe.io/releases/1.2.0/aframe.min.js',
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js',
    'https://cdn.aframe.io/fonts/mozillavr.fnt',
    'registerServiceWorker.js',
    'serviceWorker.js',
    'tfHoloPoc.js',
    'index.html',
    'imagenet-labels.js',
    'MobileNetV2/model.json',
    'MobileNetV2/group1-shard4of4.bin',
    'MobileNetV2/group1-shard3of4.bin',
    'MobileNetV2/group1-shard2of4.bin',
    'MobileNetV2/group1-shard1of4.bin'
];

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Install');
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(contentToCache);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        const r = await caches.match(e.request);
        console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
        if (r) { return r; }
        const response = await fetch(e.request);
        const cache = await caches.open(cacheName);
        console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
        cache.put(e.request, response.clone());
        return response;
    })());
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
});