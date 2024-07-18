/* eslint-disable no-restricted-globals, no-underscore-dangle, import/no-unresolved, import/extensions */

import { clientsClaim } from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-core.prod.js";
import { ExpirationPlugin } from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-expiration.prod.js";
import {
    precacheAndRoute,
    createHandlerBoundToURL,
} from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-precaching.prod.js";
import { registerRoute } from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-routing.prod.js";
import { StaleWhileRevalidate } from "https://storage.googleapis.com/workbox-cdn/releases/6.4.2/workbox-strategies.prod.js";

clientsClaim();

precacheAndRoute([...self.__WB_MANIFEST]);

const fileExtensionRegexp = /[^?/]+\.[^/]+$/;

registerRoute(
    ({ request, url }) => {
        if (request.mode !== "navigate") {
            return false;
        }

        if (url.pathname.startsWith("/_")) {
            return false;
        }

        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        }

        return true;
    },
    createHandlerBoundToURL(`${import.meta.env.VITE_PUBLIC_URL}/index.html`)
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

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});
