<template>
  <div class="file-content-extractor">
    <!-- 文件选择按钮 -->
    <button
      @click="triggerFileInput"
      class="flex items-center justify-center w-[20px] h-[20px] text-gray-600 hover:text-[#e23338] transition-colors"
      title="选择文件提取内容"
    >
      <svg
        t="1753778539566"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="6005"
      >
        <path
          d="M979.2 377.6h-704c-38.4 0-60.8 19.2-76.8 57.6-51.2 137.6-102.4 275.2-156.8 412.8-19.2 48-6.4 73.6 38.4 73.6h697.6c38.4 0 64-19.2 80-60.8 51.2-137.6 105.6-275.2 156.8-409.6 19.2-48 6.4-73.6-35.2-73.6z"
          fill="#bfbfbf"
          p-id="6006"
        ></path>
        <path
          d="M275.2 339.2c166.4 3.2 336 0 502.4 0h35.2c16-105.6-6.4-128-80-124.8-124.8 3.2-252.8 0-380.8 0-22.4 0-32-3.2-32-35.2 0-51.2-19.2-70.4-60.8-70.4H60.8C16 108.8 0 128 0 185.6v633.6h6.4c6.4-12.8 9.6-25.6 16-35.2 44.8-118.4 92.8-236.8 137.6-355.2 22.4-60.8 57.6-89.6 115.2-89.6z"
          fill="#bfbfbf"
          p-id="6007"
        ></path>
      </svg>
    </button>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".txt,.docx"
      @change="handleFileSelect"
      class="hidden"
    />

    <!-- 加载状态 -->
    <div
      v-if="isLoading"
      class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
    >
      <div class="flex items-center p-6 space-x-3 bg-white rounded-lg">
        <svg
          class="animate-spin h-5 w-5 text-[#e23338]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="text-gray-700">正在提取文件内容...</span>
      </div>
    </div>

    <!-- 错误提示 -->
    <div
      v-if="errorMessage"
      class="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50"
      @click="clearError"
    >
      <div class="p-6 mx-4 max-w-md bg-white rounded-lg">
        <div class="flex items-center mb-4">
          <svg class="mr-2 w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            ></path>
          </svg>
          <h3 class="text-lg font-medium text-gray-900">错误</h3>
        </div>
        <p class="mb-4 text-gray-600">{{ errorMessage }}</p>
        <button
          @click="clearError"
          class="w-full bg-[#e23338] text-white py-2 px-4 rounded-lg hover:bg-[#d12329] transition-colors"
        >
          确定
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 为mammoth库添加类型声明
declare module 'mammoth' {
  interface ExtractResult {
    value: string
    messages: any[]
  }

  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<ExtractResult>
}

// Props
interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'file-content-extracted': [content: string, fileName: string]
}>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()
const isLoading = ref(false)
const errorMessage = ref('')

// 清除文件数据的方法
const clearFileData = () => {
  // 清除文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }

  // 清除所有状态
  isLoading.value = false
  errorMessage.value = ''

  // 清除v-model值
  emit('update:modelValue', '')
}

// 暴露清除方法给父组件
defineExpose({
  clearFileData,
})

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 显示错误信息
const showError = (message: string) => {
  errorMessage.value = message
}

// 清除错误信息
const clearError = () => {
  errorMessage.value = ''
}

// 读取文本文件
const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      resolve(content)
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsText(file, 'UTF-8')
  })
}

// 读取DOCX文件
const readDocxFile = async (file: File): Promise<string> => {
  try {
    // 动态导入mammoth库
    const mammoth = await import('mammoth')

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const result = await mammoth.extractRawText({ arrayBuffer })
          resolve(result.value)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => {
        reject(new Error('文件读取失败'))
      }
      reader.readAsArrayBuffer(file)
    })
  } catch (error) {
    throw new Error('无法加载文档处理库，请确保已安装mammoth依赖')
  }
}

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  const allowedTypes = ['.txt', '.docx']
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

  if (!allowedTypes.includes(fileExtension)) {
    showError('仅支持.txt和.docx文件格式')
    // 清空文件输入
    if (target) target.value = ''
    return
  }

  // 检查文件大小（1MB = 1024 * 1024 bytes）
  const maxSize = 1024 * 1024 // 1MB
  if (file.size > maxSize) {
    showError('文件大小不能超过1MB')
    // 清空文件输入
    if (target) target.value = ''
    return
  }

  isLoading.value = true

  try {
    let content = ''

    if (fileExtension === '.txt') {
      content = await readTextFile(file)
    } else if (fileExtension === '.docx') {
      content = await readDocxFile(file)
    }

    // 更新v-model值
    emit('update:modelValue', content)

    // 触发文件内容提取事件
    emit('file-content-extracted', content, file.name)
  } catch (error) {
    console.error('文件读取失败:', error)
    showError('文件读取失败，请检查文件是否损坏或格式是否正确')
  } finally {
    isLoading.value = false
    // 清空文件输入，允许重复选择同一文件
    if (target) target.value = ''
  }
}
</script>

<style scoped>
.file-content-extractor {
  position: relative;
}

.icon {
  transition: all 0.2s ease;
}

.icon:hover {
  transform: scale(1.1);
}
</style>
