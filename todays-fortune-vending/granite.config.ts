import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "todays-fortune-vending",
  brand: {
    displayName: "오늘의 재물운 자판기",
    primaryColor: "#F5A623", // 재물운을 상징하는 골드 컬러
    // TODO: 출시 전 실제 아이콘 이미지 주소로 교체하세요. (앱인토스 콘솔 업로드/정적 URL)
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
