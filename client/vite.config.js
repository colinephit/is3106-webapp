import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Add this line
      include: "**/*.jsx",
    }),
  ],
  server: {
    proxy: {
      '/upload': 'http://localhost:4000',
    },
  },
});
