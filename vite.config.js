import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirect requests that start with "/api" to the target server
      "/api": "http://localhost:8000",
    },
  },
});
