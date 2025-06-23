import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Html5Qrcode from '../components/html5Qrcode/html5Qrcode.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/qrcode',
      name: 'Html5Qrcode',
      component: Html5Qrcode,
    },
  ],
})
export default router
//# sourceMappingURL=index.js.map
