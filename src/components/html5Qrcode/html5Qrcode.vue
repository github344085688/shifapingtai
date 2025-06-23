<template>
  <div class="flex flex-col items-center justify-center space-y-4 p-4">
    <!-- 选择照片按钮 -->
    <label class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-full max-w-md text-center cursor-pointer">
      从相册选择
      <input
        type="file"
        accept="image/*"
        @change="handleFileSelect"
        class="hidden"
      />
    </label>

    <!-- 预览区域 -->
    <div v-if="selectedFile" class="mt-4">
      <img
        :src="previewUrl"
        alt="预览"
        class="max-w-md rounded-lg shadow-lg"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')

// 处理文件选择
const handleFileSelect = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0]
    previewUrl.value = URL.createObjectURL(input.files[0])
    
    // 上传到服务器
    await uploadFile(input.files[0])
  }
}

// 上传文件到服务器
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('photo', file)
  
  try {
    const response = await fetch('YOUR_UPLOAD_API_ENDPOINT', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    console.log('上传成功：', data)
  } catch (error) {
    console.error('上传失败：', error)
  }
}
</script>

<style scoped></style>
<style scoped></style>
