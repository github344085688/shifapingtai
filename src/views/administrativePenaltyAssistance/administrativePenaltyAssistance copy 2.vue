<template>
  <div class="w-full min-h-full pb-[68px] bg-gray-50 box-border">
    <SendMessages
      :messagesLength="messages.length"
      v-model:userInput="userInput"
      @sendMessages="sendMessages"
      @newDialogue="newDialogue"
      :title="administrativePenaltyAssistance.title"
      :placeholder="administrativePenaltyAssistance.placeholder"
      :note="administrativePenaltyAssistance.note"
    >
    </SendMessages>

    <div class="max-w-[750px] mx-auto px-2.5 bg-gray-50 w-full box-border">
      <div class="pb-5" ref="chatContainer  w-full box-border">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            class="box-border relative w-full rounded-xl markdown_text"
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
            <!-- 相似案例：卡片内折叠（移除整体折叠头） -->
            <div v-if="message.concurrentResults && message.concurrentResults.length" class="mt-3">
              <div class="overflow-hidden bg-white rounded-lg">
                <div
                  class="flex items-center p-2 text-gray-700 truncate bg-gray-200"
                  v-if="isSimilarCases"
                >
                  <span>相似案例</span>
                  <!-- 加载中 -->
                  <span
                    v-if="
                      getConcurrentResult(message.aiLoading, message.concurrentResults, 'xsalgnfx')
                        ?.aiLoading
                    "
                    class="flex items-center ml-2 text-xs text-gray-500"
                  >
                    <span class="mr-1 loader_item"></span>加载中
                  </span>
                  <!-- 接口错误 -->
                  <span
                    v-if="
                      getConcurrentResult(message.aiLoading, message.concurrentResults, 'xsalgnfx')
                        ?.error
                    "
                    class="ml-2 text-xs text-red-600"
                  >
                    接口错误
                  </span>
                  <!-- 暂无数据 -->
                  <span
                    v-if="
                      !getConcurrentResult(message.aiLoading, message.concurrentResults, 'xsalgnfx')
                        ?.aiLoading &&
                      !getConcurrentResult(message.aiLoading, message.concurrentResults, 'xsalgnfx')
                        ?.error &&
                      toArray(
                        getParsedContent(
                          getConcurrentContentByKey(message.concurrentResults, 'xsalgnfx'),
                        ),
                      ).length === 0
                    "
                    class="ml-2 text-xs text-gray-400"
                  >
                    暂无数据
                  </span>
                </div>

                <div
                  v-for="(item, i) in toArray(
                    getParsedContent(
                      getConcurrentContentByKey(message.concurrentResults, 'xsalgnfx'),
                    ),
                  )"
                  :key="item.uniqid || i"
                  class="overflow-hidden bg-white border-gray-200 border-b-[1px] border-solid"
                >
                  <!-- 卡片头：点击折叠当前案例 -->
                  <div
                    class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                    @click="toggleCaseDetail(message, i)"
                  >
                    <div class="text-gray-700 truncate">{{ item.title || '未命名案例' }}</div>
                    <svg
                      class="transition-transform icon"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      :style="{
                        transform: isCaseExpanded(message, i) ? 'rotate(180deg)' : 'rotate(0deg)',
                      }"
                    >
                      <path fill="currentColor" d="M512 640L192 320h640L512 640z" />
                    </svg>
                  </div>
                  <transition name="content-fade">
                    <div
                      v-show="isCaseExpanded(message, i)"
                      class="px-3 pb-3 text-sm text-gray-700"
                    >
                      <div class="text-gray-600">
                        来源：<a
                          :href="cleanUrl(item.link)"
                          class="text-blue-600 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ cleanUrl(item.link) }}</a
                        >
                        <span
                          v-if="isWeixinUrl(item.link)"
                          class="px-1.5 py-0.5 ml-2 text-xs text-green-600 bg-green-100 rounded"
                          >微信</span
                        >
                        <button
                          class="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
                          @click.stop="copyToClipboard(cleanUrl(item.link))"
                        >
                          复制链接
                        </button>
                      </div>
                      <div v-if="item.highlight_list && item.highlight_list.length" class="mt-1">
                        选摘：{{ formatHighlight(item.highlight_list) }}
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
            <!-- 相似案例卡片结束 -->

            <!-- 相关法条：卡片内折叠 -->
            <div v-if="message.concurrentResults && message.concurrentResults.length" class="mt-3">
              <div class="overflow-hidden bg-white rounded-lg">
                <div class="flex items-center p-2 text-gray-700 truncate bg-gray-200">
                  <span>相关法条</span>
                  <!-- 加载中 -->
                  <span
                    v-if="
                      getConcurrentResult(message.aiLoading, message.concurrentResults, 'xgft')
                        ?.aiLoading
                    "
                    class="flex items-center ml-2 text-xs text-gray-500"
                  >
                    <span class="mr-1 loader_item"></span>加载中
                  </span>
                  <!-- 接口错误 -->
                  <span
                    v-if="
                      getConcurrentResult(message.aiLoading, message.concurrentResults, 'xgft')
                        ?.error
                    "
                    class="ml-2 text-xs text-red-600"
                  >
                    接口错误
                  </span>
                  <!-- 暂无数据 -->
                  <span
                    v-if="
                      !getConcurrentResult(message.aiLoading, message.concurrentResults, 'xgft')
                        ?.aiLoading &&
                      !getConcurrentResult(message.aiLoading, message.concurrentResults, 'xgft')
                        ?.error &&
                      getLawsArray(getConcurrentContentByKey(message.concurrentResults, 'xgft'))
                        .length === 0
                    "
                    class="ml-2 text-xs text-gray-400"
                  >
                    暂无数据
                  </span>
                </div>

                <div
                  v-for="(law, i) in getLawsArray(
                    getConcurrentContentByKey(message.concurrentResults, 'xgft'),
                  )"
                  :key="law.uniqid || (law.directory && law.directory.join('-')) || i"
                  class="overflow-hidden bg-white border-gray-200 border-b-[1px] border-solid"
                >
                  <!-- 卡片头：点击折叠当前法条 -->
                  <div
                    class="flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                    @click="toggleLawDetail(message, i)"
                  >
                    <div class="text-gray-700 truncate">{{ law.title || '未命名法条' }}</div>
                    <svg
                      class="transition-transform icon"
                      viewBox="0 0 1024 1024"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      :style="{
                        transform: isLawExpanded(message, i) ? 'rotate(180deg)' : 'rotate(0deg)',
                      }"
                    >
                      <path fill="currentColor" d="M512 640L192 320h640L512 640z" />
                    </svg>
                  </div>
                  <transition name="content-fade">
                    <div v-show="isLawExpanded(message, i)" class="px-3 pb-3 text-sm text-gray-700">
                      <div class="text-gray-600">
                        来源：<span class="text-gray-700">{{ law.department || '未知部门' }}</span>
                        <span class="px-1.5 py-0.5 ml-2 text-xs text-blue-600 bg-blue-100 rounded">
                          {{ law.status || '状态未知' }}
                        </span>
                        <span class="px-1.5 py-0.5 ml-2 text-xs text-gray-600 bg-gray-100 rounded">
                          {{ law.law_type || '类型未知' }}
                        </span>
                      </div>
                      <div v-if="law.directory && law.directory.length" class="mt-1 text-gray-600">
                        目录：{{ law.directory.join(' / ') }}
                      </div>
                      <div v-if="law.content" class="mt-2 whitespace-pre-wrap">
                        {{ law.content }}
                      </div>
                      <button
                        class="mt-2 text-xs text-gray-500 underline hover:text-gray-700"
                        @click.stop="copyToClipboard(law.content || '')"
                      >
                        复制法条全文
                      </button>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
            <!-- 相关法条卡片结束 -->
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
import aiConfig, { administrativePenaltyAssistance, CACHE_DURATION } from '@/config/aiConfig'
import AIService from '@/servers/aiservis'
import ConcurrentAIService, { type ConcurrentResult } from '@/servers/concurrentAiService'
import router from '@/router'
import { useTitle } from '@/composables/useTitle'
import SendMessages from '@/components/sendMessages/sendMessages.vue'

const state = status()
const globalState = state.state

const { title, updateTitle } = useTitle('行政处罚辅助')

defineComponent({ name: 'Ai' })

const gotopage = () => {
  alert()
  router.push({ name: 'AcrossTheEntireNetwork' })
}

const autoScroll = ref(true)
const userScrolled = ref(false)
const isSimilarCases = ref(false)

onMounted(() => {
  if (
    globalState.administrativePenaltyAssistance &&
    globalState.administrativePenaltyAssistance.aiResults &&
    globalState.administrativePenaltyAssistance.generalAiTime
  ) {
    const currentTime = Date.now()
    const savedTime = globalState.administrativePenaltyAssistance.generalAiTime
    const timeDifference = currentTime - savedTime

    if (timeDifference < CACHE_DURATION) {
      messages.value = globalState.administrativePenaltyAssistance.aiResults
      if (messages.value.length > 0) updateTitle(`行政处罚辅助`)
    } else {
      messages.value = []
      delete globalState.administrativePenaltyAssistance.aiResults
      delete globalState.administrativePenaltyAssistance.generalAiTime
    }
  }
  if (
    globalState.administrativePenaltyAssistance &&
    globalState.administrativePenaltyAssistance.aiResults
  )
    messages.value = globalState.administrativePenaltyAssistance.aiResults

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
  { key: 'xsalgnfx', label: '相似案例' },
  { key: 'xgft', label: '相关法条' },
  { key: 'involvedDepartments', label: '涉及部门' },
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
  api: administrativePenaltyAssistance.api,
  apiKey: getApiKeyFromUrl(),
  model: administrativePenaltyAssistance.model,
  isTimer: true,
}
const aiService = new AIService(aiConfigs)
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl())

const examples = ref()

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
  if (message === '') return

  autoScroll.value = true
  userScrolled.value = false

  addMessage(message, 'user')
  updateTitle(`行政处罚辅助`)

  const newMessage = { role: 'user', content: message }

  const assistantMessage = {
    content: '',
    sender: 'assistant' as const,
    isLoading: true,
    aiLoading: true,
    // 仅保留并发标签对应的结果（当前为 xsalgnfx）
    concurrentResults: concurrentAiService
      .getAllResults()
      .filter((r) => concurrentLabels.value.some((l) => l.key === r.key)),
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

const handleConcurrentCallback = (
  key: string,
  content: string,
  isCompleted: boolean,
  error?: string,
) => {
  const lastMessage = messages.value[messages.value.length - 1]
  if (lastMessage && lastMessage.sender === 'assistant') {
    const lastResult = concurrentAiService.getAllResults()
    lastMessage.concurrentResults = lastResult
    lastResult.forEach((result) => (result.aiLoading = !result.isCompleted))
    const allCompleted = lastResult.every((result) => result.isCompleted)
    if (allCompleted && !lastMessage.aiLoading) {
      lastMessage.isLoading = false
      globalState.legalResearchSmartAnswer.aiResults = messages.value
    }
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
      globalState.administrativePenaltyAssistance = {}
      globalState.administrativePenaltyAssistance.aiResults = messages.value
      globalState.administrativePenaltyAssistance.generalAiTime = Date.now()
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

// 修正：相似案例的按钮禁用判断，兼容 data.json 的 "data= [...]" 格式
const isConcurrentButtonDisabled = (message: any, key: string): boolean => {
  if (!message.concurrentResults || message.concurrentResults.length === 0) return true
  const result = message.concurrentResults.find((item: any) => item.key === key)
  if (!result || !result.content) return true

  const parsed = getParsedContent(result.content)
  if (key === 'xsalgnfx') {
    return !(Array.isArray(parsed) && parsed.length > 0)
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

// 更新：解析并发内容（兼容 JSON 与 HTML）
const getParsedContent = (content: string) => {
  if (!content) return ''
  const str = String(content).trim()
  isSimilarCases.value = true
  try {
    return JSON.parse(str)
  } catch {}
  const start = str.indexOf('{')
  const end = str.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const jsonPart = str.slice(start, end + 1)
    try {
      return JSON.parse(jsonPart)
    } catch {}
  }
  const eqIdx = str.indexOf('data=')
  if (eqIdx !== -1) {
    const maybe = str.slice(eqIdx + 5).trim()
    try {
      return JSON.parse(maybe)
    } catch {}
  }
  // 新增：如果是带加粗标题的 HTML（xgft/wlgd 等），解析为数组
  if (/<div[^>]*style="[^"]*font-weight:\s*bold/i.test(str)) {
    const sections = parseHtmlSections(str)
    if (sections.length > 0) return sections
  }
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
  delete globalState.administrativePenaltyAssistance.aiResults
  delete globalState.administrativePenaltyAssistance.generalAiTime
  updateTitle('行政处罚辅助')
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

// 新增：将任意值安全转为数组用于 v-for
const toArray = (data: any): any[] => {
  return Array.isArray(data) ? data : []
}

// 新增：每条案例展开/折叠状态管理
const toggleCaseDetail = (message: any, idx: number) => {
  if (!message._expandedMap) message._expandedMap = {}
  message._expandedMap[idx] = !message._expandedMap[idx]
}
const isCaseExpanded = (message: any, idx: number): boolean => {
  return !!(message._expandedMap && message._expandedMap[idx])
}

// 新增：高亮字段去掉 HTML 标签并合并展示
const formatHighlight = (list: string[]) => {
  const strip = (s: string) => s.replace(/<[^>]*>/g, '')
  return strip(list.join('\n')).trim()
}

// 新增：将相关法条并发内容安全解析为数组（兼容数组 / laws / data.laws）
const getLawsArray = (content: string): any[] => {
  const parsed = getParsedContent(content)
  if (Array.isArray(parsed)) return parsed
  if (parsed && typeof parsed === 'object') {
    const obj: any = parsed
    if (Array.isArray(obj.laws)) return obj.laws
    if (obj.data && Array.isArray(obj.data.laws)) return obj.data.laws
  }
  return []
}

// 新增：每条法条展开/折叠状态管理（独立于案例）
const toggleLawDetail = (message: any, idx: number) => {
  if (!message._lawsExpandedMap) message._lawsExpandedMap = {}
  message._lawsExpandedMap[idx] = !message._lawsExpandedMap[idx]
}
const isLawExpanded = (message: any, idx: number): boolean => {
  return !!(message._lawsExpandedMap && message._lawsExpandedMap[idx])
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
