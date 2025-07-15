<template>
  <div class="w-full h-full pb-[64px] bg-gray-50">
    <div class="max-w-[600px] mx-auto p-2.5 bg-gray-50">
      <div
        class="flex items-center bg-gradient-to-r from-[#bae1ff] via-[#d7fcff ] via-[#e2f1ff] to-[#d6ebfc] bg-cover bg-center p-[10px_15px] mt-5 rounded-t-xl"
      >
        <div class="w-[70px] h-[40px] relative mr-[15px]">
          <div class="absolute top-[-30px] left-0 w-[100px]">
            <img src="@img/logo.png" mode="widthFix" alt="" class="object-contain w-full h-auto" />
          </div>
        </div>
        <div class="text-[#4a6bff] text-lg flex justify-center w-full font-bold">
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
          class="bg-[#edf3ff] rounded-lg p-[12px_15px] my-2.5 text-sm text-[#4a6bff] cursor-pointer"
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
            class="relative text-sm rounded-xl"
            :class="[
              message.sender === 'user'
                ? 'bg-[#B5D4FE] text-[#033968] rounded-tr-[4px] max-w-[80%]  p-[5px_15px]'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            <!-- 并发结果显示区域 -->
            <!-- {{ message }} -->
            <div class="grid grid-cols-3 gap-3 mb-4" v-if="message.sender != 'user'">
              <div
                v-for="item in concurrentLabels"
                :key="item.key"
                class="flex relative justify-center"
              >
                <div 
                  class="flex items-center px-2 py-1 bg-gray-100 rounded-sm cursor-pointer hover:bg-gray-200 transition-colors"
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
                  <div v-else-if="item.key === 'xgft'" class="w-[20px] h-[20px] ml-1">
                    <div class="loader_item"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 并发结果内容显示 -->
            <div class="mb-4" v-if="message.selectedConcurrentResult">
              <div class="pl-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-3">
                <h4 class="mb-2 font-semibold text-blue-600">
                  {{ getConcurrentLabelByKey(message.selectedConcurrentResult) }}
                </h4>
                <div class="text-sm text-gray-700 whitespace-pre-wrap">
                  {{ getConcurrentContentByKey(message.concurrentResults, message.selectedConcurrentResult) }}
                </div>
              </div>
            </div>

            <div v-if="message.aiLoading" class="">ai思考中...</div>
            <AiText :popsMessage="message" />
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
        class="bg-[#4e6ef2] w-[250rpx] text-white border-none rounded-[20px] p-[10px_20px] text-sm cursor-pointer"
        @click="sendMessages()"
      >
        发送
      </button>
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
const examples = ref(['离婚纠纷诉讼请求？', '民间借贷纠纷诉讼请求？', '劳动争议诉讼请求？'])

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
  // lastMessage.content = `${lastMessage.content}${message}`
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
    // 如果点击的是当前已选中的结果，则取消选中
    if (message.selectedConcurrentResult === key) {
      message.selectedConcurrentResult = undefined
    } else {
      // 否则选中新的结果
      message.selectedConcurrentResult = key
    }
  }
}

// 根据key获取标签名称
const getConcurrentLabelByKey = (key: string): string => {
  const label = concurrentLabels.value.find(item => item.key === key)
  return label ? label.label : key
}

// 根据key获取并发结果内容
const getConcurrentContentByKey = (results: ConcurrentResult[] | undefined, key: string): string => {
  if (!results) return ''
  const result = results.find(item => item.key === key)
  return result ? result.content : ''
}
</script>
<style scoped></style>
