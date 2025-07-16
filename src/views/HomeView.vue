<template>
  <div class="w-full h-full pb-[64px] bg-gray-50">
    <div class="max-w-[600px] mx-auto p-2.5 bg-gray-50">
      <div
        class="flex items-center bg-gradient-to-r from-[#e23338] via-[#f04b4e] to-[#e23338] bg-cover bg-center p-[10px_15px] mt-5 rounded-t-xl"
      >
        <!-- <div class="w-[70px] h-[40px] relative mr-[15px]">
          <div class="absolute top-[-30px] left-0 w-[100px]">
            <img src="@img/logo.png" mode="widthFix" alt="" class="object-contain w-full h-auto" />
          </div>
        </div> -->
        <div class="text-[#ffffff] text-lg flex justify-center w-full font-bold">
          Hi~我是法务助手！
        </div>
      </div>

      <!-- Intro Card -->
      <div class="bg-white rounded-b-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        司法研讨大模型服务——快速、准确、便捷的工具，帮助用户查询和获取各类法律法规信息！
      </div>

      <!-- Examples Card -->
      <div class="bg-white rounded-xl p-5 mb-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
        <div
          v-for="(example, index) in examples"
          :key="index"
          class="bg-[#e23338] rounded-lg p-[12px_15px] my-2.5 text-[#ffffff] cursor-pointer"
          @click="handleExampleClick(example)"
        >
          {{ example }}
        </div>
      </div>

      <!-- Chat Container -->
      <div class="mb-[70px] pb-5" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative rounded-xl"
            :class="[
              message.sender === 'user'
                ? 'bg-[#B5D4FE] text-[#033968] rounded-tr-[4px] max-w-[80%]  p-[5px_15px]'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            <div v-if="message.aiLoading" class="">ai思考中...</div>
            <AiText :popsMessage="message" />
            <!-- 并发结果显示区域 -->
            <div class="grid grid-cols-3 gap-2 mt-4" v-if="message.sender != 'user'">
              <div
                v-for="item in concurrentLabels"
                :key="item.key"
                class="flex relative justify-center"
              >
                <div
                  class="flex items-center text-[14px] px-1 py-1 bg-gray-100 rounded-sm transition-colors cursor-pointer hover:bg-gray-200"
                  @click="handleConcurrentResultClick(message, item.key)"
                >
                  {{ item.label }}
                  <div
                    class="w-[20px] h-[20px] ml-1"
                    v-if="
                      item.key !== 'xgft' &&
                      getConcurrentResult(message.aiLoading, message.concurrentResults, item.key)
                    "
                  >
                    <div
                      v-if="
                        getConcurrentResult(message.aiLoading, message.concurrentResults, item.key)
                          ?.isLoading
                      "
                      class="loader_item"
                    ></div>
                    <div
                      v-else-if="
                        getConcurrentResult(message.aiLoading, message.concurrentResults, item.key)
                          ?.isCompleted
                      "
                      class="text-green-500"
                    >
                      ✓
                    </div>
                  </div>
                  <!-- 相关法条特殊处理 -->

                  <div v-else-if="item.key === 'xgft'" class="w-[20px] h-[20px] ml-1 mt4">
                    <div class="loader_item"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="fixed bottom-0 left-0 right-0 w-full bg-white p-2.5 flex justify-between items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
    >
      <input
        type="text"
        class="flex-1 border-none bg-[#f5f7fa] rounded-[20px] p-[12px_15px] text-sm outline-none mr-2.5 text-[#666]"
        v-model="userInput"
        placeholder="向我提出问题吧"
        @keypress.enter="sendMessages()"
      />

      <button
        type="button"
        class="bg-[#e23338] w-[250rpx] text-white border-none rounded-[20px] p-[10px_20px] text-sm cursor-pointer"
        @click="sendMessages()"
      >
        发送
      </button>
    </div>

    <!-- 并发结果弹窗 -->
    <div v-if="showModal" class="flex fixed inset-0 z-50" @click="closeModal">
      <!-- 背景遮罩 -->
      <div
        class="absolute inset-0 bg-black transition-opacity duration-300"
        :class="showModal ? 'opacity-50' : 'opacity-0'"
      ></div>

      <!-- 弹窗内容 -->
      <div
        class="flex flex-col ml-auto h-full bg-white shadow-2xl transition-all duration-300 ease-out"
        :class="showModal ? 'w-[90vw] translate-x-0' : 'w-0 translate-x-full'"
        @click.stop
      >
        <!-- 弹窗头部 -->
        <div
          class="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200"
        >
          <h2 class="text-lg font-semibold text-gray-800">
            {{ currentModalTitle }}
          </h2>
          <button @click="closeModal" class="p-2 rounded-full transition-colors hover:bg-gray-100">
            <svg
              class="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <!-- 弹窗内容区域 -->
        <div class="overflow-hidden flex-1">
          <div class="overflow-y-auto px-2 py-6 h-full">
            <!-- 内容切换动画容器 -->
            <div class="relative">
              <transition
                name="content-fade"
                mode="out-in"
                @enter="onContentEnter"
                @leave="onContentLeave"
              >
                <div :key="currentModalKey" class="max-w-none prose">
                  <div class="p-4 mb-6 bg-blue-50 rounded-r-lg border-l-4 border-blue-500">
                    <h3 class="mb-2 font-medium text-blue-800">{{ currentModalTitle }}</h3>
                    <p class="text-sm text-blue-700">以下是相关的详细信息：</p>
                  </div>

                  <!-- 格式化显示内容 -->
                  <div class="space-y-4">
                    <!-- 相似案例特殊处理 -->
                    <template
                      v-if="currentModalKey === 'xsal' && Array.isArray(parsedModalContent)"
                    >
                      <div
                        v-for="(caseItem, index) in parsedModalContent"
                        :key="index"
                        class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 案例标题 -->
                        <div class="pb-3 mb-4 border-b border-gray-100">
                          <h4 class="mb-2 text-lg font-semibold leading-tight text-gray-800">
                            {{ caseItem.title }}
                          </h4>
                          <div class="flex flex-wrap gap-2 text-sm">
                            <span class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                              {{ caseItem.caseid }}
                            </span>
                            <span class="px-2 py-1 text-green-800 bg-green-100 rounded-full">
                              {{ caseItem.court }}
                            </span>
                            <span class="px-2 py-1 text-purple-800 bg-purple-100 rounded-full">
                              {{ caseItem.judgedate }}
                            </span>
                          </div>
                        </div>

                        <!-- 案例基本信息 -->
                        <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                          <div class="space-y-2">
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">案件性质:</span>
                              <span class="text-sm text-gray-800">{{
                                caseItem.casetype || '民事'
                              }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">案由:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.casecause }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">审理程序:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.procedure }}</span>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">审理法院:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.court }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">判决日期:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.judgedate }}</span>
                            </div>
                            <div class="flex items-center">
                              <span class="w-20 text-sm font-medium text-gray-600">所属地区:</span>
                              <span class="text-sm text-gray-800">{{ caseItem.province }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律 -->
                        <div
                          v-if="caseItem.applicablelaw && caseItem.applicablelaw.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 text-sm font-medium text-gray-700">适用法律条文:</h5>
                          <div class="space-y-1">
                            <div
                              v-for="(law, lawIndex) in caseItem.applicablelaw"
                              :key="lawIndex"
                              class="pl-3 text-sm text-gray-600 border-l-2 border-blue-200"
                            >
                              {{ law }}
                            </div>
                          </div>
                        </div>

                        <!-- 高亮内容 -->
                        <div
                          v-if="caseItem.highlight_list && caseItem.highlight_list.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 text-sm font-medium text-gray-700">关键内容:</h5>
                          <div class="space-y-2">
                            <div
                              v-for="(highlight, highlightIndex) in caseItem.highlight_list"
                              :key="highlightIndex"
                              class="p-3 bg-yellow-50 rounded-r-lg border-l-4 border-yellow-400"
                            >
                              <div
                                class="text-sm leading-relaxed text-gray-700"
                                v-html="highlight"
                              ></div>
                            </div>
                          </div>
                        </div>

                        <!-- 案例摘要 -->
                        <div v-if="caseItem.purpose || caseItem.chunk" class="mb-4">
                          <h5 class="mb-2 text-sm font-medium text-gray-700">案例要点:</h5>
                          <div class="p-3 bg-gray-50 rounded-lg">
                            <p class="text-sm leading-relaxed text-gray-700">
                              {{ caseItem.purpose || caseItem.chunk }}
                            </p>
                          </div>
                        </div>

                        <!-- 底部信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex flex-wrap gap-2">
                            <span class="text-xs text-gray-500">
                              案件编号: {{ caseItem.uniqid }}
                            </span>
                            <span class="text-xs text-gray-500">
                              数据来源: {{ caseItem.database }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-400">{{ caseItem.judgeyear }}年案例</div>
                        </div>
                      </div>
                    </template>

                    <!-- 原有的通用格式处理 -->
                    <template v-else-if="Array.isArray(parsedModalContent)">
                      <!-- 如果是数组，遍历显示每个项目 -->
                      <div
                        v-for="(item, index) in parsedModalContent"
                        :key="index"
                        class="p-3 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 标题 -->
                        <h4
                          v-if="item.title"
                          class="mb-3 text-lg font-semibold leading-tight text-gray-800 line-clamp-2"
                        >
                          {{ item.title }}
                        </h4>

                        <!-- 内容 -->
                        <div
                          v-if="item.content"
                          class="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap"
                        >
                          {{ item.content }}
                        </div>

                        <!-- URL链接和评分信息 -->
                        <div class="pt-3 border-t border-gray-100">
                          <div class="flex-1">
                            <!-- 修改后的查看原文逻辑 -->
                            <template v-if="item.url">
                              <!-- 如果是微信公众号链接，显示灰底div -->
                              <div
                                class="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                              >
                                <div class="flex flex-1 items-center mr-3">
                                  <span class="text-sm text-gray-700 break-all line-clamp-1">{{
                                    cleanUrl(item.url)
                                  }}</span>
                                </div>
                                <button
                                  @click="copyToClipboard(cleanUrl(item.url))"
                                  class="px-3 py-1 text-xs text-white bg-blue-500 rounded transition-colors hover:bg-blue-600"
                                >
                                  复制
                                </button>
                              </div>
                              <!-- 如果不是微信公众号链接，显示查看原文按钮 -->
                              <!-- <button
                                v-else
                                @click="openUrlModal(cleanUrl(item.url))"
                                class="inline-flex items-center mr-4 text-sm text-blue-600 underline break-all hover:text-blue-800"
                              >
                                <svg
                                  class="flex-shrink-0 mr-1 w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  ></path>
                                </svg>
                                查看原文
                              </button> -->
                            </template>
                          </div>

                          <!-- 相关性评分 -->
                          <div
                            v-if="item._score"
                            class="flex items-center mt-2 text-sm text-gray-500"
                          >
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (item._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
                        <div v-if="item.type" class="mt-2">
                          <span
                            class="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                          >
                            {{ item.type }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- 如果不是数组，尝试解析为单个对象 -->
                    <template
                      v-else-if="
                        typeof parsedModalContent === 'object' && parsedModalContent !== null
                      "
                    >
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <!-- 标题 -->
                        <h4
                          v-if="parsedModalContent.title"
                          class="mb-3 text-lg font-semibold leading-tight text-gray-800"
                        >
                          {{ parsedModalContent.title }}
                        </h4>

                        <!-- 内容 -->
                        <div
                          v-if="parsedModalContent.content"
                          class="mb-4 leading-relaxed text-gray-700 whitespace-pre-wrap"
                        >
                          {{ parsedModalContent.content }}
                        </div>

                        <!-- URL链接和评分信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex-1">
                            <a
                              v-if="parsedModalContent.url"
                              :href="cleanUrl(parsedModalContent.url)"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="inline-flex items-center mr-4 text-sm text-blue-600 underline break-all hover:text-blue-800"
                            >
                              <svg
                                class="flex-shrink-0 mr-1 w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                ></path>
                              </svg>
                              查看原文
                            </a>
                          </div>

                          <!-- 相关性评分 -->
                          <div
                            v-if="parsedModalContent._score"
                            class="flex items-center text-sm text-gray-500"
                          >
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (parsedModalContent._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
                        <div v-if="parsedModalContent.type" class="mt-2">
                          <span
                            class="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                          >
                            {{ parsedModalContent.type }}
                          </span>
                        </div>
                      </div>
                    </template>

                    <!-- 如果是字符串，直接显示 -->
                    <template v-else>
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div class="leading-relaxed text-gray-700 whitespace-pre-wrap">
                          {{ parsedModalContent }}
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- 弹窗底部操作区 -->
        <div class="p-1 bg-gray-50 border-t border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm text-gray-500">数据来源：AI智能分析</div>
            <button
              @click="closeModal"
              class="px-4 py-1 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- URL全屏弹窗 -->
    <div v-if="showUrlModal" class="fixed inset-0 z-[60] bg-white">
      <!-- 弹窗头部 -->
      <div
        class="flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm"
      >
        <h2 class="text-lg font-semibold text-gray-800">查看原文</h2>
        <button @click="closeUrlModal" class="p-2 rounded-full transition-colors hover:bg-gray-100">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- iframe内容区域 -->
      <div class="h-[calc(100vh-64px)]">
        <iframe
          :src="currentUrl"
          class="w-full h-full border-0"
          frameborder="0"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div
      v-if="showCopySuccess"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      复制成功！
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, nextTick, onMounted } from 'vue'

import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { api } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'

const state = status()
const globalState = state.state

defineComponent({
  name: 'Ai',
})

onMounted(() => {
  if (globalState.aiResults) messages.value = globalState.aiResults
})

// 并发标签配置
const concurrentLabels = ref([
  { key: 'xsyw', label: '1.相似疑问' },
  { key: 'xgft', label: '2.相关法条' },
  { key: 'wlgd', label: '3.网络观点' },
  { key: 'cpgdz', label: '4.裁判观点' },
  { key: 'swyj', label: '5.实务研究' },
  { key: 'xsal', label: '6.相似案例' },
])

// 弹窗相关状态
const showModal = ref(false)
const currentModalKey = ref('')
const currentModalContent = ref('')
const currentModalTitle = ref('')

// URL弹窗相关状态
const showUrlModal = ref(false)
const currentUrl = ref('')

// 复制成功提示
const showCopySuccess = ref(false)

// 解析弹窗内容
const parsedModalContent = computed(() => {
  if (!currentModalContent.value) return ''

  try {
    // 尝试解析为JSON
    const parsed = JSON.parse(currentModalContent.value)
    return parsed
  } catch (error) {
    // 如果不是JSON，返回原始字符串
    return currentModalContent.value
  }
})

// 判断是否为微信公众号URL
const isWeixinUrl = (url: string): boolean => {
  if (!url) return false
  return url.startsWith('http://mp.weixin.qq.com') || url.includes('https://mp.weixin.qq.com/')
}

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  }
}

// 打开URL弹窗
const openUrlModal = (url: string) => {
  currentUrl.value = url
  showUrlModal.value = true
}

// 关闭URL弹窗
const closeUrlModal = () => {
  showUrlModal.value = false
  currentUrl.value = ''
}

// 清理URL，移除反引号和多余的空格
const cleanUrl = (url: string): string => {
  if (!url) return ''
  return url.replace(/`/g, '').trim()
}

// 从URL参数获取apiKey的函数
const getApiKeyFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('apiKey') || aiConfig.apiKey
}

// 创建AIService实例时传入配置
const aiConfigs = {
  api: aiConfig.api,
  apiKey: getApiKeyFromUrl(),
  model: aiConfig.model,
}

const aiService = new AIService(aiConfigs)
// 创建ConcurrentAIService实例
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl())

// 预设问题示例
const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求'])

// 聊天消息
const messages = ref<
  {
    content: string
    sender: 'user' | 'assistant'
    isLoading?: boolean
    aiLoading?: boolean
    concurrentResults?: ConcurrentResult[]
    selectedConcurrentResult?: string // 新增：选中的并发结果key
  }[]
>([])

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)

// 并发请求结果
const concurrentResults = ref<ConcurrentResult[]>([])

// 处理示例问题点击
const handleExampleClick = (question: string) => {
  userInput.value = question
  sendMessages()
}

// 发送消息
const sendMessages = async () => {
  const message = userInput.value

  if (message === '') return

  // 添加用户消息
  addMessage(message, 'user')

  const newMessage = {
    role: 'user',
    content: message,
  }

  // 添加助手消息，包含并发结果
  const assistantMessage = {
    content: '',
    sender: 'assistant' as const,
    isLoading: true, // 整体加载状态
    aiLoading: true, // AI思考状态，初始设为true
    concurrentResults: concurrentAiService.getAllResults(),
  }
  messages.value.push(assistantMessage)

  // 启动主要AI服务
  aiService.sendToAI(newMessage, setMessage)

  // 启动并发AI服务
  await concurrentAiService.sendConcurrentRequests(newMessage, handleConcurrentCallback)

  userInput.value = ''
}

// 处理并发请求的回调
const handleConcurrentCallback = (
  key: string,
  content: string,
  isCompleted: boolean,
  error?: string,
) => {
  // 更新最后一条助手消息中的并发结果
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.sender === 'assistant') {
    // 获取最新的结果
    const lastResult = concurrentAiService.getAllResults()

    // 更新并发结果
    lastMessage.concurrentResults = lastResult

    // 检查是否所有并发请求都完成了
    const allCompleted = lastResult.every((result) => result.isCompleted)

    // 如果所有并发请求都完成了，并且主要AI也完成了，则设置整体加载完成
    if (allCompleted && !lastMessage.aiLoading) {
      lastMessage.isLoading = false
      globalState.aiResults = messages.value
    }

    console.log(`API ${key} 完成:`, lastResult)
  }
}

const setMessage = (message: string, isDone: boolean, aiLoading: boolean) => {
  const lastMessage = messages.value[messages.value.length - 1]

  // 确保最后一条消息存在且是助手消息
  if (!lastMessage || lastMessage.sender !== 'assistant') {
    return
  }

  if (isDone) {
    lastMessage.aiLoading = false // AI思考完成

    // 检查并发请求是否也都完成了
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true

    if (allConcurrentCompleted) {
      lastMessage.isLoading = false // 整体加载完成
      globalState.aiResults = messages.value
    }
    return
  }

  // 更新AI思考状态和内容
  lastMessage.aiLoading = aiLoading
  lastMessage.content = `${lastMessage.content}${message}`
  scrollToBottom()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, document.body.scrollHeight)
    }
  })
}

const addMessage = (content: string, sender: 'user' | 'assistant') => {
  messages.value.push({ content, sender })
  scrollToBottom()
}

// 获取并发结果的辅助函数
const getConcurrentResult = (
  aiLoading: boolean,
  results: ConcurrentResult[] | undefined,
  key: string,
): ConcurrentResult | undefined => {
  if (!aiLoading) false
  return results?.find((result) => result.key === key)
}

// 处理并发结果点击
const handleConcurrentResultClick = (message: any, key: string) => {
  const result = getConcurrentResult(message.aiLoading, message.concurrentResults, key)

  // 只有当结果完成且有内容时才显示
  if (result && result.isCompleted && result.content) {
    currentModalKey.value = key
    currentModalContent.value = result.content
    currentModalTitle.value = getConcurrentLabelByKey(key)
    showModal.value = true
  }
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
}

// 根据key获取标签名称
const getConcurrentLabelByKey = (key: string): string => {
  const label = concurrentLabels.value.find((item) => item.key === key)
  return label ? label.label : key
}

// 根据key获取并发结果内容
const getConcurrentContentByKey = (
  results: ConcurrentResult[] | undefined,
  key: string,
): string => {
  if (!results) return ''
  const result = results.find((item) => item.key === key)
  return result ? result.content : ''
}
</script>
<style scoped>
/* 内容切换动画 */
.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.3s ease;
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.content-fade-enter-to,
.content-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
