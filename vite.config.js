import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

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

        plugins: [react(), eslint()],
    };
});
