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
      meta: {
        title: '法研智答'
      }
    },
    {
      path: '/acrossTheEntireNetwork',
      name: 'AcrossTheEntireNetwork',
      component: AcrossTheEntireNetwork,
      meta: {
        title: '法务助手 - 全网搜索问答'
      }
    },
    // 全网搜索问答
  ],
})

// 全局路由守卫，用于动态更新页面title
router.beforeEach((to, from, next) => {
  // 如果路由有meta.title，则更新页面title
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})

export default router
