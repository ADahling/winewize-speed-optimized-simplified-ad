// vite.config.ts
import { defineConfig } from "file:///Users/kristimayfield/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/WINE%20WIZE/GitHub%20Downloads/CURSOR/winewize-speed-optimized-simplified/node_modules/vite/dist/node/index.js";
import react from "file:///Users/kristimayfield/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/WINE%20WIZE/GitHub%20Downloads/CURSOR/winewize-speed-optimized-simplified/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///Users/kristimayfield/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/WINE%20WIZE/GitHub%20Downloads/CURSOR/winewize-speed-optimized-simplified/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "/Users/kristimayfield/Library/Mobile Documents/com~apple~CloudDocs/WINE WIZE/GitHub Downloads/CURSOR/winewize-speed-optimized-simplified";
var vite_config_default = defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    host: "::",
    port: 8080,
    headers: {
      "Content-Security-Policy": "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; img-src 'self' https: data: blob:; connect-src 'self' https: wss:;"
    }
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core dependencies
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Supabase client
          "vendor-supabase": ["@supabase/supabase-js"],
          // UI libraries
          "vendor-ui": ["lucide-react", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          // Utilities
          "vendor-utils": ["zod"],
          "vendor-query": ["@tanstack/react-query"]
        },
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split(".").at(1) || "asset";
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = "img";
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js"
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@supabase/supabase-js"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMva3Jpc3RpbWF5ZmllbGQvTGlicmFyeS9Nb2JpbGUgRG9jdW1lbnRzL2NvbX5hcHBsZX5DbG91ZERvY3MvV0lORSBXSVpFL0dpdEh1YiBEb3dubG9hZHMvQ1VSU09SL3dpbmV3aXplLXNwZWVkLW9wdGltaXplZC1zaW1wbGlmaWVkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMva3Jpc3RpbWF5ZmllbGQvTGlicmFyeS9Nb2JpbGUgRG9jdW1lbnRzL2NvbX5hcHBsZX5DbG91ZERvY3MvV0lORSBXSVpFL0dpdEh1YiBEb3dubG9hZHMvQ1VSU09SL3dpbmV3aXplLXNwZWVkLW9wdGltaXplZC1zaW1wbGlmaWVkL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9rcmlzdGltYXlmaWVsZC9MaWJyYXJ5L01vYmlsZSUyMERvY3VtZW50cy9jb20lN0VhcHBsZSU3RUNsb3VkRG9jcy9XSU5FJTIwV0laRS9HaXRIdWIlMjBEb3dubG9hZHMvQ1VSU09SL3dpbmV3aXplLXNwZWVkLW9wdGltaXplZC1zaW1wbGlmaWVkL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjo6XCIsXG4gICAgcG9ydDogODA4MCxcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ29udGVudC1TZWN1cml0eS1Qb2xpY3knOiBcImRlZmF1bHQtc3JjICdzZWxmJyBodHRwczogZGF0YTogJ3Vuc2FmZS1pbmxpbmUnICd1bnNhZmUtZXZhbCc7IGltZy1zcmMgJ3NlbGYnIGh0dHBzOiBkYXRhOiBibG9iOjsgY29ubmVjdC1zcmMgJ3NlbGYnIGh0dHBzOiB3c3M6O1wiLFxuICAgIH1cbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMjAnLFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgLy8gUmVhY3QgYW5kIGNvcmUgZGVwZW5kZW5jaWVzXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICAvLyBTdXBhYmFzZSBjbGllbnRcbiAgICAgICAgICAndmVuZG9yLXN1cGFiYXNlJzogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcbiAgICAgICAgICAvLyBVSSBsaWJyYXJpZXNcbiAgICAgICAgICAndmVuZG9yLXVpJzogWydsdWNpZGUtcmVhY3QnLCAnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudSddLFxuICAgICAgICAgIC8vIFV0aWxpdGllc1xuICAgICAgICAgICd2ZW5kb3ItdXRpbHMnOiBbJ3pvZCddLFxuICAgICAgICAgICd2ZW5kb3ItcXVlcnknOiBbJ0B0YW5zdGFjay9yZWFjdC1xdWVyeSddLFxuICAgICAgICB9LFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgIGxldCBleHRUeXBlID0gYXNzZXRJbmZvLm5hbWU/LnNwbGl0KCcuJykuYXQoMSkgfHwgJ2Fzc2V0JztcbiAgICAgICAgICBpZiAoL3BuZ3xqcGU/Z3xzdmd8Z2lmfHRpZmZ8Ym1wfGljby9pLnRlc3QoZXh0VHlwZSkpIHtcbiAgICAgICAgICAgIGV4dFR5cGUgPSAnaW1nJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvJHtleHRUeXBlfS9bbmFtZV0tW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgfSxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJywgJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcyddLFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvbEIsU0FBUyxvQkFBb0I7QUFDam5CLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUFpQixnQkFBZ0I7QUFBQSxFQUM1QyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLDJCQUEyQjtBQUFBLElBQzdCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsdUJBQXVCO0FBQUEsSUFDdkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBO0FBQUEsVUFFWixnQkFBZ0IsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUE7QUFBQSxVQUV6RCxtQkFBbUIsQ0FBQyx1QkFBdUI7QUFBQTtBQUFBLFVBRTNDLGFBQWEsQ0FBQyxnQkFBZ0IsMEJBQTBCLCtCQUErQjtBQUFBO0FBQUEsVUFFdkYsZ0JBQWdCLENBQUMsS0FBSztBQUFBLFVBQ3RCLGdCQUFnQixDQUFDLHVCQUF1QjtBQUFBLFFBQzFDO0FBQUEsUUFDQSxnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGNBQUksVUFBVSxVQUFVLE1BQU0sTUFBTSxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUs7QUFDbEQsY0FBSSxrQ0FBa0MsS0FBSyxPQUFPLEdBQUc7QUFDbkQsc0JBQVU7QUFBQSxVQUNaO0FBQ0EsaUJBQU8sVUFBVSxPQUFPO0FBQUEsUUFDMUI7QUFBQSxRQUNBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsb0JBQW9CLHVCQUF1QjtBQUFBLEVBQzdFO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
