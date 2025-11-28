import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  // history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'Home',
      component: () => import('../views/home/home.vue'),
      meta: {
        title: '法务智能助手平台',
      },
    },
    {
      path: '/legalResearchSmartAnswer',
      name: 'LegalResearchSmartAnswer',
      component: () => import('../views/legalResearchSmartAnswer/legalResearchSmartAnswer.vue'),
      meta: {
        title: '法研智答',
      },
    },
    {
      path: '/legalResearchSmartAnswe2',
      name: 'legalResearchSmartAnswe2',
      component: () => import('../views/legalResearchSmartAnswe2/legal.vue'),
      meta: {
        title: '法研智答',
      },
    },
    {
      path: '/acrossTheEntireNetwork',
      name: 'AcrossTheEntireNetwork',
      component: () => import('../views/acrossTheEntireNetwork/acrossTheEntireNetwork.vue'),
      meta: {
        title: '全网搜索问答',
      },
    },
    {
      path: '/lawsAndRegulations',
      name: 'LawsAndRegulations',
      component: () => import('../views/lawsAndRegulations/lawsAndRegulations.vue'),
      meta: {
        title: '法律法规',
      },
    },
    {
      path: '/legalDocumentWriting',
      name: 'LegalDocumentWriting',
      component: () => import('../views/legalDocumentWriting/legalDocumentWriting.vue'),
      meta: {
        title: '法律文书写作-提供最专业的法律文书写作',
      },
    },
    {
      path: '/bigDataVictoryAssessmentReport',
      name: 'BigDataVictoryAssessmentReport',
      component: () =>
        import('../views/bigDataVictoryAssessmentReport/bigDataVictoryAssessmentReport.vue'),
      meta: {
        title: '大数据胜诉评估报告-为原告方提供诉讼、抗辩策略',
      },
    },
    {
      path: '/litigationStrategyGeneration',
      name: 'LitigationStrategyGeneration',
      component: () =>
        import('../views/litigationStrategyGeneration/litigationStrategyGeneration.vue'),
      meta: {
        title: '诉讼策略生成-为原告方提供诉讼、抗辩策略',
      },
    },
    {
      path: '/litigationStrategy',
      name: 'LitigationStrategy',
      component: () => import('../views/litigationStrategy/litigationStrategy.vue'),
      meta: {
        title: '法律分析意见-诉讼策略',
      },
    },
    {
      path: '/defenseStrategy',
      name: 'DefenseStrategy',
      component: () => import('../views/defenseStrategy/defenseStrategy.vue'),
      meta: {
        title: '法律分析意见-抗辩策略',
      },
    },
    {
      path: '/administrativeLawEnforcementAssistant',
      name: 'AdministrativeLawEnforcementAssistant',
      component: () =>
        import(
          '../views/administrativeLawEnforcementAssistant/administrativeLawEnforcementAssistant.vue'
        ),
      meta: {
        title: '行政执法助手-为执法部门提供行政执法辅助建议',
      },
    },
    {
      path: '/administrativePenaltyAssistance',
      name: 'AdministrativePenaltyAssistance',
      component: () =>
        import('../views/administrativePenaltyAssistance/administrativePenaltyAssistance.vue'),
      meta: {
        title: '行政处罚辅助-为执法部门提供行政执法辅助建议',
      },
    },
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
