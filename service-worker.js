/* eslint-disable no-restricted-globals */

const APP_PREFIX = "citeease_";
const VERSION = "v4";
const URLS = ["/citeease/", "/citeease/index.html", "/citeease/*"];
const CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener("fetch", function (event) {
    console.log("Fetch request : " + event.request.url);
    event.respondWith(
        caches.match(event.request).then(function (request) {
            if (request) {
                console.log("Responding with cache : " + event.request.url);
                return request;
            } else {
                console.log("File is not cached, fetching : " + event.request.url);
                return fetch(event.request);
            }
        })
    );
});

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log("Installing cache : " + CACHE_NAME);
            return cache.addAll(URLS);
        })
    );
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
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
                    } else {
                        return Promise.resolve();
                    }
                })
            );
        })
    );
});
