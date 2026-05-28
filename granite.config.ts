import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "hangang-stock-rescue",
  brand: {
    displayName: "한강 수온 주식 구조대",
    primaryColor: "#655DFF",
    icon: "/appsintoss-logo.png",
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
