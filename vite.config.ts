import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const geocoderBaseUrl = env.GEOCODER_BASE_URL;

  return {
    plugins: [tailwindcss(), react()],
    server: geocoderBaseUrl ? {
      proxy: {
        "/api/geocode": {
          changeOrigin: true,
          headers: { "User-Agent": env.GEOCODER_USER_AGENT || "TransHub-Jabodetabek" },
          rewrite: (path) => `${path.replace(/^\/api\/geocode/, "/search")}&format=jsonv2&addressdetails=1&limit=6&countrycodes=id&viewbox=106.35%2C-5.85%2C107.35%2C-6.85`,
          target: geocoderBaseUrl,
        },
      },
    } : undefined,
  };
});
