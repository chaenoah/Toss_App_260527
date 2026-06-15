import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const proxyOptions = {
  '/proxy/data': {
    target: 'https://apis.data.go.kr',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/proxy\/data/, ''),
  },
  '/proxy/kakao': {
    target: 'https://dapi.kakao.com',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/proxy\/kakao/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: proxyOptions },
  preview: { proxy: proxyOptions },
});
