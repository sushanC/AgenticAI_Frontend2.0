import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",
  plugins: [react()],

  build: {
    rollupOptions: {
      input: {
        // Main application entry
        main: path.resolve(__dirname, "index.html"),
        // Quick Ask floating window (separate Electron BrowserWindow)
        quickask: path.resolve(__dirname, "quickask.html"),
      },
    },
  },
});