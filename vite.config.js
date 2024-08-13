import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
    return {
        server: {
            port: 3000,
        },

        base: "/citeease/",

        build: {
            outDir: "build",
            assetsDir: ".",
        },

        plugins: [
            react(),
            eslint(),
            VitePWA({
                strategies: "generateSW",
                registerType: "autoUpdate",
                injectRegister: true,
                pwaAssets: { disabled: false, config: true, htmlPreset: "2023", overrideManifestIcons: true },
                manifest: {
                    short_name: "CiteEase",
                    name: "CiteEase: Your Citation Companion",
                    description:
                        "CiteEase is a powerful and user-friendly open-source citation management app designed for students, researchers, and anyone who values efficiency and organization.",
                    icons: [
                        {
                            src: "/citeease/favicon.ico",
                            sizes: "64x64 32x32 24x24 16x16",
                            type: "image/x-icon",
                        },
                        {
                            src: "/citeease/images/favicons/android-chrome-192x192.png",
                            sizes: "192x192",
                            type: "image/png",
                        },
                        {
                            src: "/citeease/images/favicons/android-chrome-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                        },
                    ],
                    scope: "/citeease/",
                    start_url: "/citeease/",
                    display: "standalone",
                    orientation: "portrait",
                    theme_color: "#ffffff",
                    background_color: "#ffffff",
                },
                workbox: {
                    globPatterns: ["**/*.{js,css,html,svg,png,svg,ico}"],
                    cleanupOutdatedCaches: true,
                    clientsClaim: true,
                },
                injectManifest: {
                    globPatterns: ["**/*.{js,css,html,svg,png,svg,ico}"],
                },
                devOptions: {
                    enabled: true,
                },
            }),
        ],
    };
});
