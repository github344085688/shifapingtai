import '../assets/main.css'
import { createApp } from 'vue'
import App from '../App.vue'
import router from '../router'
import pinia from 'juejin-state'

if (location.hash !== '#/administrativePenaltyAssistance') {
  location.hash = '#/administrativePenaltyAssistance'
}

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
