import '../assets/main.css'
import { createApp } from 'vue'
import App from '../App.vue'
import router from '../router'
import pinia from 'juejin-state'

if (location.hash !== '#/home') {
  location.hash = '#/home'
}

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
