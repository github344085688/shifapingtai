/// <reference types="vite/client" />

// 声明全局变量
declare const __ENABLE_MOCK__: boolean

// 扩展Vue Router的RouteMeta接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    [key: string]: any
  }
}