<template>
  <div class="w-full min-h-full pb-[68px] bg-gray-50 box-border">
    <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
      :title="ConsultationOnLegalIssues.title"
      :placeholder="ConsultationOnLegalIssues.placeholder"
      :note="ConsultationOnLegalIssues.note"
    >
      <template #content>
        <div class="box-border px-6 mb-6 w-full">
          <div class="font-medium text-gray-600">热门问题</div>
          <div class="mt-1">
            <div
              v-for="(example, index) in examples"
              :key="index"
              class="py-2 flex justify-between items-center text-red-600 bg-white border-0 border-b-[1px] border-gray-200 transition-colors duration-200 cursor-pointer hover:bg-gray-50"
              @click="handleExampleClick(example)"
            >
              {{ example }}
              <svg
                t="1753862321982"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="4390"
                width="20"
                height="20"
              >
                <path
                  d="M593.066667 793.6a32.170667 32.170667 0 0 1 0-45.226667L829.44 512 593.066667 275.626667a32.170667 32.170667 0 0 1 0-45.226667c12.373333-12.373333 32.853333-12.373333 45.226666 0l258.986667 258.986667c12.373333 12.373333 12.373333 32.853333 0 45.226666l-258.986667 258.986667c-6.4 6.4-14.506667 9.386667-22.613333 9.386667s-16.213333-2.986667-22.613333-9.386667z"
                  p-id="4391"
                  fill="#bfbfbf"
                ></path>
                <path
                  d="M149.333333 544c-17.493333 0-32-14.506667-32-32s14.506667-32 32-32h718.08c17.493333 0 32 14.506667 32 32s-14.506667 32-32 32H149.333333z"
                  p-id="4392"
                  fill="#bfbfbf"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </template>
    </SendMessages>
    <div class="max-w-[750px] mx-auto px-2.5 bg-gray-50 box-border">
      <div class="pb-5" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative rounded-xl markdown_text"
            :class="[
              message.sender === 'user'
                ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            <div v-if="message.aiLoading" class="">ai思考中...</div>
            <!-- 思考过程显示 -->
            <div
              v-if="message.thinkingProcess"
              class="mb-4 thinking-process"
              v-html="message.thinkingProcess"
            ></div>
            <AiText :popsMessage="message" />
            <!-- 并发结果显示区域 -->
            <div class="grid grid-cols-3 gap-1 mt-4" v-if="message.sender != 'user'">
              <div
                v-for="(result, idx) in message.concurrentResults"
                :key="result.key"
                class="flex relative justify-center mb-2"
              >
                <div
                  :class="[
                    'flex items-center text-[14px] px-1.5 py-1.5 rounded-sm transition-colors',
                    isConcurrentButtonDisabled(message, result.key)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 cursor-pointer hover:bg-gray-200',
                  ]"
                  @click="handleConcurrentResultClick(message, result.key)"
                >
                  {{ concurrentLabels[idx]?.label || result.name }}
                  <div class="w-[20rpx] h-[20rpx] ml-1">
                    <!-- {{ result.aiLoading && index === messages.length - 1 }} -->
                    <!-- {{ index }}--{{ messages.length }} -->
                    <!-- 使用result.aiLoading来控制每个API的loading状态 -->
                    <div
                      v-if="result.aiLoading && index === messages.length - 1"
                      class="loader_item"
                    ></div>
                    <!-- 只有在最后一条消息时才显示成功和错误状态 -->
                    <template v-else-if="index === messages.length - 1">
                      <div v-if="result.isCompleted && !result.error" class="text-green-500">✓</div>
                      <div v-else-if="result.error" class="text-red-500">✗</div>
                    </template>
                    <!-- 对于非最后一条消息，保持原有状态显示 -->
                    <template v-else>
                      <div v-if="result.isCompleted && !result.error" class="text-green-500">✓</div>
                      <div v-else-if="result.error" class="text-red-500">✗</div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <!-- <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      :isShalow="true"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
    /> -->

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
          class="flex justify-between items-center px-4 py-2 bg-[#e23338] from-blue-50 to-indigo-50 border-b border-gray-200"
        >
          <h2 class="text-lg font-semibold text-white">
            {{ currentModalTitle }}
          </h2>
          <button @click="closeModal" class="p-2 rounded-full transition-colors hover:bg-gray-100">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <div
                    class="p-4 mb-6 bg-blue-50 rounded-r-lg"
                    v-if="!parsedModalContent || parsedModalContent.length < 1"
                  >
                    <p class="text-blue-700">没有找到相关信息！</p>
                  </div>

                  <!-- 格式化显示内容 -->
                  <div class="mb-6 space-y-4">
                    <!-- 相似案例特殊处理 -->
                    <template
                      v-if="currentModalKey === 'xsal' && Array.isArray(parsedModalContent)"
                    >
                      <div
                        v-for="(caseItem, index) in parsedModalContent"
                        :key="index"
                        class="p-4 mb-6 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        <!-- 案例标题 -->
                        <div class="pb-3 mb-4 border-b border-gray-100">
                          <h4 class="mb-2 text-lg font-semibold leading-tight text-gray-800">
                            {{ caseItem.title }}
                          </h4>
                          <div class="flex flex-wrap gap-2">
                            <span class="px-2 py-1 text-blue-800 bg-blue-100 rounded-full">
                              {{ caseItem.caseid }}
                            </span>
                            <span class="px-2 py-1 text-green-800 bg-green-100 rounded-full">
                              {{ caseItem.court }}
                            </span>
                            <span class="px-2 py-1 text-purple-800 bg-purple-100 rounded-full">
                              {{ caseItem.judgedate }}
                            </span>
                            <span
                              v-if="caseItem.procedure"
                              class="px-2 py-1 text-orange-800 bg-orange-100 rounded-full"
                            >
                              {{ caseItem.procedure }}
                            </span>
                          </div>
                        </div>

                        <!-- 案例基本信息 -->
                        <div class="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                          <div class="space-y-2">
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >案件性质:</span
                              >
                              <span class="text-gray-800">{{ caseItem.casetype || '民事' }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >案由:</span
                              >
                              <span class="text-gray-800">{{ caseItem.casecause }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >审理程序:</span
                              >
                              <span class="text-gray-800">{{ caseItem.procedure }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >判决年份:</span
                              >
                              <span class="text-gray-800">{{ caseItem.judgeyear }}</span>
                            </div>
                          </div>
                          <div class="space-y-2">
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >审理法院:</span
                              >
                              <span class="text-gray-800">{{ caseItem.court }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >判决日期:</span
                              >
                              <span class="text-gray-800">{{ caseItem.judgedate }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >所属地区:</span
                              >
                              <span class="text-gray-800">{{ caseItem.province }}</span>
                            </div>
                            <div class="flex items-start">
                              <span class="flex-shrink-0 w-20 font-medium text-gray-600"
                                >数据来源:</span
                              >
                              <span class="text-gray-800">{{ caseItem.database }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律条文 -->
                        <div
                          v-if="caseItem.applicablelaw && caseItem.applicablelaw.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">适用法律条文:</h5>
                          <div class="space-y-1">
                            <div
                              v-for="(law, lawIndex) in caseItem.applicablelaw"
                              :key="lawIndex"
                              class="p-2 pl-3 text-gray-600 bg-blue-50 rounded-r border-l-2 border-blue-200"
                            >
                              {{ law }}
                            </div>
                          </div>
                        </div>

                        <!-- 适用法律名称 -->
                        <div
                          v-if="caseItem.applicablelawonly && caseItem.applicablelawonly.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">涉及法律法规:</h5>
                          <div class="flex flex-wrap gap-2">
                            <span
                              v-for="(lawName, lawIndex) in caseItem.applicablelawonly"
                              :key="lawIndex"
                              class="px-2 py-1 text-xs text-indigo-800 bg-indigo-100 rounded-full"
                            >
                              {{ lawName }}
                            </span>
                          </div>
                        </div>

                        <!-- 高亮内容 -->
                        <div
                          v-if="caseItem.highlight_list && caseItem.highlight_list.length > 0"
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">关键内容片段:</h5>
                          <div class="space-y-2">
                            <div
                              v-for="(highlight, highlightIndex) in caseItem.highlight_list"
                              :key="highlightIndex"
                              class="p-3 bg-yellow-50 rounded-r-lg border-l-4 border-yellow-400"
                            >
                              <div class="leading-relaxed text-gray-700" v-html="highlight"></div>
                            </div>
                          </div>
                        </div>

                        <!-- 案例摘要信息 -->
                        <div
                          v-if="
                            caseItem.summyBycm ||
                            caseItem.summyByrw ||
                            caseItem.purpose ||
                            caseItem.chunk
                          "
                          class="mb-4"
                        >
                          <h5 class="mb-2 font-medium text-gray-700">案例摘要:</h5>
                          <div class="space-y-2">
                            <div v-if="caseItem.summyBycm" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例摘要(CM):</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.summyBycm }}
                              </p>
                            </div>
                            <div v-if="caseItem.summyByrw" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例摘要(RW):</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.summyByrw }}
                              </p>
                            </div>
                            <div v-if="caseItem.purpose" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例目的:</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.purpose }}
                              </p>
                            </div>
                            <div v-if="caseItem.chunk" class="p-3 bg-gray-50 rounded-lg">
                              <div class="mb-1 text-xs text-gray-500">案例片段:</div>
                              <p class="leading-relaxed text-gray-700">
                                {{ caseItem.chunk }}
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- 底部信息 -->
                        <div
                          class="flex justify-between items-center pt-3 border-t border-gray-100"
                        >
                          <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                            <span>案件编号: {{ caseItem.uniqid }}</span>
                            <span>•</span>
                            <span>数据来源: {{ caseItem.database }}</span>
                            <span>•</span>
                            <span>判决年份: {{ caseItem.judgeyear }}</span>
                          </div>
                          <div class="text-xs text-gray-400">
                            {{ caseItem.judgeyear }}年{{ caseItem.procedure }}案例
                          </div>
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
                          <!-- <div class="flex-1">
                            <template v-if="item.url">
                              <div
                                class="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
                              >
                                <div class="flex flex-1 items-center mr-3">
                                  <span class="text-gray-700 break-all line-clamp-1">{{
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
                            </template>
                          </div> -->

                          <!-- 相关性评分 -->
                          <div v-if="item._score" class="flex items-center mt-2 text-gray-500">
                            <svg class="mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              ></path>
                            </svg>
                            相关性: {{ (item._score * 100).toFixed(1) }}%
                          </div>
                        </div>

                        <!-- 类型标签 -->
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
                              class="inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800"
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
                            class="flex items-center text-gray-500"
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
                      </div>
                    </template>

                    <!-- 如果是字符串，直接显示 -->
                    <template v-else>
                      <div class="p-5 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div class="leading-relaxed text-gray-700 whitespace-pre-wrap">
                          <div class="" v-html="parsedModalContent"></div>
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
            <div class="text-gray-500">数据来源：AI智能分析</div>
            <button
              @click="closeModal"
              class="px-4 py-1 text-white bg-[#e23338] rounded-lg transition-colors hover:bg-[#e23338]"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div
      v-if="showCopySuccess"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      复制成功！
    </div>

    <!-- 没有数据提示 -->
    <div
      v-if="showNoDataTip"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg transition-all duration-300"
    >
      没有找到相关数据
    </div>
    <!-- <div class="flex justify-center bg-gray-400 h-[200px]">asdsa</div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, nextTick, onMounted } from 'vue'

import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { api, ConsultationOnLegalIssues, CACHE_DURATION } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'
import router from '@/router'
import { useTitle } from '@/composables/useTitle'
import SendMessages from '@/components/sendMessages/sendMessages.vue'

const state = status()
const globalState = state.state

// 使用动态title功能
const { title, updateTitle } = useTitle('法研智答')

defineComponent({
  name: 'Ai',
})

const gotopage = () => {
  alert()
  router.push({ name: 'AcrossTheEntireNetwork' })
}

// 自动滚动控制
const autoScroll = ref(true) // 默认开启自动滚动
const userScrolled = ref(false) // 用户是否手动滚动过

onMounted(() => {
  // 3. 页面渲染前判断缓存是否有效
  if (
    globalState.legalResearchSmartAnswer &&
    globalState.legalResearchSmartAnswer.aiResults &&
    globalState.legalResearchSmartAnswer.generalAiTime
  ) {
    const currentTime = Date.now()
    const savedTime = globalState.legalResearchSmartAnswer.generalAiTime
    const timeDifference = currentTime - savedTime
    console.log('timeDifference', timeDifference, CACHE_DURATION, timeDifference < CACHE_DURATION)

    // 如果时间差小于常量（10分钟），则使用缓存
    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.legalResearchSmartAnswer.aiResults
      // 如果有缓存的对话，更新title显示对话数量
      if (messages.value.length > 0) {
        const userMessages = messages.value.filter((msg) => msg.sender === 'user')
        updateTitle(`法研智答`)
      }
    } else {
      messages.value = []
      delete globalState.legalResearchSmartAnswer.aiResults
      delete globalState.legalResearchSmartAnswer.generalAiTime
    }
    // 如果超过10分钟，不赋值（使用默认空数组）
  }
  if (globalState.legalResearchSmartAnswer && globalState.legalResearchSmartAnswer.aiResults)
    messages.value = globalState.legalResearchSmartAnswer.aiResults

  // 监听用户滚动事件
  window.addEventListener('scroll', handleUserScroll)
  window.addEventListener('touchmove', handleUserScroll)
})

// 处理用户滚动事件
const handleUserScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight

  // 如果用户不在底部，说明用户手动滚动了
  if (scrollTop + windowHeight < documentHeight - 50) {
    userScrolled.value = true
    autoScroll.value = false
  }
}

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

// 没有数据提示
const showNoDataTip = ref(false)

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

// 开启新对话
const newDialogue = () => {
  messages.value = []
  delete globalState.legalResearchSmartAnswer.aiResults
  delete globalState.legalResearchSmartAnswer.generalAiTime
  // 重置title为默认值
  updateTitle('法研智答')
}
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
  api: ConsultationOnLegalIssues.api,
  apiKey: getApiKeyFromUrl(),
  model: ConsultationOnLegalIssues.model,
  isTimer: true,
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
    thinkingProcess?: string // 新增：思考过程内容
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

  // 重新开启自动滚动
  autoScroll.value = true
  userScrolled.value = false

  // 添加用户消息
  addMessage(message, 'user')

  // 更新title显示对话数量
  // const userMessages = messages.value.filter((msg) => msg.sender === 'user')
  updateTitle(`法研智答`)

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

    // 针对每个API，分别处理aiLoading
    lastResult.forEach((result) => {
      // aiLoading 为未完成时 true，完成时 false
      result.aiLoading = !result.isCompleted
    })

    // 检查是否所有并发请求都完成了
    const allCompleted = lastResult.every((result) => result.isCompleted)

    // 如果所有并发请求都完成了，并且主要AI也完成了，则设置整体加载完成
    if (allCompleted && !lastMessage.aiLoading) {
      lastMessage.isLoading = false
      globalState.legalResearchSmartAnswer.aiResults = messages.value
    }

    console.log(`API ${key} 状态更新:`, {
      key,
      isCompleted,
      aiLoading: !isCompleted,
      allResults: lastResult,
    })
  }
}

const setMessage = (
  message: string,
  isDone: boolean,
  isThinking: boolean,
  isError: boolean = false,
) => {
  const lastMessage = messages.value[messages.value.length - 1]

  // 确保最后一条消息存在且是助手消息
  if (!lastMessage || lastMessage.sender !== 'assistant') {
    return
  }

  if (isDone) {
    if (isError) {
      lastMessage.content = `${lastMessage.content}${message}`
    }
    lastMessage.aiLoading = false // AI思考完成

    // 检查并发请求是否也都完成了
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true

    if (allConcurrentCompleted) {
      lastMessage.isLoading = false // 整体加载完成
      globalState.legalResearchSmartAnswer = {}
      globalState.legalResearchSmartAnswer.aiResults = messages.value
      globalState.legalResearchSmartAnswer.generalAiTime = Date.now()
    }
    return
  }

  // 根据isThinking参数决定更新思考过程还是正常内容
  if (isThinking) {
    // 更新思考过程
    lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`
  } else {
    // 更新正常内容和AI思考状态
    lastMessage.aiLoading = false // 当开始输出正常内容时，思考状态结束
    lastMessage.content = `${lastMessage.content}${message}`
  }

  // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
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

  // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
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

// 检查并发结果按钮是否应该被禁用
const isConcurrentButtonDisabled = (message: any, key: string): boolean => {
  // 如果没有并发结果数据，禁用按钮
  if (!message.concurrentResults || message.concurrentResults.length === 0) {
    return true
  }

  // 查找对应key的结果
  const result = message.concurrentResults.find((item: any) => item.key === key)

  // 如果没有找到对应的结果，或者结果为空，禁用按钮
  // console.log('result---------------------------', key, result)
  if (!result || !result.content) {
    return true
  }

  // 针对不同key的特定逻辑判断
  switch (key) {
    case 'xsyw': // 刑事业务
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    case 'xgft': // 相关法条
      // content 没有内容
      if (!result.content || result.content.trim() === '') {
        return true
      }
      break

    case 'wlgd': // 网络观点
      // content 没有内容，或者不是数组，或为空数组
      if (!result.content || result.content.trim() === '') {
        return true
      }
      break

    case 'swyj': // 审务意见
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    case 'xsal': // 相似案例
      // content 不是数组，或为空数组
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) {
          return true
        }
      } catch (e) {
        // 如果不是有效的JSON，说明不是数组
        return true
      }
      break

    default:
      // 其他key保持原有逻辑
      break
  }

  return false
}

// 处理并发结果点击
const handleConcurrentResultClick = (message: any, key: string) => {
  if (isConcurrentButtonDisabled(message, key)) {
    // 显示没有找到相关数据的提示
    showNoDataTip.value = true
    setTimeout(() => {
      showNoDataTip.value = false
    }, 2000)
    return
  }
  const result: any = getConcurrentResult(message.aiLoading, message.concurrentResults, key)
  console.log('handleConcurrentResultClick---------------', result.content, key)
  if (!result.isCompleted) return

  // 只有当结果完成且有内容时才显示
  if (result && result.isCompleted && result.content) {
    currentModalKey.value = key
    currentModalContent.value = result.content
    currentModalTitle.value = getConcurrentLabelByKey(key)
    showModal.value = true
  } else {
    showModal.value = false
    // 显示没有找到相关数据的提示
    showNoDataTip.value = true
    setTimeout(() => {
      showNoDataTip.value = false
    }, 2000)
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
