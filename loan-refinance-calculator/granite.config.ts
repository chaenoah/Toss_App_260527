import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "loan-refinance-calculator",
  brand: {
    displayName: "대출 갈아타기 손익계산기",
    primaryColor: "#3182F6",
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
