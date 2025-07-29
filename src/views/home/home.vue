<template>
  <div
    class="flex overflow-y-auto flex-col items-center p-4 min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 md:p-8"
  >
    <div class="px-4 mb-8 text-center text-white md:mb-12">
      <h1 class="mb-4 text-3xl font-bold drop-shadow-lg md:text-4xl xl:text-5xl">
        法务智能助手平台
      </h1>
      <p class="text-lg opacity-90 md:text-xl">专业的法律研究与智能问答系统</p>
    </div>

    <div class="w-full max-w-7xl">
      <div
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 xl:gap-8"
      >
        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/legalResearchSmartAnswer')"
        >
          <div class="mb-4 text-4xl">⚖️</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">法研智答</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            智能法律研究问答系统，提供专业的法律咨询服务
          </p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/acrossTheEntireNetwork')"
        >
          <div class="mb-4 text-4xl">🌐</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">全网搜索问答</h3>
          <p class="text-sm leading-relaxed text-gray-600">
            全网法务信息搜索，获取最新最全的法律资讯
          </p>
        </div>
        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/lawsAndRegulations')"
        >
          <div class="mb-4 text-4xl">📚</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">法律法规</h3>
          <p class="text-sm leading-relaxed text-gray-600">快速查询相关法律法规条文</p>
        </div>
        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/legalDocumentWriting')"
        >
          <div class="mb-4 text-4xl">📝</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">法律文书写作</h3>
          <p class="text-sm leading-relaxed text-gray-600">提供最专业的法律文书写作服务</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/litigationStrategyGeneration')"
        >
          <div class="mb-4 text-4xl">🎯</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">诉讼策略生成</h3>
          <p class="text-sm leading-relaxed text-gray-600">为原告方提供诉讼、抗辩策略</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/litigationStrategy')"
        >
          <div class="mb-4 text-4xl">⚔️</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">诉讼策略</h3>
          <p class="text-sm leading-relaxed text-gray-600">法律分析意见-诉讼策略</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/defenseStrategy')"
        >
          <div class="mb-4 text-4xl">🛡️</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">抗辩策略</h3>
          <p class="text-sm leading-relaxed text-gray-600">法律分析意见-抗辩策略</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/bigDataVictoryAssessmentReport')"
        >
          <div class="mb-4 text-4xl">📊</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">大数据胜诉评估</h3>
          <p class="text-sm leading-relaxed text-gray-600">为原告方提供诉讼、抗辩策略的数据支持</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/administrativeLawEnforcementAssistant')"
        >
          <div class="mb-4 text-4xl">🏛️</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">行政执法助手</h3>
          <p class="text-sm leading-relaxed text-gray-600">为执法部门提供行政执法辅助建议</p>
        </div>

        <div
          class="p-6 text-center bg-white rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          @click="navigateTo('/administrativePenaltyAssistance')"
        >
          <div class="mb-4 text-4xl">⚡</div>
          <h3 class="mb-3 text-lg font-semibold text-gray-800">行政处罚辅助</h3>
          <p class="text-sm leading-relaxed text-gray-600">为执法部门提供行政执法辅助建议</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path: string) => {
  // router.push(path)
  // alert(window.location)
  const fullUrl = window.location.href
  const hashIndex = fullUrl.indexOf('#')
  const url = fullUrl.substring(0, hashIndex + 1)
  // alert(url + path)
  // const url = window.location.origin + path
  window.open(url + path, '_blank')
}
</script>

<style scoped>
/* 使用 Tailwind CSS，无需自定义样式 */
</style>
