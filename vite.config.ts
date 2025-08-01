import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import postcssPxtorem from 'postcss-pxtorem'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    base: './',
    build: {
      cssCodeSplit: false,   
      outDir: 'dist',
      rollupOptions: {
        external: (id) => {
          // 在生产构建时完全排除模拟数据和测试相关的文件
          if (isProduction) {
            return id.includes('moni.ts') || 
                   id.includes('moni.js') ||
                   id.includes('jsons.json') ||
                   id.includes('test-mock') ||
                   id.includes('servers-222') ||
                   id.includes('/moni') ||
                   id.endsWith('moni')
          }
          return false
        },
        output: {
          // 移除 manualChunks 中的 moni.ts 处理，避免在生产环境中包含
          manualChunks: (id) => {
            // 在生产环境中不处理 moni.ts 相关的分块
            if (!isProduction && id.includes('moni.ts')) {
              return 'mock-service';
            }
          }
        }
      }
    },
    define: {
      // 定义环境变量，用于在代码中判断是否启用模拟功能
      __ENABLE_MOCK__: !isProduction,
      // 添加生产环境标识
      __PRODUCTION__: isProduction
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
  }
})
