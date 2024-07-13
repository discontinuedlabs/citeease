/* eslint-disable no-restricted-globals, no-underscore-dangle */

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";

clientsClaim();

precacheAndRoute([
    ...self.__WB_MANIFEST,
    "../assets/styles.json",
    `${process.env.PUBLIC_URL}/markdown/about.md`,
    `${process.env.PUBLIC_URL}/markdown/privacy.md`,
    `${process.env.PUBLIC_URL}/markdown/terms.md`,
]);

const fileExtensionRegexp = /[^?/]+\.[^/]+$/;

registerRoute(
    // Return false to exempt requests from being fulfilled by index.html.
    ({ request, url }) => {
        // If this isn't a navigation, skip.
        if (request.mode !== "navigate") {
            return false;
        } // If this is a URL that starts with /_, skip.

        if (url.pathname.startsWith("/_")) {
            return false;
        } // If this looks like a URL for a resource, because it contains // a file extension, skip.

        if (url.pathname.match(fileExtensionRegexp)) {
            return false;
        } // Return true to signal that we want to use the handler.

        return true;
    },
    createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`)
);

registerRoute(
    ({ url }) => url.origin === self.location.origin && url.pathname.endsWith(/\.(png|jpg|jpeg|svg)$/),
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
