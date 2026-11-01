import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // статический экспорт в папку out/ для обычного хостинга (Beget)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // cacheComponents и partialPrefetching несовместимы с output: "export"
  turbopack: {
    // в домашней папке лежит посторонний package-lock.json, без root Next выбирает её
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
