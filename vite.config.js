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
                strategies: "injectManifest",
                srcDir: "src",
                filename: "service-worker.js",
                registerType: "autoUpdate",
                devOptions: {
                    enabled: true,
                },
            }),
        ],
    };
});
