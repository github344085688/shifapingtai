// 简单的 JavaScript 测试文件，用于验证模拟数据流功能
const fs = require('fs');
const path = require('path');

// 模拟 MockAIService 的核心功能
class MockAIService {
  constructor(config) {
    this.config = config;
    this.jsonData = [];
    this.currentIndex = 0;
    this.loadMockData();
  }

  loadMockData() {
    try {
      const jsonPath = path.join(__dirname, 'jsons.json');
      const fileContent = fs.readFileSync(jsonPath, 'utf-8');
      const lines = fileContent.split('\n').filter(line => line.trim());
      
      this.jsonData = lines.map(line => {
        if (line.startsWith('data:')) {
          const jsonStr = line.substring(5).trim(); // 去掉 'data:' 前缀
          if (jsonStr === '[DONE]') {
            return { type: 'done' };
          }
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            console.log('解析失败的行:', line);
            return null;
          }
        }
        return null;
      }).filter(item => item !== null);
      
      console.log(`✅ 成功加载 ${this.jsonData.length} 条模拟数据`);
    } catch (error) {
      console.error('❌ 加载模拟数据失败:', error.message);
      this.jsonData = [];
    }
  }

  async sendToAI(message, callback) {
    console.log('🚀 开始模拟 AI 响应...');
    console.log('📝 输入消息:', message);
    
    let hasShownThinkingHeader = false;
    let hasShownAnswerHeader = false;
    
    for (let i = 0; i < this.jsonData.length; i++) {
      const item = this.jsonData[i];
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (item.type === 'done') {
        callback(null, true, false);
        break;
      }
      
      // 检查模型是否包含 "gpt" 字符串
      const model = item.model || this.config.model || '';
      const isGptModel = model.toLowerCase().includes('gpt');
      
      if (isGptModel && item.choices && item.choices[0]) {
        const choice = item.choices[0];
        const additionalData = choice.additional;
        
        if (additionalData) {
          // 排除不需要的类型
          if (['step', 'qacls', 'start_search'].includes(additionalData.type)) {
            continue;
          }
          
          switch (additionalData.type) {
            case 'start_res':
              if (!hasShownThinkingHeader) {
                callback('📊 开始获取搜索结果...', false, true);
                hasShownThinkingHeader = true;
              } else {
                callback('📊 开始获取搜索结果...', false, true);
              }
              break;
              
            case 'get_res':
              if (additionalData.data && additionalData.data.trim()) {
                try {
                  const resData = JSON.parse(additionalData.data);
                  if (resData.content) {
                    const content = resData.content.replace(/\\n/g, '\n');
                    callback(`📄 搜索结果: ${content.substring(0, 100)}...`, false, true);
                  }
                } catch (e) {
                  callback(`📄 ${additionalData.data}`, false, true);
                }
              }
              break;
              
            case 'answer':
              const answerContent = choice.delta?.content || '';
              if (answerContent) {
                if (!hasShownAnswerHeader) {
                  callback('🎯 结果:', false, false);
                  hasShownAnswerHeader = true;
                }
                callback(answerContent, false, false);
              }
              break;
              
            case 'get_mat':
              if (additionalData.data && additionalData.data.trim()) {
                callback(`📋 ${additionalData.data}`, false, true);
              }
              break;
              
            case 'queries':
              try {
                const queries = JSON.parse(additionalData.data);
                if (Array.isArray(queries) && queries.length > 0) {
                  callback(`🔎 搜索关键词: ${queries.join(', ')}`, false, true);
                }
              } catch (e) {
                console.log('解析搜索查询失败:', e);
              }
              break;
              
            case 'start_jx':
              callback('🧠 推理结果:', false, false);
              break;
              
            default:
              if (additionalData.data && additionalData.data.trim()) {
                callback(`💭 ${additionalData.data}`, false, true);
              }
              break;
          }
        }
        
        // 处理正常的内容输出
        const content = choice.delta?.content || '';
        const deltaType = choice.delta?.type;
        
        if (content && deltaType !== 'answer') {
          callback(content, false, false);
        }
      } else {
        // 非 GPT 模型的简单逻辑
        const content = item.choices?.[0]?.delta?.content || '';
        if (content) {
          callback(content, false, false);
        }
      }
    }
    
    console.log('✅ 模拟响应完成');
  }
  
  getProgress() {
    return {
      current: this.currentIndex,
      total: this.jsonData.length,
      percentage: Math.round((this.currentIndex / this.jsonData.length) * 100)
    };
  }
}

// 测试函数
async function runTest() {
  console.log('🧪 开始测试模拟 AI 服务...\n');
  
  const mockConfig = {
    model: 'fyllm',
    apiKey: 'mock-key',
    baseURL: 'mock-url'
  };
  
  const mockService = new MockAIService(mockConfig);
  
  // 测试回调函数
  function testCallback(content, isComplete, isThinking) {
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
  
  console.log('=== 测试模拟数据流 ===');
  try {
    await mockService.sendToAI('测试消息：非法微整形机构是否构成非法经营罪？', testCallback);
    
    const progress = mockService.getProgress();
    console.log(`\n📊 处理进度: ${progress.current}/${progress.total} (${progress.percentage}%)`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
  
  console.log('\n✅ 测试完成！');
}

// 运行测试
runTest().catch(console.error);