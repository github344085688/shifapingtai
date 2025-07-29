# AI 数据流模拟系统使用说明

## 概述
本系统使用 `jsons.json` 和 `moni.ts` 来模拟 API 请求返回的数据流，用于测试目的。

## 文件说明

### 1. `jsons.json`
- 包含真实 AI API 响应的模拟数据
- 每行格式：`data:{"choices":[...],"code":1000,"id":"...","model":"fyllm"}`
- 包含 426 条数据记录
- 支持不同类型的数据：step、get_res、answer、queries 等

### 2. `moni.ts`
- `MockAIService` 类：核心模拟服务
- 功能：
  - 读取 `jsons.json` 数据
  - 模拟网络延迟（50ms）
  - 处理不同数据类型
  - 支持 GPT 模型特殊逻辑
  - 提供进度跟踪

### 3. `aiservis.ts`
- `AIService` 类：主要 AI 服务类
- 新增方法：
  - `sendToAIMock()`: 使用模拟数据进行测试
  - `enableMockMode()`: 切换到模拟模式
  - `disableMockMode()`: 切换回真实 API 模式

## 使用方法

### 方法一：直接使用模拟方法
```typescript
import AIService from './aiservis';

const aiService = new AIService(config);

// 使用模拟数据测试
await aiService.sendToAIMock('测试消息', callback);
```

### 方法二：切换模拟模式
```typescript
// 启用模拟模式
aiService.enableMockMode();
await aiService.sendToAI('测试消息', callback);

// 切换回真实 API
aiService.disableMockMode();
await aiService.sendToAI('真实消息', callback);
```

### 方法三：直接使用 MockAIService
```typescript
import MockAIService from './moni';

const mockService = new MockAIService(config);
await mockService.sendToAI('测试消息', callback);

// 获取进度信息
const progress = mockService.getProgress();
console.log(`进度: ${progress.current}/${progress.total} (${progress.percentage}%)`);
```

## 测试文件

### `test-mock.ts` (TypeScript)
- 完整的测试示例
- 演示所有使用方法
- 适用于 Vue/TypeScript 项目

### `test-mock.cjs` (JavaScript)
- CommonJS 格式的测试文件
- 可直接运行：`node test-mock.cjs`
- 验证模拟功能是否正常

## 数据类型处理

模拟系统支持以下数据类型：
- `step`: 推理步骤（会被过滤掉）
- `start_res`: 开始搜索结果
- `get_res`: 搜索结果内容
- `answer`: 最终答案内容
- `get_mat`: 材料数据
- `queries`: 搜索查询
- `start_jx`: 推理结果开始

## 特性

1. **真实数据模拟**: 使用真实 API 响应数据
2. **网络延迟模拟**: 模拟真实网络环境
3. **进度跟踪**: 实时显示处理进度
4. **类型处理**: 支持不同数据类型的特殊处理
5. **模式切换**: 可在模拟和真实 API 间切换
6. **错误处理**: 完善的错误处理机制

## 运行测试

```bash
# 在项目根目录下
cd src/servers

# 运行 JavaScript 测试
node test-mock.cjs

# 或在浏览器中运行 TypeScript 测试
# 导入 test-mock.ts 并调用 runTests()
```

## 注意事项

1. 确保 `jsons.json` 文件存在且格式正确
2. 模拟数据基于 `fyllm` 模型，支持 GPT 模型特殊逻辑
3. 回调函数需要处理三个参数：`(content, isComplete, isThinking)`
4. 模拟模式下不会发起真实网络请求

## 故障排除

如果遇到问题：
1. 检查 `jsons.json` 文件是否存在
2. 确认数据格式是否正确（以 `data:` 开头）
3. 查看控制台错误信息
4. 运行测试文件验证功能