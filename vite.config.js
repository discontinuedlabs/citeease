import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => {
    return {
        base: "/citeease",

        build: {
            outDir: "build",
            assetsDir: ".",
        },
        plugins: [react()],
    };
});
