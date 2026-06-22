import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // file:// 환경(다운로드 후 더블클릭)에서 동작하도록 단일 HTML 빌드
    ...(mode === 'singlefile' ? [viteSingleFile()] : []),
  ],
  build: mode === 'singlefile' ? {
    outDir: 'dist-single',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  } : undefined,
  server: { historyApiFallback: true },
}))
