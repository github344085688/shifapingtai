// 测试文件：演示如何使用模拟数据流进行测试
import { AIService } from './aiservis';
import MockAIService from './moni';

// 测试配置
const mockConfig = {
  model: 'fyllm', // 使用 fyllm 模型来测试非 GPT 逻辑
  apiKey: 'mock-key',
  baseURL: 'mock-url'
};

// 创建 AI 服务实例
const aiService = new AIService(mockConfig);

// 测试回调函数
function testCallback(content: string | null, isComplete: boolean, isThinking: boolean) {
  if (content === null && isComplete) {
    console.log('\n[测试] 响应完成');
    console.log('='.repeat(50));
    return;
  }
  
  if (content) {
    if (isThinking) {
      console.log(`[推理] ${content}`);
    } else {
      console.log(`[内容] ${content}`);
    }
  }
}

// 测试用例
async function runTests() {
  console.log('开始测试模拟 AI 服务...\n');
  
  // 测试 1: 直接使用模拟方法
  console.log('=== 测试 1: 直接使用模拟方法 ===');
  try {
    await aiService.sendToAIMock('测试消息：非法微整形机构是否构成非法经营罪？', testCallback);
  } catch (error) {
    console.error('测试 1 失败:', error);
  }
  
  // 等待一段时间
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试 2: 启用模拟模式
  console.log('\n=== 测试 2: 启用模拟模式 ===');
  try {
    aiService.enableMockMode();
    await aiService.sendToAI('测试消息：启用模拟模式后的测试', testCallback);
  } catch (error) {
    console.error('测试 2 失败:', error);
  }
  
  // 等待一段时间
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 测试 3: 禁用模拟模式（会恢复到真实 API，但这里只是演示）
  console.log('\n=== 测试 3: 禁用模拟模式 ===');
  aiService.disableMockMode();
  console.log('模拟模式已禁用，现在会使用真实 API（如果配置正确）');
  
  // 测试 4: 直接测试 MockAIService
  console.log('\n=== 测试 4: 直接测试 MockAIService ===');
  try {
    const mockService = new MockAIService(mockConfig);
    
    console.log('测试流式响应:');
    const stream = mockService.simulateStream('测试流式响应');
    
    for await (const chunk of stream) {
      const parsed = mockService.parseStreamData(chunk);
      if (parsed) {
        if (parsed.type === 'done') {
          console.log('[流式] 响应完成');
        } else if (parsed.choices && parsed.choices[0]) {
          const choice = parsed.choices[0];
          if (choice.additional && choice.additional.data) {
            console.log(`[流式] ${choice.additional.data}`);
          }
        }
      }
    }
    
    // 显示进度信息
    const progress = mockService.getProgress();
    console.log(`\n进度信息: ${progress.current}/${progress.total} (${progress.percentage}%)`);
    
  } catch (error) {
    console.error('测试 4 失败:', error);
  }
  
  console.log('\n所有测试完成！');
}

// 导出测试函数，可以在其他地方调用
export { runTests, aiService, testCallback }

// 如果直接运行此文件，则执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  runTests().catch(console.error)
} else {
  // 浏览器环境，可以在控制台手动调用 runTests()
  console.log('💡 在浏览器控制台中运行 runTests() 来开始测试')
  ;(window as any).runTests = runTests
  ;(window as any).aiService = aiService
  ;(window as any).testCallback = testCallback
}