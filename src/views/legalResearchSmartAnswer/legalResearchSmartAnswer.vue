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

    <div class="box-border px-2.5 mx-auto w-full bg-gray-50">
      <div class="pb-5 w-full" ref="chatContainer">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex ', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="relative rounded-xl markdown_text"
            :class="[
              message.sender === 'user'
                ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px] w-full box-border',
            ]"
          >
            <div v-if="message.aiLoading" class="w-full">ai思考中...</div>
            <!-- 思考过程显示 -->
            <div
              v-if="message.thinkingProcess"
              class="box-border mb-4 w-full thinking-process"
              v-html="message.thinkingProcess"
            ></div>
            <AiText :popsMessage="message" />
            <!-- {{ message.content }} -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineComponent, nextTick, onMounted } from 'vue'
import { AiText } from 'juejin-puts'
import { status } from 'juejin-state'
import aiConfig, { ConsultationOnLegalIssues, CACHE_DURATION } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'
import router from '@/router'
import { useTitle } from '@/composables/useTitle'
import SendMessages from '@/components/sendMessages/sendMessages.vue'

const state = status()
const globalState = state.state

const { title, updateTitle } = useTitle('法研智答')

defineComponent({ name: 'Ai' })

const gotopage = () => {
  alert()
  router.push({ name: 'AcrossTheEntireNetwork' })
}

const autoScroll = ref(true)
const userScrolled = ref(false)

onMounted(() => {
  if (
    globalState.legalResearchSmartAnswer &&
    globalState.legalResearchSmartAnswer.aiResults &&
    globalState.legalResearchSmartAnswer.generalAiTime
  ) {
    const currentTime = Date.now()
    const savedTime = globalState.legalResearchSmartAnswer.generalAiTime
    const timeDifference = currentTime - savedTime

    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.legalResearchSmartAnswer.aiResults
      if (messages.value.length > 0) updateTitle(`法研智答`)
    } else {
      messages.value = []
      delete globalState.legalResearchSmartAnswer.aiResults
      delete globalState.legalResearchSmartAnswer.generalAiTime
    }
  }
  if (globalState.legalResearchSmartAnswer && globalState.legalResearchSmartAnswer.aiResults)
    messages.value = globalState.legalResearchSmartAnswer.aiResults

  window.addEventListener('scroll', handleUserScroll)
  window.addEventListener('touchmove', handleUserScroll)
})

const handleUserScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight
  if (scrollTop + windowHeight < documentHeight - 50) {
    userScrolled.value = true
    autoScroll.value = false
  }
}

const concurrentLabels = ref([
  { key: 'xsyw', label: '相似疑问' },
  { key: 'xgft', label: '相关法条' },
  { key: 'wlgd', label: '网络观点' },
  { key: 'cpgdz', label: '裁判观点' },
  { key: 'swyj', label: '实务研究' },
  { key: 'xsal', label: '相似案例' },
])

// 复制成功提示/无数据提示
const showCopySuccess = ref(false)
const showNoDataTip = ref(false)

const isWeixinUrl = (url: string): boolean => {
  if (!url) return false
  return url.startsWith('http://mp.weixin.qq.com') || url.includes('https://mp.weixin.qq.com/')
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showCopySuccess.value = true
    setTimeout(() => (showCopySuccess.value = false), 2000)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    showCopySuccess.value = true
    setTimeout(() => (showCopySuccess.value = false), 2000)
  }
}

const cleanUrl = (url: string): string => (url ? url.replace(/`/g, '').trim() : '')

const getApiKeyFromUrl = (): string => {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('apiKey') || aiConfig.apiKey
}

const aiConfigs = {
  api: ConsultationOnLegalIssues.api,
  apiKey: getApiKeyFromUrl(),
  model: ConsultationOnLegalIssues.model,
  isTimer: true,
}
const aiService = new AIService(aiConfigs)
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl())

const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求'])

const messages = ref<
  {
    content: string
    sender: 'user' | 'assistant'
    isLoading?: boolean
    aiLoading?: boolean
    concurrentResults?: ConcurrentResult[]
    selectedConcurrentResult?: string
    thinkingProcess?: string
  }[]
>([])

const userInput = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const concurrentResults = ref<ConcurrentResult[]>([])

const handleExampleClick = (question: string) => {
  userInput.value = question
  sendMessages()
}

const sendMessages = async () => {
  const message = userInput.value
  if (!message) return

  autoScroll.value = true
  userScrolled.value = false

  addMessage(message, 'user')
  updateTitle(`法研智答`)

  const newMessage = { role: 'user', content: message }

  const assistantMessage = {
    content: '',
    sender: 'assistant' as const,
    isLoading: true,
    aiLoading: true,
    concurrentResults: concurrentAiService.getAllResults(),
  }
  messages.value.push(assistantMessage)

  aiService.sendToAI(newMessage, setMessage)
  await concurrentAiService.sendConcurrentRequests(
    newMessage,
    handleConcurrentCallback,
    concurrentLabels.value,
  )

  userInput.value = ''
}

// const handleConcurrentCallback = (
//   key: string,
//   content: string,
//   isCompleted: boolean,
//   error?: string,
// ) => {
//   const lastMessage = messages.value[messages.value.length - 1]
//   if (lastMessage && lastMessage.sender === 'assistant') {
//     const lastResult = concurrentAiService.getAllResults()
//     lastMessage.concurrentResults = lastResult
//     lastResult.forEach((result) => (result.aiLoading = !result.isCompleted))
//     const allCompleted = lastResult.every((result) => result.isCompleted)
//     if (allCompleted && !lastMessage.aiLoading) {
//       lastMessage.isLoading = false
//       globalState.legalResearchSmartAnswer.aiResults = messages.value
//     }
//   }
// }

const handleConcurrentCallback = (
  key: string,
  content: string,
  isCompleted: boolean,
  error?: string,
) => {
  const currentMessages = messages.value
  const lastIndex = currentMessages.length - 1
  const lastMessage = currentMessages[lastIndex]

  // 仅处理最后一条且是 assistant 的消息
  if (!lastMessage || lastMessage.sender !== 'assistant') return

  // 从服务获取结果，但做不可变克隆与更新
  const serviceResults = concurrentAiService.getAllResults()
  const updatedResults = serviceResults.map((r: any) => {
    if (r.key === key) {
      return {
        ...r,
        // content: content ?? r.content,
        isCompleted: isCompleted ?? r.isCompleted,
        error: error ?? r.error,
        aiLoading: !(isCompleted ?? r.isCompleted),
      }
    }
    return {
      ...r,
      aiLoading: !r.isCompleted,
    }
  })

  const allCompleted = updatedResults.every((r: any) => r.isCompleted)

  // 只更新最后一条消息的内容与状态（不可变替换）
  const updatedLastMessage = {
    ...lastMessage,
    // content: content ? (lastMessage.content || '') + content : lastMessage.content,
    concurrentResults: updatedResults,
    isLoading: !allCompleted,
    aiLoading: !allCompleted,
  }

  // 不改变原有数据结构，只替换最后一条
  messages.value = [...currentMessages.slice(0, lastIndex), updatedLastMessage]

  // 全部完成后再写入全局结果
  if (allCompleted) {
    globalState.legalResearchSmartAnswer.aiResults = messages.value
  }
}

const setMessage = (
  message: string,
  isDone: boolean,
  isThinking: boolean,
  isError: boolean = false,
) => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (!lastMessage || lastMessage.sender !== 'assistant') return

  if (isDone) {
    if (isError) lastMessage.content = `${lastMessage.content}${message}`
    lastMessage.aiLoading = false
    const allConcurrentCompleted =
      lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true
    if (allConcurrentCompleted) {
      lastMessage.isLoading = false
      globalState.legalResearchSmartAnswer = {}
      globalState.legalResearchSmartAnswer.aiResults = messages.value
      globalState.legalResearchSmartAnswer.generalAiTime = Date.now()
    }
    return
  }

  if (isThinking) {
    lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`
  } else {
    lastMessage.aiLoading = false
    lastMessage.content = `${lastMessage.content}${message}`
  }

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
  if (autoScroll.value && !userScrolled.value) {
    scrollToBottom()
  }
}

const getConcurrentResult = (
  aiLoading: boolean,
  results: ConcurrentResult[] | undefined,
  key: string,
): ConcurrentResult | undefined => {
  if (!aiLoading) false
  return results?.find((result) => result.key === key)
}

const isConcurrentButtonDisabled = (message: any, key: string): boolean => {
  if (!message.concurrentResults || message.concurrentResults.length === 0) return true
  const result = message.concurrentResults.find((item: any) => item.key === key)
  if (!result || !result.content) return true

  switch (key) {
    case 'xsyw':
    case 'swyj':
    case 'xsal':
      try {
        const content = JSON.parse(result.content)
        if (!Array.isArray(content) || content.length === 0) return true
      } catch {
        return true
      }
      break
    case 'xgft':
    case 'wlgd':
      if (!result.content || result.content.trim() === '') return true
      break
    default:
      break
  }
  return false
}

// 新增：解析包含加粗标题的 HTML 为分段数组
const htmlToText = (s: string): string => {
  return s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<hr[^>]*>/gi, '\n----------------\n')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const parseHtmlSections = (html: string): Array<{ title: string; content: string }> => {
  if (!html) return []
  const normalized = String(html)
  const titleRegex = /<div[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/div>/gi

  const sections: Array<{ title: string; contentStart: number }> = []
  let match: RegExpExecArray | null
  titleRegex.lastIndex = 0

  while ((match = titleRegex.exec(normalized)) !== null) {
    const rawTitle = match[1]
    const title = htmlToText(rawTitle)
    const contentStart = titleRegex.lastIndex
    sections.push({ title, contentStart })
  }

  const results: Array<{ title: string; content: string }> = []
  for (let i = 0; i < sections.length; i++) {
    const { title, contentStart } = sections[i]
    const nextStart = i + 1 < sections.length ? sections[i + 1].contentStart : normalized.length
    const rawContent = normalized.slice(contentStart, nextStart)
    const content = htmlToText(rawContent)
    if (title || content) {
      results.push({ title, content })
    }
  }

  // 若未匹配到任何加粗标题，但仍有内容，则尝试用第一行作为标题
  if (results.length === 0) {
    const asText = htmlToText(normalized)
    const lines = asText.split('\n').filter((l) => l.trim() !== '')
    if (lines.length > 0) {
      const title = lines[0]
      const content = lines.slice(1).join('\n')
      results.push({ title, content })
    }
  }

  return results
}

// 新增：解析并发内容（容错）
const getParsedContent = (content: string) => {
  if (!content) return ''
  const str = String(content).trim()

  // 1) 尝试直接 JSON
  try {
    return JSON.parse(str)
  } catch {}

  // 2) 提取包裹的 JSON（如 “xxx { ... } yyy”）
  const start = str.indexOf('{')
  const end = str.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const jsonPart = str.slice(start, end + 1)
    try {
      return JSON.parse(jsonPart)
    } catch {}
  }

  // 3) 提取 “data=” 后的 JSON
  const eqIdx = str.indexOf('data=')
  if (eqIdx !== -1) {
    const maybe = str.slice(eqIdx + 5).trim()
    try {
      return JSON.parse(maybe)
    } catch {}
  }

  // 4) 解析包含加粗标题的 HTML 为数组（用于 wlgd / xgft 等）
  if (/<div[^>]*style="[^"]*font-weight:\s*bold/i.test(str)) {
    const sections = parseHtmlSections(str)
    if (sections.length > 0) return sections
  }

  // 5) 返回原始字符串（模板中以 v-html 或纯文本展示）
  return str
}

// 新增：切换折叠卡片
const toggleConcurrentCard = (message: any, key: string) => {
  if (isConcurrentButtonDisabled(message, key)) {
    showNoDataTip.value = true
    setTimeout(() => (showNoDataTip.value = false), 2000)
    return
  }
  message.selectedConcurrentResult = message.selectedConcurrentResult === key ? '' : key
}

const newDialogue = () => {
  messages.value = []
  delete globalState.legalResearchSmartAnswer.aiResults
  delete globalState.legalResearchSmartAnswer.generalAiTime
  updateTitle('法研智答')
}

const getConcurrentLabelByKey = (key: string): string => {
  const label = concurrentLabels.value.find((item) => item.key === key)
  return label ? label.label : key
}

const getConcurrentContentByKey = (
  results: ConcurrentResult[] | undefined,
  key: string,
): string => {
  if (!results) return ''
  const result = results.find((item) => item.key === key)
  return result ? result.content : ''
}

const groupCasesByDate = (
  list: Array<Record<string, any>>,
): Array<{ date: string; cases: Array<Record<string, any>> }> => {
  if (!Array.isArray(list)) return []
  const groups: Record<string, Array<Record<string, any>>> = {}
  const order: string[] = []

  for (const item of list) {
    const raw = String(item?.judgedate || '').trim()
    // 规范到 yyyy-mm-dd（若为空则归类到 '未知日期'）
    const key = raw ? raw.slice(0, 10) : '未知日期'
    if (!groups[key]) {
      groups[key] = []
      order.push(key)
    }
    groups[key].push(item)
  }

  return order.map((date) => ({ date, cases: groups[date] }))
}

// 新增：统一的无数据判断（结合 aiLoading / error / 内容结构）
const isSectionNoData = (result: ConcurrentResult): boolean => {
  if (!result) return true
  if (result.error) return false
  if (result.aiLoading || result.isLoading) return false
  // 针对 xsal 为 JSON 数组字符串的情况
  if (result.key === 'xsal') {
    try {
      const arr = JSON.parse(result.content)
      return !Array.isArray(arr) || arr.length === 0
    } catch {
      return !result.content || result.content.trim() === ''
    }
  }
  // 其他栏目：内容为空或仅空白
  return !result.content || result.content.trim() === ''
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

/* 旋转加载样式 */

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
