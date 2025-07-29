import MockAIService from './moni'

class AIService {
  private aiConfig: any
  private mockService: MockAIService

  constructor(aiConfig: any) {
    this.aiConfig = aiConfig
    this.mockService = new MockAIService(aiConfig)
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

 
    await this.responseReader(response, abortController, callback, hasShownThinkingHeader, hasShownAnswerHeader)
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
                    if (!hasShownThinkingHeader) {
                      callback('<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong>📊 开始获取搜索结果...</div>', false, true)
                      hasShownThinkingHeader = true
                    } else {
                      callback('<div style="color: #888; margin: 8px 0;">📊 开始获取搜索结果...</div>', false, true)
                    }
                    break
                  case 'get_res':
                    // 处理搜索结果数据，只显示 content 内容
                    if (additionalData.data && additionalData.data.trim()) {
                      try {
                        const resData = JSON.parse(additionalData.data)
                        if (resData.content) {
                          // 将 \n 转换为实际换行符
                          let formattedContent = resData.content.replace(/\\n/g, '\n')
                          
                          // 处理 HTML 标签，保留常见的格式标签，去掉 url 和 img
                          formattedContent = this.processHtmlContent(formattedContent)
                          
                          if (!hasShownThinkingHeader) {
                            callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong></div><div style="background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px;   line-height: 1.6;">${formattedContent}</div>`, false, true)
                            hasShownThinkingHeader = true
                          } else {
                            callback(`<div style="background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px;   line-height: 1.6;">${formattedContent}</div>`, false, true)
                          }
                        }
                      } catch (e) {
                        // 如果解析失败，使用原来的逻辑
                        if (!hasShownThinkingHeader) {
                          callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong>📄 ${additionalData.data}</div>`, false, true)
                          hasShownThinkingHeader = true
                        } else {
                          callback(`<div style="color: #888; margin: 8px 0;">📄 ${additionalData.data}</div>`, false, true)
                        }
                      }
                    }
                    break
                  case 'answer':
                    // 处理答案数据，添加"结果："前缀
                    const answerContent = json.choices[0]?.delta?.content || ''
                    if (answerContent) {
                      // 在第一个answer内容前添加"结果："前缀
                      if (!hasShownAnswerHeader) {
                        callback('<div style="height: 70px; display: flex; align-items: center; font-weight: bold; color: #333;"><strong>结果：</strong></div>', false, false)
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
                        if (!hasShownThinkingHeader) {
                          callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong>🔎 搜索关键词: ${queries.join(', ')}</div>`, false, true)
                          hasShownThinkingHeader = true
                        } else {
                          callback(`<div style="color: #888; margin: 8px 0;">🔎 搜索关键词: ${queries.join(', ')}</div>`, false, true)
                        }
                      }
                    } catch (e) {
                      console.log('解析搜索查询失败:', e)
                    }
                    break
                  // case 'start_jx': 
                  //   // 在推理开始后添加分隔符，为推理结果做准备
                  //   callback('<div style="height: 70px; display: flex; align-items: center; font-weight: bold; color: #333;"><strong>推理结果：</strong></div>', false, false)
                  //   break
                 default:
                    // 其他类型的additional数据
                    if (additionalData.data && additionalData.data.trim()) {
                      if (!hasShownThinkingHeader) {
                        callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong>${additionalData.data}</div>`, false, true)
                        hasShownThinkingHeader = true
                      } else {
                        callback(`<div style="color: #888; margin: 8px 0;">${additionalData.data}</div>`, false, true)
                      }
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
      if (err.name === 'AbortError') {
        callback('【请求已中断】', true, false)
      } else {
        callback('网络请求失败', true, false)
      }
    } finally {
      abortController = null
    }
  }

  private processHtmlContent(content: string): string {
    // 将换行符转换为 <br> 标签
    let processedContent = content.replace(/\n/g, '<br>')
    
    // 去掉 img 标签
    processedContent = processedContent.replace(/<img[^>]*>/gi, '')
    
    // 去掉 a 标签但保留文本内容
    processedContent = processedContent.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
    
    // 去掉 url 相关的标签
    processedContent = processedContent.replace(/<url[^>]*>(.*?)<\/url>/gi, '$1')
    
    // 保留常见的 HTML 格式标签：p, h1-h6, ul, ol, li, strong, em, br
    // 这些标签会被保留，其他标签会被移除但保留内容
    const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'div', 'span']
    
    // 移除不允许的标签但保留内容
    processedContent = processedContent.replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|br|div|span)\b)[^>]*>/gi, '')
    
    // 清理多余的空白字符
    processedContent = processedContent.replace(/\s+/g, ' ').trim()
    
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
      this.sendToAI = this.originalSendToAI
      console.log('🔄 已切换回真实API模式')
    }
  }

  private originalSendToAI?: Function
}

export default AIService
