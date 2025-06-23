import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import postcssPxtorem from 'postcss-pxtorem'
// https://vitejs.dev/config/
export default defineConfig({
  base: '/h5AiWeb/',
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    outDir: 'h5AiWeb', // 新增：指定输出目录为view
  },
  server: {
    fs: {
      strict: false,
    },
    hmr: {
      overlay: false,
    },
    open: true,
    cors: true,
    host: true, // 设置为 true 将监听所有地址，包括局域网和公网地址
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@img': fileURLToPath(new URL('./src/assets/img', import.meta.url)),
    },
  },

  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
        postcssPxtorem({
          rootValue: 16, // 设计稿尺寸 1rem大小
          propList: ['*'], // 需要转换的属性，这里选择全部都进行转换
        }),
      ],
    },
  },
})
