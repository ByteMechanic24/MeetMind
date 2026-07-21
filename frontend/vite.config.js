import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxies /api/* to the FastAPI backend during local dev so the frontend
// can just call fetch("/api/...") with no CORS setup and no hardcoded host.
// Run the backend first: uvicorn api:app --reload --port 8000
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8010",
        changeOrigin: true,
      },
    },
  },
});
