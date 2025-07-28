# 动态页面标题功能使用说明

## 功能概述

项目现在支持每个页面动态更改title的功能，包括：

1. **路由级别的title设置** - 在路由配置中为每个页面设置默认title
2. **组件级别的动态title更新** - 在组件中可以根据状态动态更新title
3. **全局路由守卫** - 自动根据路由meta信息更新title

## 实现方式

### 1. 路由配置 (`src/router/index.ts`)

```typescript
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: '法务助手 - 首页'
      }
    },
    {
      path: '/acrossTheEntireNetwork',
      name: 'AcrossTheEntireNetwork',
      component: AcrossTheEntireNetwork,
      meta: {
        title: '法务助手 - 全网搜索问答'
      }
    }
  ],
})

// 全局路由守卫，用于动态更新页面title
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title as string
  }
  next()
})
```

### 2. Composable函数 (`src/composables/useTitle.ts`)

提供了两个主要功能：

- `useTitle(initialTitle?)` - 返回响应式的title和更新函数
- `setTitle(newTitle)` - 直接设置页面title的简单函数

### 3. 组件中的使用

#### 基本使用

```vue
<script setup lang="ts">
import { useTitle } from '@/composables/useTitle'

// 使用动态title功能
const { title, updateTitle } = useTitle('默认标题')

// 动态更新title
const handleSomeAction = () => {
  updateTitle('新的标题')
}
</script>
```

#### 实际应用示例

在HomeView组件中：

```typescript
// 初始化title
const { title, updateTitle } = useTitle('法务助手 - 首页')

// 发送消息时更新title显示对话数量
const sendMessages = async () => {
  // ... 其他逻辑
  
  const userMessages = messages.value.filter(msg => msg.sender === 'user')
  updateTitle(`法务助手 - 首页 (${userMessages.length}条对话)`)
}

// 新对话时重置title
const newDialogue = () => {
  // ... 其他逻辑
  
  updateTitle('法务助手 - 首页')
}
```

## 功能特点

1. **自动路由title更新** - 切换页面时自动更新title
2. **响应式title管理** - 使用Vue的响应式系统管理title状态
3. **组件级别的动态更新** - 可以根据组件状态动态更新title
4. **TypeScript支持** - 完整的类型定义支持
5. **内存清理** - 组件卸载时自动清理watcher

## 使用场景

1. **显示页面状态** - 如对话数量、加载状态等
2. **用户操作反馈** - 根据用户操作更新title
3. **动态内容标识** - 根据页面内容动态设置title
4. **SEO优化** - 为不同页面设置合适的title

## 注意事项

1. 路由meta中的title会在路由切换时自动应用
2. 组件中的title更新会覆盖路由默认title
3. 建议在组件中设置有意义的初始title
4. title更新是响应式的，会自动同步到document.title

## 扩展功能

可以根据需要扩展更多功能：

- 添加title模板功能
- 支持国际化title
- 添加title历史记录
- 集成面包屑导航