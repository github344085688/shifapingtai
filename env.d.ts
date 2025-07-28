/// <reference types="vite/client" />

// 扩展Vue Router的RouteMeta接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    [key: string]: any
  }
}