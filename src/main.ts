import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia, { status, userStore } from 'juejin-state'

const app = createApp(App)

// 确保正确的插件安装顺序
app.use(pinia)
app.use(router)

app.mount('#app')
