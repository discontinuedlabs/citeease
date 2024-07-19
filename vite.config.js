import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
    const { VITE_PUBLIC_URL } = loadEnv(mode, process.cwd());
    return {
        server: {
            port: 3000,
        },

        base: VITE_PUBLIC_URL,

        build: {
            outDir: "build",
            assetsDir: ".",
        },
        plugins: [
            react(),
            VitePWA({
                registerType: "autoUpdate",
                workbox: {
                    clientsClaim: true,
                    skipWaiting: true,
                },
                devOptions: {
                    enabled: true,
                },
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
                    theme_color: "#f6f8f9",
                    background_color: "#f6f8f9",
                },
            }),
        ],
    };
});
