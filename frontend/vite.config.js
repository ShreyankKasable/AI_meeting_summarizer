import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Absolute imports are resolved from `src` (e.g. `import Button from "common/components/Button"`).
const fromSrc = (dir) => path.resolve(__dirname, "src", dir);

export default defineConfig(() => {
    return {
        plugins: [react({ include: /\.(js|jsx)$/ })],
        esbuild: {
            loader: "jsx",
            include: /src\/.*\.jsx?$/,
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                loader: { ".js": "jsx" },
            },
        },
        resolve: {
            alias: {
                common: fromSrc("common"),
                pages: fromSrc("pages"),
                services: fromSrc("services"),
                GlobalStyle: fromSrc("GlobalStyle.js"),
            },
        },
        server: {
            hmr: process.env.DISABLE_HMR !== "true",
            watch: process.env.DISABLE_HMR === "true" ? null : {},
            // Dev: proxy /api to the Express backend so the frontend can use
            // same-origin paths. Override with VITE_API_PROXY.
            proxy: {
                "/api": {
                    target: process.env.VITE_API_PROXY || "http://localhost:5000",
                    changeOrigin: true,
                },
                "/socket.io": {
                    target: process.env.VITE_API_PROXY || "http://localhost:5000",
                    changeOrigin: true,
                    ws: true,
                },
            },
        },
    };
});
