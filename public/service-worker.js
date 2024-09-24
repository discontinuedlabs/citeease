importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.5.3/workbox-sw.js");

const { core, routing, strategies, cacheableResponse, expiration } = workbox;

const { clientsClaim } = core;
const { registerRoute } = routing;
const { NetworkFirst, CacheFirst, StaleWhileRevalidate } = strategies;
const { CacheableResponsePlugin } = cacheableResponse;
const { ExpirationPlugin } = expiration;

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

clientsClaim();

registerRoute(
    ({ request }) => request.mode === "navigate",
    new NetworkFirst({
        cacheName: "pages",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    })
);

registerRoute(
    ({ request }) =>
        request.destination === "style" || request.destination === "script" || request.destination === "worker",
    new StaleWhileRevalidate({
        cacheName: "assets",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
        ],
    })
);

registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
        cacheName: "images",
        plugins: [
            new CacheableResponsePlugin({
                statuses: [200],
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
            }),
        ],
    })
);
