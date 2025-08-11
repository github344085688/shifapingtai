<template>
  <router-view />
</template>

<script setup lang="ts">
import { onErrorCaptured } from 'vue'

// 捕获子组件错误
onErrorCaptured((error, instance, info) => {
  console.error('Vue Error Captured:', error, info)
  return false
})

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global Error:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason)
})
</script>
