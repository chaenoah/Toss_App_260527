import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "airconbill",
  brand: {
    displayName: "에어컨 전기 요금 얼마?", // 콘솔 앱 정보등록 이름과 정확히 일치해야 함
    primaryColor: "#3182F6", // 앱 기본 색상 (앱 UI의 토스 블루와 통일)
    icon: "https://static.toss.im/appsintoss/43957/00f9dc3e-0a37-4ce1-aa45-f27cfb6094e0.png",
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
