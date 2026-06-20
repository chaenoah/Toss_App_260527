import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "감정 자판기",
  brand: {
    displayName: "감정 자판기",
    primaryColor: "#1A1A1A",
    icon: "",
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
