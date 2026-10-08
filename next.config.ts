import type { NextConfig } from "next";
import { resolve } from "node:path";

const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

const nextConfig: NextConfig = {
  // Demo = fully static export for GitHub Pages; real site = standalone Node server.
  output: DEMO ? "export" : "standalone",
  ...(DEMO ? { basePath: process.env.NEXT_PUBLIC_BASE_PATH, trailingSlash: true } : {}),
  poweredByHeader: false,
  images: DEMO
    ? { loader: "custom", loaderFile: "./src/lib/image-loader.ts" }
    : {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1600, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  serverExternalPackages: ["node:sqlite"],
  turbopack: {
    root: resolve(process.cwd()),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
