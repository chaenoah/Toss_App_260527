import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "aircon-fee-simulator",
  brand: {
    displayName: "에어컨 요금 시뮬레이터", // 화면에 노출될 앱의 한글 이름
    primaryColor: "#4DD0E1", // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "", // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
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
