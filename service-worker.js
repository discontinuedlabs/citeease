var GHPATH = "/citeease";
var APP_PREFIX = "citeease_";
var VERSION = "v1";
var URLS = [
    `${GHPATH}/`,
    `${GHPATH}/index.html`,
    `${GHPATH}/static/js/main.chunk.js`,
    `${GHPATH}/static/js/bundle.js`,
    `${GHPATH}/static/js/0.chunk.js`,
    `${GHPATH}/static/css/main.1fe0c195.css`,
    `${GHPATH}/static/js/main.0fa6b5ab.js`,
];

var CACHE_NAME = APP_PREFIX + VERSION;
self.addEventListener("fetch", function (e) {
    console.log("Fetch request : " + e.request.url);
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log("Responding with cache : " + e.request.url);
                return request;
            } else {
                console.log("File is not cached, fetching : " + e.request.url);
                return fetch(e.request);
            }
        })
    );
});

self.addEventListener("install", function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Installing cache : " + CACHE_NAME);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener("activate", function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheWhitelist.push(CACHE_NAME);
            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheWhitelist.indexOf(key) === -1) {
                        console.log("Deleting cache : " + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});
