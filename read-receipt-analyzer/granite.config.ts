import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "ghostcheck", // 앱인토스 콘솔에 등록한 appName과 동일해야 함
  brand: {
    displayName: "답장 판독기", // 콘솔 표시명과 동일
    primaryColor: "#3182F6", // 토스 블루 (앱 내 포인트 색과 통일)
    icon: "https://static.toss.im/appsintoss/43957/f903cf6b-8dd3-4aab-a93f-c6cb124bec17.png",
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
