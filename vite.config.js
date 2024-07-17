import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const { VITE_PUBLIC_URL } = loadEnv(mode, process.cwd());
    return {
        base: VITE_PUBLIC_URL,

        build: {
            outDir: "build",
            assetsDir: ".",
        },
        plugins: [react()],
    };
});
