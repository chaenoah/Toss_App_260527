import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "캥거루족_시급_계산기",
  brand: {
    displayName: "캥거루족 시급 계산기",
    primaryColor: "#FF6B2B",
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
