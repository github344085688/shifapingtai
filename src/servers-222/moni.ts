// 注意：在浏览器环境中，我们不能使用 fs 和 path 模块
// 这些导入仅用于类型定义，实际文件操作将使用 fetch API

// 模拟 AI 服务的响应数据结构
interface MockResponse {
  choices: Array<{
    additional?: {
      data: string;
      type: string;
    };
    delta?: {
      content: string;
      type: string;
    };
    index: number;
  }>;
  code: number;
  id: string;
  model: string;
}

export class MockAIService {
  private mockData: string[] = [];
  private currentIndex = 0;
  private aiConfig: any;

  constructor(aiConfig?: any) {
    this.aiConfig = aiConfig || {};
    // 异步加载模拟数据，如果失败会使用默认数据
    this.loadMockData().catch(() => {
      // 如果加载失败，使用默认数据
      this.mockData = this.getDefaultMockData();
    });
  }

  private async loadMockData() {
    try {
      // 尝试从多个可能的路径加载 JSON 文件
      const possiblePaths = [
        '/jsons.json',
        '/src/servers/jsons.json',
        './jsons.json'
      ];
      
      let jsonContent = '';
      let loaded = false;
      
      for (const path of possiblePaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            jsonContent = await response.text();
            loaded = true;
            console.log(`[MockAI] 成功从 ${path} 加载模拟数据`);
            break;
          }
        } catch (e) {
          // 继续尝试下一个路径
          continue;
        }
      }
      
      if (!loaded) {
        throw new Error('无法从任何路径加载 jsons.json 文件');
      }
      
      // 按行分割并过滤空行，不做任何处理，保持原始格式
      const lines = jsonContent.split('\n').filter(line => line.trim());
      
      // 直接使用原始数据，不做任何修改
      this.mockData = lines.map(line => line + '\n\n');
      
      console.log(`[MockAI] 成功加载 ${this.mockData.length} 条模拟数据`);
    } catch (error) {
      console.error('加载模拟数据失败:', error);
      console.log('[MockAI] 使用默认模拟数据');
      // 使用默认的模拟数据
      this.mockData = this.getDefaultMockData();
    }
  }

  private getDefaultMockData(): string[] {
    return [
      'data:{"choices":[{"additional":{"data":"正在思考您的问题...","type":"step"},"delta":{"content":"","type":"step"},"index":0}],"code":1000,"id":"mock123","model":"fyllm"}\n\n',
      'data:{"choices":[{"additional":{"data":"开始","type":"step"},"delta":{"content":"","type":"step"},"index":0}],"code":1000,"id":"mock123","model":"fyllm"}\n\n',
      'data:{"choices":[{"additional":{"data":"分析","type":"step"},"delta":{"content":"","type":"step"},"index":0}],"code":1000,"id":"mock123","model":"fyllm"}\n\n',
      'data:{"choices":[{"additional":{"data":"您的","type":"step"},"delta":{"content":"","type":"step"},"index":0}],"code":1000,"id":"mock123","model":"fyllm"}\n\n',
      'data:{"choices":[{"additional":{"data":"问题","type":"step"},"delta":{"content":"","type":"step"},"index":0}],"code":1000,"id":"mock123","model":"fyllm"}\n\n',
      'data:[DONE]\n\n'
    ];
  }

  // 兼容原有的 sendToAI 方法
  async sendToAI(message: any, callback: any) {
    let hasShownThinkingHeader = false;
    let hasShownAnswerHeader = false;
    let abortController = new AbortController();

    console.log(`[MockAI] 开始模拟响应: ${JSON.stringify(message)}`);

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));

    // 使用模拟数据流
    await this.simulateResponseStream(callback, hasShownThinkingHeader, hasShownAnswerHeader, abortController);
  }

  private async simulateResponseStream(callback: any, hasShownThinkingHeader: boolean, hasShownAnswerHeader: boolean, abortController: any) {
    this.currentIndex = 0;

    try {
      for (const line of this.mockData) {
        // 检查是否被中断
        if (abortController.signal.aborted) {
          callback('【请求已中断】', true, false);
          return;
        }

        // 模拟网络延迟 (20-80ms，更接近真实API响应速度)
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 60));

        if (!line.trim()) continue;

        // 直接输出原始数据，不做任何处理
        callback(line, false, false);

        this.currentIndex++;
        
        // 如果遇到 [DONE] 标记，结束流
        if (line.includes('[DONE]')) {
          callback(null, true, false);
          break;
        }
      }
      
      // 如果没有 [DONE] 标记，手动添加结束标记
      if (!this.mockData.some(data => data.includes('[DONE]'))) {
        callback(null, true, false);
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callback('【请求已中断】', true, false);
      } else {
        callback('网络请求失败', true, false);
      }
    }
  }

  // 新增的流式响应方法
  async *simulateStream(message: string): AsyncGenerator<string, void, unknown> {
    console.log(`[MockAI] 开始模拟流式响应: ${message}`);
    
    // 重置索引
    this.currentIndex = 0;
    
    for (const data of this.mockData) {
      // 模拟网络延迟 (20-80ms，更接近真实API响应速度)
      await this.delay(20 + Math.random() * 10);
      
      // 直接返回原始数据，不做任何处理
      yield data;
      
      this.currentIndex++;
      
      // 如果遇到 [DONE] 标记，结束流
      if (data.includes('[DONE]')) {
        break;
      }
    }
    
    // 如果没有 [DONE] 标记，手动添加
    if (!this.mockData.some(data => data.includes('[DONE]'))) {
      yield 'data:[DONE]\n\n';
    }
    
    console.log('[MockAI] 模拟流式响应完成');
  }

  // 解析流数据
  parseStreamData(data: string): any {
    try {
      if (data.startsWith('data:')) {
        const jsonStr = data.substring(5).trim();
        if (jsonStr === '[DONE]') {
          return { type: 'done' };
        }
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (error) {
      console.error('解析流数据失败:', error);
      return null;
    }
  }

  // 获取当前进度
  getProgress(): { current: number; total: number; percentage: number } {
    const total = this.mockData.length;
    const percentage = total > 0 ? Math.round((this.currentIndex / total) * 100) : 0;
    
    return {
      current: this.currentIndex,
      total,
      percentage
    };
  }

  // 重置模拟器
  reset() {
    this.currentIndex = 0;
    console.log('[MockAI] 模拟器已重置');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default MockAIService;