import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "open-now",
  brand: {
    displayName: "밤에 아플때",
    primaryColor: "#3182f6",
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
  permissions: [{ name: "geolocation", access: "access" }],
  outdir: "dist",
});
