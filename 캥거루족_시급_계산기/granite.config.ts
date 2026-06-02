import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "backbreaker",
  brand: {
    displayName: "캥값",
    primaryColor: "#FF6B2B",
    icon: "https://static.toss.im/appsintoss/43957/da0b1816-baa0-4b08-a94e-0a34e9df196f.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
