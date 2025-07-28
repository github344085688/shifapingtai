import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AcrossTheEntireNetwork from '../views/acrossTheEntireNetwork/acrossTheEntireNetwork.vue'

const router = createRouter({
   history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/acrossTheEntireNetwork',
      name: 'AcrossTheEntireNetwork',
      component: AcrossTheEntireNetwork,
    },
    // 全网搜索问答
  ],
})

export default router
