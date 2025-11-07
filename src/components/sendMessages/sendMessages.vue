<template>
  <div
    v-if="messagesLength > 0"
    class="h-[40px] bg-white sticky top-0 z-30 flex items-center justify-between max-w-[750px] mx-auto"
  >
    <div
      v-if="isH5"
      class="w-[60rpx] h-[60rpx] rounded-full pl-4 flex items-center justify-center cursor-pointer"
      @click="handleH5Back"
    >
      <div class="w-[32px] h-[32px]">
        <svg
          t="1762162915985"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="2069"
          width="28"
          height="28"
        >
          <path
            d="M481.233 904c8.189 0 16.379-3.124 22.628-9.372 12.496-12.497 12.496-32.759 0-45.256L166.488 512l337.373-337.373c12.496-12.497 12.496-32.758 0-45.255-12.498-12.497-32.758-12.497-45.256 0l-360 360c-12.496 12.497-12.496 32.758 0 45.255l360 360c6.249 6.249 14.439 9.373 22.628 9.373z"
            fill=""
            p-id="2070"
          ></path>
        </svg>
      </div>
    </div>
    <div class="flex items-end pl-4 text-gray-400 text-[12px] mr-auto">内容由AI生成，仅供参考</div>
    <button
      type="button"
      class="whitespace-nowrap bg-white px-3 flex items-center justify-center text-gray-500 border-none rounded-[10px] py-[5px] cursor-pointer mr-2"
      @click="handleNewDialogue"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        class="icon"
        aria-hidden="true"
      >
        <path
          d="M2.6687 11.333V8.66699C2.6687 7.74455 2.66841 7.01205 2.71655 6.42285C2.76533 5.82612 2.86699 5.31731 3.10425 4.85156L3.25854 4.57617C3.64272 3.94975 4.19392 3.43995 4.85229 3.10449L5.02905 3.02149C5.44666 2.84233 5.90133 2.75849 6.42358 2.71582C7.01272 2.66769 7.74445 2.66797 8.66675 2.66797H9.16675C9.53393 2.66797 9.83165 2.96586 9.83179 3.33301C9.83179 3.70028 9.53402 3.99805 9.16675 3.99805H8.66675C7.7226 3.99805 7.05438 3.99834 6.53198 4.04102C6.14611 4.07254 5.87277 4.12568 5.65601 4.20313L5.45581 4.28906C5.01645 4.51293 4.64872 4.85345 4.39233 5.27149L4.28979 5.45508C4.16388 5.7022 4.08381 6.01663 4.04175 6.53125C3.99906 7.05373 3.99878 7.7226 3.99878 8.66699V11.333C3.99878 12.2774 3.99906 12.9463 4.04175 13.4688C4.08381 13.9833 4.16389 14.2978 4.28979 14.5449L4.39233 14.7285C4.64871 15.1465 5.01648 15.4871 5.45581 15.7109L5.65601 15.7969C5.87276 15.8743 6.14614 15.9265 6.53198 15.958C7.05439 16.0007 7.72256 16.002 8.66675 16.002H11.3337C12.2779 16.002 12.9461 16.0007 13.4685 15.958C13.9829 15.916 14.2976 15.8367 14.5447 15.7109L14.7292 15.6074C15.147 15.3511 15.4879 14.9841 15.7117 14.5449L15.7976 14.3447C15.8751 14.128 15.9272 13.8546 15.9587 13.4688C16.0014 12.9463 16.0017 12.2774 16.0017 11.333V10.833C16.0018 10.466 16.2997 10.1681 16.6667 10.168C17.0339 10.168 17.3316 10.4659 17.3318 10.833V11.333C17.3318 12.2555 17.3331 12.9879 17.2849 13.5771C17.2422 14.0993 17.1584 14.5541 16.9792 14.9717L16.8962 15.1484C16.5609 15.8066 16.0507 16.3571 15.4246 16.7412L15.1492 16.8955C14.6833 17.1329 14.1739 17.2354 13.5769 17.2842C12.9878 17.3323 12.256 17.332 11.3337 17.332H8.66675C7.74446 17.332 7.01271 17.3323 6.42358 17.2842C5.90135 17.2415 5.44665 17.1577 5.02905 16.9785L4.85229 16.8955C4.19396 16.5601 3.64271 16.0502 3.25854 15.4238L3.10425 15.1484C2.86697 14.6827 2.76534 14.1739 2.71655 13.5771C2.66841 12.9879 2.6687 12.2555 2.6687 11.333ZM13.4646 3.11328C14.4201 2.334 15.8288 2.38969 16.7195 3.28027L16.8865 3.46485C17.6141 4.35685 17.6143 5.64423 16.8865 6.53613L16.7195 6.7207L11.6726 11.7686C11.1373 12.3039 10.4624 12.6746 9.72827 12.8408L9.41089 12.8994L7.59351 13.1582C7.38637 13.1877 7.17701 13.1187 7.02905 12.9707C6.88112 12.8227 6.81199 12.6134 6.84155 12.4063L7.10132 10.5898L7.15991 10.2715C7.3262 9.53749 7.69692 8.86241 8.23218 8.32715L13.2791 3.28027L13.4646 3.11328ZM15.7791 4.2207C15.3753 3.81702 14.7366 3.79124 14.3035 4.14453L14.2195 4.2207L9.17261 9.26856C8.81541 9.62578 8.56774 10.0756 8.45679 10.5654L8.41772 10.7773L8.28296 11.7158L9.22241 11.582L9.43433 11.543C9.92426 11.432 10.3749 11.1844 10.7322 10.8271L15.7791 5.78027L15.8552 5.69629C16.185 5.29194 16.1852 4.708 15.8552 4.30371L15.7791 4.2207Z"
        ></path>
      </svg>
      新对话
    </button>
  </div>
  <!-- 没有数据初始化 -->
  <div
    v-if="messagesLength < 1 && !props.isShalow"
    class="fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[9999] bg-white"
  >
    <div class="max-w-[750px] h-full flex flex-col items-center justify-center m-auto relative">
      <!-- DeepSeek Logo -->
      <div class="flex justify-center mb-4">
        <div class="w-[40px] h-[40px] rounded">
          <img src="@/assets/img/logo.png" alt="" />
        </div>
      </div>

      <!-- Welcome Text -->
      <div class="px-4 mb-4">
        <h1 class="text-[20px] font-bold text-red-700 text-center mb-2">
          {{ props.title }}
        </h1>
        <p class="leading-relaxed text-gray-600">
          {{ props.note }}
        </p>
      </div>
      <div class="w-full">
        <slot name="content"></slot>
      </div>

      <!-- Input Area for Welcome Screen -->
      <div class="box-border flex justify-center items-center px-4 mb-8 w-full">
        <div class="w-[40px] flex items-center justify-center">
          <FileContentExtractor
            ref="fileContentExtractorRef"
            v-model="claim"
            @file-content-extracted="handleFileContentExtracted"
          />
        </div>
        <div class="relative flex-1">
          <input
            type="text"
            class="w-full border border-gray-200 rounded-full py-3 px-4 pr-12 outline-none focus:border-[#e23338] transition-colors"
            v-model="inputValue"
            :placeholder="props.placeholder"
            @keypress.enter="handleSendMessage"
          />
          <button
            type="button"
            :class="[
              'absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              isButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#e23338] cursor-pointer hover:bg-[#d12329]',
            ]"
            :disabled="isButtonDisabled"
            @click="handleSendMessage"
          >
            <svg
              t="1753668793186"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5335"
              width="20"
              height="20"
            >
              <path
                d="M311.04 692.224L97.28 598.5792a38.0416 38.0416 0 0 1-3.6352-67.84l799.1808-457.472a38.0416 38.0416 0 0 1 56.6272 37.7856L854.016 866.8672a37.9904 37.9904 0 0 1-53.9136 29.6448l-223.5392-105.1648L471.04 937.9328a42.752 42.752 0 0 1-77.4656-25.0368l0.6656-190.5664 387.7376-455.0144z"
                fill="#ffffff"
                p-id="5336"
              ></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        v-if="messagesLength < 1 && !props.isShalow"
        class="fixed w-full h-full top-0 bottom-0 left-0 right-0 z-[9999] bg-white"
      >
        <div class="max-w-[750px] h-full flex flex-col items-center justify-center m-auto relative">
          <!-- DeepSeek Logo -->
          <div class="flex justify-center mb-4">
            <div class="w-[40px] h-[40px] rounded">
              <img src="@/assets/img/logo.png" alt="" />
            </div>
          </div>

          <!-- Welcome Text -->
          <div class="px-4 mb-4">
            <h1 class="text-[20px] font-bold text-red-700 text-center mb-2">
              {{ props.title }}
            </h1>
            <p class="leading-relaxed text-gray-600">
              {{ props.note }}
            </p>
          </div>
          <div class="w-full">
            <slot name="content"></slot>
          </div>

          <!-- Input Area for Welcome Screen -->
          <div class="box-border flex justify-center items-center px-4 mb-8 w-full">
            <div class="w-[40px] flex items-center justify-center">
              <FileContentExtractor
                ref="fileContentExtractorRef"
                v-model="claim"
                @file-content-extracted="handleFileContentExtracted"
              />
            </div>
            <div class="relative flex-1">
              <input
                type="text"
                class="w-full border border-gray-200 rounded-full py-3 px-4 pr-12 outline-none focus:border-[#e23338] transition-colors"
                v-model="inputValue"
                :placeholder="props.placeholder"
                @keypress.enter="handleSendMessage"
              />
              <button
                type="button"
                :class="[
                  'absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                  isButtonDisabled
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#e23338] cursor-pointer hover:bg-[#d12329]',
                ]"
                :disabled="isButtonDisabled"
                @click="handleSendMessage"
              >
                <svg
                  t="1753668793186"
                  class="icon"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  p-id="5335"
                  width="20"
                  height="20"
                >
                  <path
                    d="M311.04 692.224L97.28 598.5792a38.0416 38.0416 0 0 1-3.6352-67.84l799.1808-457.472a38.0416 38.0416 0 0 1 56.6272 37.7856L854.016 866.8672a37.9904 37.9904 0 0 1-53.9136 29.6448l-223.5392-105.1648L471.04 937.9328a42.752 42.752 0 0 1-77.4656-25.0368l0.6656-190.5664 387.7376-455.0144z"
                    fill="#ffffff"
                    p-id="5336"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
          <div
            v-if="isH5"
            class="w-[60rpx] h-[60rpx] fixed top-[18px] left-[10px] rounded-full pl-4 flex items-center justify-center cursor-pointer"
            @click="handleH5Back"
          >
            <div class="w-[32px] h-[32px]">
              <svg
                t="1762162915985"
                class="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2069"
                width="28"
                height="28"
              >
                <path
                  d="M481.233 904c8.189 0 16.379-3.124 22.628-9.372 12.496-12.497 12.496-32.759 0-45.256L166.488 512l337.373-337.373c12.496-12.497 12.496-32.758 0-45.255-12.498-12.497-32.758-12.497-45.256 0l-360 360c-12.496 12.497-12.496 32.758 0 45.255l360 360c6.249 6.249 14.439 9.373 22.628 9.373z"
                  fill=""
                  p-id="2070"
                ></path>
              </svg>
            </div>
          </div>
          <div class="absolute bottom-[50px] text-gray-400 flex items-end text-[14px]">
            内容由AI生成，仅供参考
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Input Area -->
  <div
    v-if="messagesLength > 0 || props.isShalow"
    class="fixed bottom-0 left-0 z-[9999] right-0 w-full bg-white"
  >
    <div
      class="max-w-[750px] m-auto w-full p-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] border-0 border-t-[1px] border-slate-200"
    >
      <div class="flex relative justify-between items-center">
        <div class="w-[40px] flex items-center justify-center">
          <FileContentExtractor
            ref="fileContentExtractorRef"
            v-model="claim"
            @file-content-extracted="handleFileContentExtracted"
          />
        </div>

        <div class="relative flex-1">
          <input
            type="text"
            class="w-full border border-gray-200 rounded-full py-3 px-4 pr-12 outline-none focus:border-[#e23338] transition-colors"
            v-model="inputValue"
            :placeholder="props.placeholder"
            @keypress.enter="handleSendMessage"
          />
          <button
            type="button"
            :class="[
              'absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors',
              isButtonDisabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#e23338] cursor-pointer hover:bg-[#d12329]',
            ]"
            :disabled="isButtonDisabled"
            @click="handleSendMessage"
          >
            <svg
              t="1753668793186"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="5335"
              width="20"
              height="20"
            >
              <path
                d="M311.04 692.224L97.28 598.5792a38.0416 38.0416 0 0 1-3.6352-67.84l799.1808-457.472a38.0416 38.0416 0 0 1 56.6272 37.7856L854.016 866.8672a37.9904 37.9904 0 0 1-53.9136 29.6448l-223.5392-105.1648L471.04 937.9328a42.752 42.752 0 0 1-77.4656-25.0368l0.6656-190.5664 387.7376-455.0144z"
                fill="#ffffff"
                p-id="5336"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isShallow, ref, watch, computed, onMounted } from 'vue'
import FileContentExtractor from '@/components/sendMessages/FileContentExtractor.vue'
import { getApiKeyFromUrl, numberOfInterceptions } from '@/servers/units'
import { status } from 'juejin-state'

const state = status()
const globalState = state.state
// Props
interface Props {
  messagesLength: number
  userInput: string
  isShalow?: boolean
  title?: string
  note?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  userInput: '',
  isShalow: false,
  title: '我是法驿通助手，很高兴见到你！',
  note: '司法研讨大模型服务——快速、准确、便捷的工具，帮助用户查询和获取各类法律法规信息！',
  placeholder: '给助手发消息',
})

// Emits
interface Emits {
  (e: 'update:userInput', value: string): void
  (e: 'sendMessages'): void
  (e: 'newDialogue'): void
}

const emit = defineEmits<Emits>()
const claim = ref('')

// 添加对 FileContentExtractor 组件的引用
const fileContentExtractorRef = ref<InstanceType<typeof FileContentExtractor>>()

// 计算按钮是否应该被禁用
const isButtonDisabled = computed(() => {
  return !claim.value && !inputValue.value
})

// 处理文件内容提取
const handleFileContentExtracted = (content: string, fileName: string) => {
  console.log(`从文件 ${fileName} 提取的内容:`, content)
  // 内容已经通过v-model自动更新到parameters.claim
  // 可以在这里添加额外的处理逻辑，比如显示提示信息
}

// 本地输入值
const inputValue = ref('')

// 监听 props.userInput 的变化
// watch(
//   () => props.userInput,
//   (newValue) => {
//     inputValue.value = newValue
//   },
// )

// 监听本地输入值的变化，向父组件发送更新
watch(inputValue, (newValue) => {
  emit('update:userInput', newValue)
})

// 处理发送消息
const handleSendMessage = () => {
  // numberOfInterceptions({ code: 401, data: null, msg: '账号未登录' })
  // return
  // 判断 claim 有没有值，如果有则拼接，没有则直接使用 inputValue
  if (!claim.value && !inputValue.value) {
    return
  }
  const messageContent = claim.value ? claim.value + inputValue.value : inputValue.value
  emit('update:userInput', messageContent)
  emit('sendMessages')

  // 发送消息后清除 claim 和通知 FileContentExtractor 组件清除数据
  claim.value = ''
  fileContentExtractorRef.value?.clearFileData()
  inputValue.value = ''
}

// 处理新对话
const handleNewDialogue = () => {
  emit('newDialogue')
}

// 是否为 H5 环境：根据 URL 参数 h5=1 决定
const isH5 = ref(false)
const model = ref()

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  isH5.value = params.get('h5') === '1'
  globalState.environment = isH5.value ? 'h5' : 'noh5'
  model.value = params.get('model')
})

// 点击返回时向当前页、父窗口、RN、小程序广播 navback
const handleH5Back = () => {
  numberOfInterceptions({ code: '点击', data: model.value, msg: '点击返回' })
  return
}
</script>
