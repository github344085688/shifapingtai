<template>
  <div class="w-full h-full pb-[64px]">
    <div class="max-w-[600px] mx-auto p-2.5">
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
        <div>提供专业法律解答预制几条方便点击提问，内容，例如：</div>
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
            :class="[
              ' rounded-xl text-sm',
              message.sender === 'user'
                ? 'bg-[#B5D4FE] text-[#033968] rounded-tr-[4px] max-w-[80%]  p-[5px_15px]'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]"
          >
            {{ message.aiLoading }}
            <AiText :popsMessage="message" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white p-2.5 flex items-center shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
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
        class="bg-[#4e6ef2] text-white border-none rounded-[20px] p-[10px_20px] text-sm cursor-pointer"
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

import aiConfig, { api } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
defineComponent({
  name: 'Ai',
})

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
console.log('aiConfig', aiConfig)
console.log('URL中的apiKey:', getApiKeyFromUrl())
const aiService = new AIService(aiConfigs)

// 使用示例

// 预设问题示例
const examples = ref(['离婚纠纷诉讼请求？', '民间借贷纠纷诉讼请求？', '劳动争议诉讼请求？', '你好'])

// 聊天消息
const messages = ref<
  { content: string; sender: 'user' | 'assistant'; isLoading?: boolean; aiLoading?: boolean }[]
>([])

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)

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

  messages.value.push({ content: '', sender: 'assistant', isLoading: true, aiLoading: false })
  aiService.sendToAI(newMessage, setMessage)
  userInput.value = ''
}
const setMessage = (message: string, isDone: boolean, aiLoading: boolean) => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (isDone) {
    lastMessage.isLoading = false
    return
  }
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
</script>
