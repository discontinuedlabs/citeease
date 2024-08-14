/* eslint-disable no-restricted-globals, no-underscore-dangle */

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

self.skipWaiting();
clientsClaim();

precacheAndRoute([...self.__WB_MANIFEST]);

// precacheAndRoute([...self.__WB_MANIFEST, { url: "/**", revision: "" }], {
//     directoryIndex: `${import.meta.env.VITE_PUBLIC_URL}/index.html`,
//     fallbackFromNetwork: true,
// });

const fileExtensionRegexp = /[^?/]+\.[^/]+$/;

registerRoute(
    ({ request, url }) => {
        if (request.mode !== "navigate") return false;

        if (url.pathname.startsWith("/_")) return false;

        if (url.pathname.match(fileExtensionRegexp)) return false;

        return true;
    },
    createHandlerBoundToURL(`${import.meta.env.VITE_PUBLIC_URL}/index.html`)
);

registerRoute(
    ({ url }) => url.pathname.startsWith("index"),
    new NetworkFirst({
        cacheName: "main-js",
        plugins: [
            new ExpirationPlugin({
                maxEntries: 10,
            }),
        ],
    })
);

registerRoute(
    ({ url }) => {
        const path = url.pathname.split("/");
        const lastSegment = path[path.length - 1];
        return url.origin === self.location.origin && ["png", "jpg", "jpeg", "svg"].includes(lastSegment);
    },
    new StaleWhileRevalidate({
        cacheName: "images",
        plugins: [new ExpirationPlugin({ maxEntries: 50 })],
    })
);
