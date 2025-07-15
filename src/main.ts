import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia,{status,userStore} from 'juejin-state';
const app = createApp(App)

app.use(router)
 
 app.use(pinia) 
app.mount('#app')
