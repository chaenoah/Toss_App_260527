import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "morningok",
  brand: {
    displayName: "출근오케이",
    primaryColor: "#3182f6",
    icon: "https://static.toss.im/appsintoss/43957/a60ca5aa-2edc-4e11-94f2-7cdbbd7cea43.png",
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
