# 文件内容提取组件 (FileContentExtractor)

## 功能描述

这是一个Vue 3组件，用于提取文件内容并将其填充到指定的文本区域中。

## 支持的文件格式

- `.txt` - 纯文本文件
- `.docx` - Microsoft Word文档

## 使用方法

### 1. 导入组件

```vue
<script setup lang="ts">
import FileContentExtractor from '@/components/sendMessages/FileContentExtractor.vue'
</script>
```

### 2. 在模板中使用

```vue
<template>
  <div class="relative">
    <textarea v-model="content" placeholder="请输入内容或点击按钮选择文件"></textarea>
    <div class="absolute top-2 right-2">
      <FileContentExtractor 
        v-model="content"
        @file-content-extracted="handleFileExtracted"
      />
    </div>
  </div>
</template>
```

### 3. 处理事件

```vue
<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')

const handleFileExtracted = (fileContent: string, fileName: string) => {
  console.log(`从文件 ${fileName} 提取的内容:`, fileContent)
  // 内容已经通过v-model自动更新到content变量
}
</script>
```

## Props

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| modelValue | string | '' | 双向绑定的文本内容 |

## Events

| 事件名 | 参数 | 描述 |
|--------|------|------|
| update:modelValue | (value: string) | 当文件内容被提取时触发，用于更新v-model |
| file-content-extracted | (content: string, fileName: string) | 当文件内容成功提取时触发 |

## 依赖

- `mammoth` - 用于处理.docx文件

## 安装依赖

```bash
npm install mammoth
```

## 特性

- 支持拖拽和点击选择文件
- 自动检测文件格式
- 错误处理和用户友好的提示
- 加载状态显示
- 响应式设计
- TypeScript支持

## 错误处理

组件会自动处理以下错误情况：

1. 不支持的文件格式
2. 文件读取失败
3. DOCX文件解析失败
4. 依赖库加载失败

## 样式

组件使用Tailwind CSS进行样式设计，包含：

- 悬停效果
- 加载动画
- 错误提示模态框
- 响应式布局

## 注意事项

1. 确保已安装mammoth依赖包
2. 大文件可能需要较长的处理时间
3. 组件会自动清空文件输入，允许重复选择同一文件