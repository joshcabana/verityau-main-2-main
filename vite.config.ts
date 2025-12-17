import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html when building
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
            return "react-vendor";
          }
          // UI libraries
          if (id.includes("@radix-ui") || id.includes("framer-motion") || id.includes("lucide-react")) {
            return "ui-vendor";
          }
          // Data fetching
          if (id.includes("@tanstack/react-query") || id.includes("@supabase")) {
            return "data-vendor";
          }
          // Form libraries
          if (id.includes("react-hook-form") || id.includes("zod") || id.includes("@hookform")) {
            return "form-vendor";
          }
          // Date/calendar libraries
          if (id.includes("date-fns") || id.includes("react-day-picker")) {
            return "date-vendor";
          }
          // Charts and visualization
          if (id.includes("recharts") || id.includes("canvas-confetti")) {
            return "chart-vendor";
          }
          // Large utility libraries
          if (id.includes("cmdk") || id.includes("embla-carousel")) {
            return "utils-vendor";
          }
        },
      },
    },
    // Increase chunk size warning limit (optional, helps with large vendor chunks)
    chunkSizeWarningLimit: 1000,
    // Use esbuild for minification (faster, built-in)
    minify: "esbuild",
    // Configure esbuild for production
    target: "es2020",
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@tanstack/react-query",
    ],
  },
}));
