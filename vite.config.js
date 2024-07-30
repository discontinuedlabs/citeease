import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
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
            VitePWA({
                registerType: "autoUpdate",
                devOptions: {
                    enabled: true,
                },
            }),
        ],
    };
});
