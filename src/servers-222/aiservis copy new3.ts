import MockAIService from './moni'

// 常量定义
const STYLES = {
  ERROR: 'color: red; font-weight: bold;',
  WARNING: 'color: orange; font-weight: bold;',
  INFO: 'color: #888; margin: 8px 0;',
  THINKING_HEADER: 'color: #888; margin: 8px 0;',
  THINKING_CONTENT: 'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6;',
  ANSWER_HEADER: 'height: 70px; display: flex; align-items: center; font-weight: bold; color: #333;',
  TITLE: 'color: #333; margin: 0 0 8px 0; font-weight: bold;'
} as const

const ERROR_MESSAGES = {
  SERVER_ERROR: '服务器错误',
  UNAUTHORIZED: '账号未登录',
  NETWORK_ERROR: '网络错误',
  CONNECTION_FAILED: '网络连接失败',
  TIMEOUT: '请求超时',
  REQUEST_ABORTED: '【请求已中断】',
  REQUEST_FAILED: '网络请求失败'
} as const

const TEXT_PATTERNS = {
  CHINESE_NUMBERS: /(一、|二、|三、|四、|五、|六、|七、|八、|九、|十、)/g,
  STEP_PATTERNS: /(第[一二三四五六七八九十]+步，)/g,
  PARENTHESES_NUMBERS: /(（[一二三四五六七八九十]+）)/g,
  NUMBER_COMMA: /([1-9]\d*，)/g,
  CHINESE_WITH_PUNCTUATION: /(第[一二三四五六七八九十]+[，。；：！？])/g,
  CHINESE_SEQUENCE: /(第[一二三四五六七八九十]+，)/g,
  SIMPLE_CHINESE: /([一二三四五六七八九十]+，)/g,
  UNWANTED_TEXT: /正在输入\.\.\.|\.打开对话/g
} as const

class AIService {
  private aiConfig: any
  private mockService: MockAIService
  private originalSendToAI?: Function

  constructor(aiConfig: any) {
    this.aiConfig = aiConfig
    this.mockService = new MockAIService(aiConfig)
  }

  // 统一的错误处理方法
  private handleError(error: any, callback: any): void {
    if (error.name === 'AbortError') {
      callback(`<div style="${STYLES.WARNING}">${ERROR_MESSAGES.REQUEST_ABORTED}</div>`, true, false, true)
    } else if (error.message?.includes('504')) {
      callback(`<div style="${STYLES.ERROR}">${ERROR_MESSAGES.SERVER_ERROR}</div>`, true, false, true)
    } else if (error.message?.includes('timeout')) {
      callback(`<div style="${STYLES.ERROR}">${ERROR_MESSAGES.TIMEOUT}</div>`, true, false, true)
    } else if (error.message?.includes('Failed to fetch') || error.includes?.('Failed to fetch')) {
      callback(`<div style="${STYLES.ERROR}">${ERROR_MESSAGES.CONNECTION_FAILED}</div>`, true, false, true)
    } else {
      callback(`<div style="${STYLES.ERROR}">${ERROR_MESSAGES.NETWORK_ERROR}</div>`, true, false, true)
    }
  }

  // 统一的HTTP状态码处理
  private handleHttpError(status: number, callback: any): boolean {
    let errorMessage = ''
    switch (status) {
      case 504:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR
        break
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED
        break
      default:
        errorMessage = `请求失败 (${status})`
    }
    callback(`<div style="${STYLES.ERROR}">${errorMessage}</div>`, true, false)
    return true
  }

  // 创建带样式的消息
  private createStyledMessage(content: string, style: string): string {
    return `<div style="${style}">${content}</div>`
  }

  async sendToAI(message: any, callback: any) {
    let systemMessages = [
      {
        role: 'system',
        content: this.aiConfig.systemContent,
      },
    ]
    let hasShownThinkingHeader = false
    let hasShownAnswerHeader = false
    let abortController = new AbortController()
    const signal = abortController.signal
    
    let paramsBody: any = {}
    if (this.aiConfig.params) {
      Object.entries(this.aiConfig.params).forEach(([key, value]) => {
        paramsBody[key] = value
      })
    }
    
    try {
      const response = await fetch(this.aiConfig.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Access-Control-Allow-Origin': '*', 
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE' , 
          Authorization: 'Bearer ' + this.aiConfig.apiKey,
        }, 
        body: JSON.stringify({
          model: this.aiConfig.model,
          messages: [message],
          stream: true,
        }),
        signal: signal,
      })

      // 检查HTTP状态码
      if (!response.ok) {
        this.handleHttpError(response.status, callback)
        return
      }

      await this.responseReader(response, abortController, callback, hasShownThinkingHeader, hasShownAnswerHeader)
    } catch (error: any) {
      console.log('Failed to fetch', error)
      this.handleError(error, callback)
    }
  }

  private async responseReader(response: any, abortController: any, callback: any, hasShownThinkingHeader: boolean, hasShownAnswerHeader: boolean) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder() 
    let buffer = '' 
    let countershu = 0
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callback(null, true, false)
          break
        }
        
        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n') 
        
        // 检查首个chunk是否包含错误代码401
        if (chunks[0] && countershu === 0 && chunks[0].includes('"code":401')) {
          const errorData = JSON.parse(chunks[0])
          callback(errorData.msg, false, false)
          callback(null, true, false)
          countershu = 1
          break
        }
        
        buffer = chunks.pop() || ''

        for (const chunk of chunks) {
          const eventData = chunk.replace(/^data:\s*/, '').trim()
          
          // 处理AI思考中的状态
          if (countershu === 0 && eventData.includes('"data":"AI思考中……"')) {
            callback('', false, true)
            break
          }
          
          if (!eventData) continue 
          countershu = 1
          
          // 检查是否为[DONE]消息
          if (eventData === '[DONE]') {
            callback(null, true, false)
            continue
          }
          
          try { 
            const json = JSON.parse(eventData)
            
            // 检查是否为API数据流结束消息 (finish_reason: "stop")
            if (json.choices && json.choices[0] && json.choices[0].finish_reason === 'stop') {
              alert('000')
              callback(null, true, false)
              continue
            }
            console.log('检查模型是否包含 "gpt" 字符串啊实打实')
            
            const model = json.model || this.aiConfig.model || ''
            const isGptModel = model.toLowerCase().includes('gpt')
            
            if (isGptModel) {
              hasShownThinkingHeader = this.handleGptModelResponse(json, callback, hasShownThinkingHeader, hasShownAnswerHeader)
            } else {
              this.handleNonGptModelResponse(json, callback)
            }
          } catch (e) {
            console.error('解析 JSON 失败:', e)
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.name === 'AbortError' ? ERROR_MESSAGES.REQUEST_ABORTED : ERROR_MESSAGES.REQUEST_FAILED
      callback(errorMessage, true, false)
    } finally {
      abortController = null
    }
  }

  // 处理GPT模型响应
  private handleGptModelResponse(json: any, callback: any, hasShownThinkingHeader: boolean, hasShownAnswerHeader: boolean): boolean {
    const additionalData = json.choices[0]?.additional
    
    if (additionalData) {
      // 排除不需要的类型
      if (['step', 'qacls', 'start_search', 'get_mat'].includes(additionalData.type)) {
        return hasShownThinkingHeader
      }
      
      hasShownThinkingHeader = this.handleAdditionalData(additionalData, callback, hasShownThinkingHeader, hasShownAnswerHeader)
    }
    
    // 处理正常的内容输出
    const content = json.choices[0]?.delta?.content || ''
    const deltaType = json.choices[0]?.delta?.type
    
    if (content && deltaType !== 'answer') {
      callback(content, false, false)
    }
    
    return hasShownThinkingHeader
  }

  // 处理非GPT模型响应
  private handleNonGptModelResponse(json: any, callback: any): void {
    const content = json.choices[0]?.delta?.content || ''
    callback(content, false, false)
  }

  // 处理additional数据
  private handleAdditionalData(additionalData: any, callback: any, hasShownThinkingHeader: boolean, hasShownAnswerHeader: boolean): boolean {
    switch (additionalData.type) {
      case 'start_res':
        return this.handleStartRes(callback, hasShownThinkingHeader)
      case 'get_res':
        return this.handleGetRes(additionalData, callback, hasShownThinkingHeader)
      case 'answer':
        this.handleAnswer(additionalData, callback, hasShownAnswerHeader)
        return hasShownThinkingHeader
      case 'queries':
        return this.handleQueries(additionalData, callback, hasShownThinkingHeader)
      default:
        return this.handleDefaultAdditional(additionalData, callback, hasShownThinkingHeader)
    }
  }

  // 处理搜索结果开始
  private handleStartRes(callback: any, hasShownThinkingHeader: boolean): boolean {
    const message = '📊 开始获取搜索结果...'
    if (!hasShownThinkingHeader) {
      callback(this.createStyledMessage(`<strong>搜索过程：</strong>${message}`, STYLES.THINKING_HEADER), false, true)
      return true
    } else {
      callback(this.createStyledMessage(message, STYLES.THINKING_HEADER), false, true)
      return hasShownThinkingHeader
    }
  }

  // 处理搜索结果数据
  private handleGetRes(additionalData: any, callback: any, hasShownThinkingHeader: boolean): boolean {
    if (!additionalData.data?.trim()) return hasShownThinkingHeader
    
    try {
      const resData = JSON.parse(additionalData.data)
      if (resData.content) {
        let formattedContent = this.processTextContent(resData.content, false)
        
        if (resData.title) {
          formattedContent = this.processTitleContent(resData.title) + formattedContent
        }
        
        const contentDiv = `<div style="${STYLES.THINKING_CONTENT}">${formattedContent}</div>`
        
        if (!hasShownThinkingHeader) {
          callback(this.createStyledMessage(`<strong>推理过程：</strong>`, STYLES.THINKING_HEADER) + contentDiv, false, true)
          return true
        } else {
          callback(contentDiv, false, true)
          return hasShownThinkingHeader
        }
      }
    } catch (e) {
      return this.handleDefaultAdditional(additionalData, callback, hasShownThinkingHeader)
    }
    
    return hasShownThinkingHeader
  }

  // 处理答案数据
  private handleAnswer(additionalData: any, callback: any, hasShownAnswerHeader: boolean): void {
    const answerContent = JSON.parse(additionalData.data || '{}').choices?.[0]?.delta?.content || ''
    if (answerContent && !hasShownAnswerHeader) {
      callback(this.createStyledMessage('<strong>结果：</strong>', STYLES.ANSWER_HEADER), false, false)
      hasShownAnswerHeader = true
    }
    if (answerContent) {
      callback(answerContent, false, false)
    }
  }

  // 处理搜索查询
  private handleQueries(additionalData: any, callback: any, hasShownThinkingHeader: boolean): boolean {
    try {
      const queries = JSON.parse(additionalData.data)
      if (Array.isArray(queries) && queries.length > 0) {
        const message = `🔎 搜索关键词: ${queries.join(', ')}`
        if (!hasShownThinkingHeader) {
          callback(this.createStyledMessage(`<strong>推理过程：</strong>${message}`, STYLES.THINKING_HEADER), false, true)
          return true
        } else {
          callback(this.createStyledMessage(message, STYLES.THINKING_HEADER), false, true)
          return hasShownThinkingHeader
        }
      }
    } catch (e) {
      console.log('解析搜索查询失败:', e)
    }
    return hasShownThinkingHeader
  }

  // 处理默认additional数据
  private handleDefaultAdditional(additionalData: any, callback: any, hasShownThinkingHeader: boolean): boolean {
    if (additionalData.data?.trim()) {
      if (!hasShownThinkingHeader) {
        callback(this.createStyledMessage(`<strong>推理过程：</strong>${additionalData.data}`, STYLES.THINKING_HEADER), false, true)
        return true
      } else {
        callback(this.createStyledMessage(additionalData.data, STYLES.THINKING_HEADER), false, true)
        return hasShownThinkingHeader
      }
    }
    return hasShownThinkingHeader
  }

  // 统一的文本处理方法
  private processTextContent(content: string, isTitle: boolean = false): string {
    // 处理反斜杠和换行符
    let processedContent = content.replace(/\\/g, '').replace(/\\n/g, '\n')
    
    // 移除不需要的文本
    processedContent = processedContent.replace(TEXT_PATTERNS.UNWANTED_TEXT, '')
    
    // 应用所有文本模式处理
    const lineBreak = isTitle ? '<br>' : '\n'
    processedContent = processedContent
      .replace(TEXT_PATTERNS.CHINESE_NUMBERS, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.STEP_PATTERNS, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.PARENTHESES_NUMBERS, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.NUMBER_COMMA, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.CHINESE_WITH_PUNCTUATION, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.CHINESE_SEQUENCE, `$1${lineBreak}`)
      .replace(TEXT_PATTERNS.SIMPLE_CHINESE, `$1${lineBreak}`)
    
    if (!isTitle) {
      // 将换行符转换为 <br> 标签
      processedContent = processedContent.replace(/\n/g, '<br>')
      
      // 处理HTML标签
      processedContent = this.cleanHtmlTags(processedContent)
    } else {
      // 清理开头的换行符
      processedContent = processedContent.replace(/^<br>/, '')
    }
    
    // 清理多余的空白字符
    processedContent = processedContent.replace(/\s+/g, ' ').trim()
    
    return processedContent
  }

  // 清理HTML标签
  private cleanHtmlTags(content: string): string {
    return content
      .replace(/<img[^>]*>/gi, '') // 去掉 img 标签
      .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1') // 去掉 a 标签但保留文本内容
      .replace(/<url[^>]*>(.*?)<\/url>/gi, '$1') // 去掉 url 相关的标签
      .replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|br|div|span)\b)[^>]*>/gi, '') // 移除不允许的标签但保留内容
  }

  private processHtmlContent(content: string): string {
    return this.processTextContent(content, false)
  }

  private processTitleContent(title: string): string {
    const processedTitle = this.processTextContent(title, true)
    return `<br><p style="${STYLES.TITLE}">${processedTitle}</p>`
  }

  // 测试方法：使用模拟数据进行测试
  async sendToAIMock(message: any, callback: any) {
    console.log('🧪 使用模拟数据进行测试...')
    console.log('📝 测试消息:', message)
    console.log('📄 数据源: jsons.json')
    console.log('✨ 使用 responseReader 处理模拟数据，保持与真实API相同的处理逻辑')
    
    let hasShownThinkingHeader = false
    let hasShownAnswerHeader = false
    let abortController = new AbortController()
    
    try {
      const mockResponse = await this.createMockResponse()
      await this.responseReader(mockResponse, abortController, callback, hasShownThinkingHeader, hasShownAnswerHeader)
    } catch (error) {
      console.error('模拟测试失败:', error)
      callback(this.createStyledMessage('模拟测试失败', STYLES.ERROR), true, false)
    }
  }

  // 创建模拟的 Response 对象
  private async createMockResponse(): Promise<any> {
    const mockService = this.mockService
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const mockStream = mockService.simulateStream('')
          
          for await (const data of mockStream) {
            const encoder = new TextEncoder()
            const chunk = encoder.encode(data)
            controller.enqueue(chunk)
            
            // 模拟网络延迟
            await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 60))
          }
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return {
      body: {
        getReader() {
          return stream.getReader()
        }
      },
      ok: true,
      status: 200
    }
  }

  // 切换到模拟模式
  enableMockMode() {
    if (!this.originalSendToAI) {
      this.originalSendToAI = this.sendToAI.bind(this)
    }
    this.sendToAI = this.sendToAIMock.bind(this)
    console.log('🔄 已切换到模拟模式')
  }

  // 切换回真实API模式
  disableMockMode() {
    if (this.originalSendToAI) {
      this.sendToAI = this.originalSendToAI
      console.log('🔄 已切换回真实API模式')
    }
  }
}

export default AIService
