var APP_PREFIX = "citeease-";
var VERSION = "v1";
var CACHE_NAME = APP_PREFIX + VERSION;
var URLS = ["/citeease/", "/citeease/index.html", "/citeease/static/js/bundle.js", "/citeease/manifest.json"];

var self = this;

// Respond with cached resources
self.addEventListener("fetch", function (event) {
    console.log("fetch request : " + event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (request) {
            if (request) {
                // if cache is available, respond with cache
                console.log("responding with cache : " + event.request.url);
                return request;
            } else {
                // if there are no cache, try fetching request
                console.log("file is not cached, fetching : " + event.request.url);
                return fetch(event.request);
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    );
});

// Cache resources
self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("installing cache : " + CACHE_NAME);
            return cache.addAll(URLS);
        })
    );
});

// Delete outdated caches
self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create white list
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            // add current cache name to white list
            cacheWhitelist.push(CACHE_NAME);

            return Promise.all(
                keyList.map(function (key, index) {
                    if (cacheWhitelist.indexOf(key) === -1) {
                        console.log("deleting cache : " + keyList[index]);
                        return caches.delete(keyList[index]);
                    }
                })
            );
        })
    );
});
