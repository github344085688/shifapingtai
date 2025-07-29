import MockAIService from './moni'

// 样式常量
const STYLES = {
  THINKING_HEADER: 'color: #888; margin: 8px 0;',
  THINKING_CONTENT: 'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6;',
  ANSWER_HEADER: 'height: 70px; display: flex; align-items: center; font-weight: bold; color: #333;',
  ERROR_STYLE: 'color: red; font-weight: bold;',
  WARNING_STYLE: 'color: orange; font-weight: bold;'
}

// 消息模板
const MESSAGES = {
  SEARCH_START: '📊 开始获取搜索结果...',
  THINKING_PROCESS: '<strong>推理过程：</strong>',
  RESULT_HEADER: '<strong>结果：</strong>',
  SEARCH_KEYWORDS: '🔎 搜索关键词: '
}

// 错误消息
const ERROR_MESSAGES = {
  SERVER_ERROR: '服务器错误',
  UNAUTHORIZED: '账号未登录',
  REQUEST_ABORTED: '【请求已中断】',
  REQUEST_FAILED: '网络请求失败',
  NETWORK_ERROR: '网络错误',
  TIMEOUT: '请求超时',
  CONNECTION_FAILED: '网络连接失败'
}

class AIService {
  private aiConfig: any
  private mockService: MockAIService

  constructor(aiConfig: any) {
    this.aiConfig = aiConfig
    this.mockService = new MockAIService(aiConfig)
  }

  // 辅助方法：创建带样式的消息
  private createStyledMessage(content: string, style: string): string {
    return `<div style="${style}">${content}</div>`
  }

  // 辅助方法：处理带头部的消息
  private handleMessageWithHeader(content: string, hasShownHeader: boolean, headerText: string, callback: any, isThinking: boolean = true): boolean {
    const style = isThinking ? STYLES.THINKING_HEADER : STYLES.ANSWER_HEADER
    
    if (!hasShownHeader) {
      callback(this.createStyledMessage(`${headerText}${content}`, style), false, isThinking)
      return true
    } else {
      callback(this.createStyledMessage(content, style), false, isThinking)
      return hasShownHeader
    }
  }

  async sendToAI(message: any, callback: any) {
        
 
    let systemMessages = [
      {
        role: 'system',
        content: this.aiConfig.systemContent,
      },
    ]
    let hasShownThinkingHeader = false // 用于跟踪是否已显示"推理过程："标识
    let hasShownAnswerHeader = false // 用于跟踪是否已显示"结果："标识
    let abortController: any = null
    abortController = new AbortController()
    const signal = abortController.signal
    let paramsBody: any = {}
    if (this.aiConfig.params) {
      Object.entries(this.aiConfig.params).forEach(([key, value]) => {
        paramsBody[key] = value
      })
    }
    
    // console.log('paramsBody', this.aiConfig)
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
          messages: [  message],
          stream: true,
        }),
        signal: signal,
      })

      // 检查HTTP状态码
      if (!response.ok) {
        if (response.status === 504) {
          callback(this.createStyledMessage(ERROR_MESSAGES.SERVER_ERROR, STYLES.ERROR_STYLE), true, false)
          return
        } else if (response.status === 401) {
          callback(this.createStyledMessage(ERROR_MESSAGES.UNAUTHORIZED, STYLES.ERROR_STYLE), true, false)
          return
        } else {
          callback(this.createStyledMessage(`请求失败 (${response.status})`, STYLES.ERROR_STYLE), true, false)
          return
        }
      }

      await this.responseReader(response, abortController, callback, hasShownThinkingHeader, hasShownAnswerHeader)
    } catch (error: any) {
       console.log('Failed to fetch', error)  
      
      // 处理网络错误或其他异常
      if (error.name === 'AbortError') {
        callback(this.createStyledMessage(ERROR_MESSAGES.REQUEST_ABORTED, STYLES.WARNING_STYLE), true, false, true)
        return
      } else if (error.message && error.message.includes('504')) {
        callback(this.createStyledMessage(ERROR_MESSAGES.SERVER_ERROR, STYLES.ERROR_STYLE), true, false, true)
        return
      } else if (error.message && error.message.includes('timeout')) {
        callback(this.createStyledMessage(ERROR_MESSAGES.TIMEOUT, STYLES.ERROR_STYLE), true, false, true)
        return
      } else if (error.message && error.message.includes('Failed to fetch')) {
        callback(this.createStyledMessage(ERROR_MESSAGES.CONNECTION_FAILED, STYLES.ERROR_STYLE), true, false, true)
        return
      } else if (error.includes && error.includes('Failed to fetch')) { 
        callback(this.createStyledMessage(ERROR_MESSAGES.NETWORK_ERROR, STYLES.ERROR_STYLE), true, false, true)
        return
      } else { 
        callback(this.createStyledMessage(ERROR_MESSAGES.NETWORK_ERROR, STYLES.ERROR_STYLE), true, false, true)
      }
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
        // 按事件分割数据（每个事件以 \n\n 结尾）
        const chunks = buffer.split('\n\n') 
        if(chunks[0]) {
          // 检查是否包含错误代码401
          if(countershu ===0 && chunks[0].includes('"code":401')) {
            const errorData = JSON.parse(chunks[0]);  
            callback(errorData.msg, false, false)
            callback(null, true, false) // 标记流结束
            countershu=1;
            break
          }
        }
        buffer = chunks.pop() || '' // 保留未完整数据

        for (const chunk of chunks) {
          const eventData = chunk.replace(/^data:\s*/, '').trim()
          if(countershu===0 && eventData.includes('"data":"AI思考中……"')){
            // console.log('eventData',eventData)
            callback('', false, true)
            break
            //  return
          }
          if (!eventData) continue 
          // 检查是否为[DONE]消息
          countershu=1;
          if (eventData === '[DONE]') {
            callback(null, true, false) // 标记流结束
            continue
          }
          try { 
            const json = JSON.parse(eventData)
            console.log('检查模型是否包含 "gpt" 字符串啊实打实')
            // 检查模型是否包含 "gpt" 字符串
            const model = json.model || this.aiConfig.model || ''
            const isGptModel = model.toLowerCase().includes('gpt')
            
            if (isGptModel) {
              // 如果是 GPT 模型，使用增强逻辑处理推理数据、搜索结果数据、材料数据
              
              // 处理思考和推理数据
              const additionalData = json.choices[0]?.additional
              if (additionalData) {
                // 排除不需要的类型：step, qacls, start_search
                if (['step', 'qacls', 'start_search', 'get_mat'].includes(additionalData.type)) {
                  continue
                }
                
                switch (additionalData.type) {
                  case 'start_res':
                    // 处理搜索结果开始
                    hasShownThinkingHeader = this.handleMessageWithHeader(
                      MESSAGES.SEARCH_START, 
                      hasShownThinkingHeader, 
                      MESSAGES.THINKING_PROCESS, 
                      callback
                    )
                    break
                  case 'get_res':
                    // 处理搜索结果数据，只显示 content 内容
                    if (additionalData.data && additionalData.data.trim()) {
                      try {
                        const resData = JSON.parse(additionalData.data)
                        if (resData.content) {
                          let formattedContent = resData.content.replace(/\\n/g, '\n')
                          
                          // 处理搜索结果的特殊格式
                          formattedContent = this.processSearchResultContent(formattedContent, resData.title)
                          
                          const contentDiv = `<div style="${STYLES.THINKING_CONTENT}">${formattedContent}</div>`
                          
                          if (!hasShownThinkingHeader) {
                            callback(this.createStyledMessage(MESSAGES.THINKING_PROCESS, STYLES.THINKING_HEADER) + contentDiv, false, true)
                            hasShownThinkingHeader = true
                          } else {
                            callback(contentDiv, false, true)
                          }
                        }
                      } catch (e) {
                        // 如果解析失败，使用原来的逻辑
                        hasShownThinkingHeader = this.handleMessageWithHeader(
                          `📄 ${additionalData.data}`, 
                          hasShownThinkingHeader, 
                          MESSAGES.THINKING_PROCESS, 
                          callback
                        )
                      }
                    }
                    break
                  case 'answer':
                    // 处理答案数据，添加"结果："前缀
                    const answerContent = json.choices[0]?.delta?.content || ''
                    if (answerContent) {
                      // 在第一个answer内容前添加"结果："前缀
                      if (!hasShownAnswerHeader) {
                        callback(this.createStyledMessage(MESSAGES.RESULT_HEADER, STYLES.ANSWER_HEADER), false, false)
                        hasShownAnswerHeader = true
                      }
                      callback(answerContent, false, false)
                    }
                    break 
                  case 'queries':
                    // 搜索查询语句
                    try {
                      const queries = JSON.parse(additionalData.data)
                      if (Array.isArray(queries) && queries.length > 0) {
                        hasShownThinkingHeader = this.handleMessageWithHeader(
                          `${MESSAGES.SEARCH_KEYWORDS}${queries.join(', ')}`, 
                          hasShownThinkingHeader, 
                          MESSAGES.THINKING_PROCESS, 
                          callback
                        )
                      }
                    } catch (e) {
                      console.log('解析搜索查询失败:', e)
                    }
                    break
                 default:
                    // 其他类型的additional数据
                    if (additionalData.data && additionalData.data.trim()) {
                      hasShownThinkingHeader = this.handleMessageWithHeader(
                        additionalData.data, 
                        hasShownThinkingHeader, 
                        MESSAGES.THINKING_PROCESS, 
                        callback
                      )
                    }
                    break
                }
              }
              
              // 处理正常的内容输出（非answer类型的内容）
              const content = json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : ''
              const deltaType = json.choices[0]?.delta?.type
              
              if (content && deltaType !== 'answer') {
                // 实时输出内容
                callback(content, false, false) // 第三个参数为false表示这是正常内容
              }
            } else {
              // 如果不是 GPT 模型，使用原有的简单逻辑
              const content =
                json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : ''
              // 实时输出内容
              callback(content, false, false)
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

  private processSearchResultContent(content: string, title?: string): string {
    let processedContent = content

    // 清理不需要的文字
    processedContent = processedContent
      .replace(/正在输入\.\.\./g, '')
      .replace(/\.打开对话/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\\"/g, '"')

    // 处理编号格式的断行
    // 一、二、三等（前面带标点符号）
    processedContent = processedContent.replace(/([*]?)([一二三四五六七八九十]+)、/g, (match, asterisk, number) => {
      return `<br>${asterisk}${number}、`
    })

    // 第一步、第二步、第三步等
    processedContent = processedContent.replace(/([*]?)第([一二三四五六七八九十]+|[0-9]+)步，/g, (match, asterisk, number) => {
      return `<br>${asterisk}第${number}步，`
    })

    // 1. 2. 3. 等（排除时间格式）
    processedContent = processedContent.replace(/([*]?)([0-9]+)\.\s/g, (match, asterisk, number, offset, string) => {
      // 检查前后文是否为时间格式（如 12:30 或 2023.01.01）
      const beforeChar = string[offset - 1]
      const afterChars = string.substring(offset + match.length, offset + match.length + 3)
      
      // 如果前面是数字或冒号，或后面是数字和冒号，可能是时间格式，不处理
      if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
        return match
      }
      
      return `<br>${asterisk}${number}. `
    })

    // （一）（二）（三）等
    processedContent = processedContent.replace(/([*]?)（([一二三四五六七八九十]+)）/g, (match, asterisk, number) => {
      return `<br>${asterisk}（${number}）`
    })

    // 1，2，3，等（排除时间）
    processedContent = processedContent.replace(/([*]?)([0-9]+)，/g, (match, asterisk, number, offset, string) => {
      // 检查前后文是否为时间格式
      const beforeChar = string[offset - 1]
      const afterChars = string.substring(offset + match.length, offset + match.length + 3)
      
      // 如果前面是数字或冒号，或后面是数字和冒号，可能是时间格式，不处理
      if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
        return match
      }
      
      return `<br>${asterisk}${number}，`
    })

    // 第一、第二等
    processedContent = processedContent.replace(/([*]?)第([一二三四五六七八九十]+)/g, (match, asterisk, number) => {
      return `<br>${asterisk}第${number}`
    })

    // 处理 HTML 内容
    processedContent = this.processHtmlContent(processedContent)

    // 如果有 title，添加灰黑色样式并另起一行
    if (title && title.trim()) {
      const titleHtml = `<div style="color: #333; font-weight: bold; margin-bottom: 8px; line-height: 1.4;">${title}</div>`
      processedContent = titleHtml + processedContent
    }

    return processedContent
  }

  private processHtmlContent(content: string): string {
    // 将换行符转换为 <br> 标签
    let processedContent = content.replace(/\n/g, '<br>')
    
    // 清理不需要的标签
    processedContent = processedContent
      .replace(/<img[^>]*>/gi, '') // 去掉 img 标签
      .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1') // 去掉 a 标签但保留文本内容
      .replace(/<url[^>]*>(.*?)<\/url>/gi, '$1') // 去掉 url 相关的标签
      .replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|br|div|span)\b)[^>]*>/gi, '') // 移除不允许的标签但保留内容
      .replace(/\s+/g, ' ').trim() // 清理多余的空白字符
    
    return processedContent
  }

  // 测试方法：使用模拟数据进行测试
  // 🔄 改进：现在使用相同的 responseReader 处理模拟数据，确保与真实API行为一致
  async sendToAIMock(message: any, callback: any) {
    console.log('🧪 使用模拟数据进行测试...')
    console.log('📝 测试消息:', message)
    console.log('📄 数据源: jsons.json')
    console.log('✨ 使用 responseReader 处理模拟数据，保持与真实API相同的处理逻辑')
    
    let hasShownThinkingHeader = false // 用于跟踪是否已显示"推理过程："标识
    let hasShownAnswerHeader = false // 用于跟踪是否已显示"结果："标识
    let abortController: any = null
    abortController = new AbortController()
    
    try {
      // 创建模拟的 Response 对象，模拟真实的 fetch 响应
      const mockResponse = await this.createMockResponse()
      
      // 🎯 关键改进：使用相同的 responseReader 处理模拟数据
      // 这确保了模拟测试与真实API使用完全相同的数据处理逻辑
      await this.responseReader(mockResponse, abortController, callback, hasShownThinkingHeader, hasShownAnswerHeader)
    } catch (error) {
      console.error('模拟测试失败:', error)
      callback('模拟测试失败', true, false)
    }
  }

  // 创建模拟的 Response 对象
  // 🔧 此方法将模拟数据包装成与真实 fetch Response 兼容的格式
  private async createMockResponse(): Promise<any> {
    const mockService = this.mockService // 保存引用避免作用域问题
    
    // 创建一个可读流来模拟真实的 Response.body
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 获取模拟数据流
          const mockStream = mockService.simulateStream('')
          
          for await (const data of mockStream) {
            // 将字符串转换为 Uint8Array，模拟网络传输的二进制数据
            const encoder = new TextEncoder()
            const chunk = encoder.encode(data)
            controller.enqueue(chunk)
            
            // 模拟网络延迟，使测试更接近真实环境
            await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 60))
          }
          
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    // 返回与真实 fetch Response 兼容的对象
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

  // 切换到模拟模式的方法
  enableMockMode() {
    // 备份原始方法
    if (!this.originalSendToAI) {
      this.originalSendToAI = this.sendToAI.bind(this)
    }
    
    // 替换为模拟方法
    this.sendToAI = this.sendToAIMock.bind(this)
    console.log('🔄 已切换到模拟模式')
  }

  // 切换回真实API模式的方法
  disableMockMode() {
    if (this.originalSendToAI) {
      this.sendToAI = this.originalSendToAI as (message: any, callback: any) => Promise<void>
      console.log('🔄 已切换回真实API模式')
    }
  }

  private originalSendToAI?: (message: any, callback: any) => Promise<void>
}

export default AIService
