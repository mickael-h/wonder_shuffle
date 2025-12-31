import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    host: "0.0.0.0", // Explicitly bind to all interfaces (needed for WSL2)
    strictPort: false,
  },
});
