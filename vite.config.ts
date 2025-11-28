import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

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
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          home: resolve(__dirname, 'home.html'),
          legalResearchSmartAnswer: resolve(__dirname, 'legalResearchSmartAnswer.html'),
          legalResearchSmartAnswe2: resolve(__dirname, 'legalResearchSmartAnswe2.html'),
          acrossTheEntireNetwork: resolve(__dirname, 'acrossTheEntireNetwork.html'),
          lawsAndRegulations: resolve(__dirname, 'lawsAndRegulations.html'),
          legalDocumentWriting: resolve(__dirname, 'legalDocumentWriting.html'),
          bigDataVictoryAssessmentReport: resolve(__dirname, 'bigDataVictoryAssessmentReport.html'),
          litigationStrategyGeneration: resolve(__dirname, 'litigationStrategyGeneration.html'),
          litigationStrategy: resolve(__dirname, 'litigationStrategy.html'),
          defenseStrategy: resolve(__dirname, 'defenseStrategy.html'),
          administrativeLawEnforcementAssistant: resolve(
            __dirname,
            'administrativeLawEnforcementAssistant.html',
          ),
          administrativePenaltyAssistance: resolve(
            __dirname,
            'administrativePenaltyAssistance.html',
          ),
        },
        external: (id) => {
          if (isProduction) {
            return (
              id.includes('moni.ts') ||
              id.includes('moni.js') ||
              id.includes('jsons.json') ||
              id.includes('test-mock') ||
              id.includes('servers-222') ||
              id.includes('/moni') ||
              id.endsWith('moni')
            )
          }
          return false
        },
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            vendor: ['juejin-state', 'juejin-puts'],
            libs: ['mammoth', 'html5-qrcode'],
          },
        },
      },
    },
    define: {
      __ENABLE_MOCK__: !isProduction,
      __PRODUCTION__: isProduction,
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
