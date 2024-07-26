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
                // workbox: {
                //     clientsClaim: true,
                //     skipWaiting: true,
                // },
                devOptions: {
                    enabled: true,
                },
            }),
        ],
    };
});
