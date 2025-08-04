import MockAIService from './moni'
import { TextProcessor } from './processingData'

// 样式常量
const STYLES = {
  THINKING_HEADER: 'color: #000000; margin: 8px 0;',
  THINKING_CONTENT:
    'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6; color: #676666;',
  ANSWER_HEADER:
    'height: 70px; display: flex; align-items: center; font-weight: bold; color: #000000; font-size: 1.85rem; font-weight: 700;',
  ERROR_STYLE: 'color: red; font-weight: bold;',
  WARNING_STYLE: 'color: orange; font-weight: bold;',
}

// 消息模板
const MESSAGES = {
  SEARCH_START: '获取搜索结果：',
  THINKING_PROCESS: '<strong></strong>',
  RESULT_HEADER: '<strong style="font-size: 1.85rem; font-weight: 700;">结果：</strong>',
  SEARCH_KEYWORDS: '搜索关键词: ',
  SEARCH_PROCESS: '<strong>搜索过程：</strong>',
}

// 错误消息
const ERROR_MESSAGES = {
  SERVER_ERROR: '服务器错误',
  UNAUTHORIZED: '账号未登录',
  REQUEST_ABORTED: '【请求已中断】',
  REQUEST_FAILED: '网络请求失败',
  NETWORK_ERROR: '网络错误',
  TIMEOUT: '请求超时',
  CONNECTION_FAILED: '网络连接失败',
}

// 条件性导入 - 只在开发环境中导入
let MockAIService: any = null

// 在开发环境中动态导入
if (import.meta.env.DEV) {
  try {
    const mockModule = await import('./moni')
    MockAIService = mockModule.default
  } catch (error) {
    console.warn('Mock service not available:', error)
  }
}

class AIService {
  private aiConfig: any
  private mockService: any

  constructor(aiConfig: any) {
    this.aiConfig = aiConfig
    // 只在开发环境且 MockAIService 可用时创建实例
    this.mockService = import.meta.env.DEV && MockAIService ? new MockAIService(aiConfig) : null
  }

  // 辅助方法：处理带头部的消息
  private handleMessageWithHeader(
    content: string,
    hasShownHeader: boolean,
    headerText: string,
    callback: any,
    isThinking: boolean = true,
  ): boolean {
    const style = isThinking ? STYLES.THINKING_HEADER : STYLES.ANSWER_HEADER
    return TextProcessor.handleMessageWithHeader(
      content,
      hasShownHeader,
      headerText,
      callback,
      isThinking,
      style,
    )
  }

  async sendToAI(message: any, callback: any, lastMessage: any) {
    let systemMessages = [
      {
        role: 'system',
        content: this.aiConfig.systemContent,
      },
    ]
    let hasShownThinkingHeader = false // 用于跟踪是否已显示"推理过程："标识
    let hasShownAnswerHeader = false // 用于跟踪是否已显示"结果："标识
    let hasShownSearchProcessHeader = false // 用于跟踪是否已显示"搜索过程："标识
    let abortController: any = null
    abortController = new AbortController()
    const signal = abortController.signal
    let paramsBody: any = {}
    if (this.aiConfig.params) {
      Object.entries(this.aiConfig.params).forEach(([key, value]) => {
        paramsBody[key] = value
      })
    }

    console.log('paramsBody啊实打实大苏打大', this.aiConfig)
    try {
      const response = await fetch(this.aiConfig.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
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
        if (response.status === 504) {
          callback(
            this.createStyledMessage(ERROR_MESSAGES.SERVER_ERROR, STYLES.ERROR_STYLE),
            true,
            false,
          )
          return
        } else if (response.status === 401) {
          callback(
            this.createStyledMessage(ERROR_MESSAGES.UNAUTHORIZED, STYLES.ERROR_STYLE),
            true,
            false,
          )
          return
        } else {
          callback(
            this.createStyledMessage(`请求失败 (${response.status})`, STYLES.ERROR_STYLE),
            true,
            false,
          )
          return
        }
      }

      await this.responseReader(
        response,
        abortController,
        callback,
        hasShownThinkingHeader,
        hasShownAnswerHeader,
        lastMessage,
        hasShownSearchProcessHeader,
      )
    } catch (error: any) {
      console.log('Failed to fetch', error)

      // 处理网络错误或其他异常
      if (error.name === 'AbortError') {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.REQUEST_ABORTED, STYLES.WARNING_STYLE),
          true,
          false,
          true,
        )
        return
      } else if (error.message && error.message.includes('504')) {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.SERVER_ERROR, STYLES.ERROR_STYLE),
          true,
          false,
          true,
        )
        return
      } else if (error.message && error.message.includes('timeout')) {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.TIMEOUT, STYLES.ERROR_STYLE),
          true,
          false,
          true,
        )
        return
      } else if (error.message && error.message.includes('Failed to fetch')) {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.CONNECTION_FAILED, STYLES.ERROR_STYLE),
          true,
          false,
          true,
        )
        return
      } else if (error.includes && error.includes('Failed to fetch')) {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.NETWORK_ERROR, STYLES.ERROR_STYLE),
          true,
          false,
          true,
        )
        return
      } else {
        callback(
          this.createStyledMessage(ERROR_MESSAGES.NETWORK_ERROR, STYLES.ERROR_STYLE),
          true,
          false,
          true,
        )
      }
    }
  }

  private async responseReader(
    response: any,
    abortController: any,
    callback: any,
    hasShownThinkingHeader: boolean,
    hasShownAnswerHeader: boolean,
    lastMessage?: any,
    hasShownSearchProcessHeader?: boolean,
  ) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let countershu = 0
    let stepContent = '' // 用于累积 step 内容
    hasShownSearchProcessHeader = hasShownSearchProcessHeader || false

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
        if (chunks[0]) {
          // 检查是否包含错误代码401
          if (countershu === 0 && chunks[0].includes('"code":401')) {
            const errorData = JSON.parse(chunks[0])
            callback(this.createStyledMessage(errorData.message, STYLES.ERROR_STYLE), true, false)
            return
          }
        }

        buffer = chunks.pop() || '' // 保留最后一个不完整的块
        countershu++

        for (const chunk of chunks) {
          const eventData = chunk.replace(/^data:\s*/, '').trim()
          if (!eventData) continue

          if (eventData === '[DONE]') {
            callback(null, true, false) // 标记流结束
            continue
          }
          try {
            const json = JSON.parse(eventData)
            // console.log('检查模型是否包含 "gpt" 字符串啊实打实')
            // 检查模型是否包含 "gpt" 字符串或者是 "fyllm" 模型
            const model = json.model || this.aiConfig.model || ''
            const isGptModel =
              model.toLowerCase().includes('gpt') || model.toLowerCase().includes('fyllm')

            if (isGptModel) {
              // 如果是 GPT 模型或 fyllm 模型，使用增强逻辑处理推理数据、搜索结果数据、材料数据

              // 处理思考和推理数据
              const additionalData = json.choices[0]?.additional
              if (additionalData) {
                // 移除对 step 类型的跳过处理，只排除其他不需要的类型
                if (['qacls', 'start_search', 'get_mat'].includes(additionalData.type)) {
                  continue
                }

                // 特殊处理：排除特定的 console 类型数据
                if (additionalData.type === 'console' && additionalData.data === 'AI思考中……') {
                  continue
                }
                switch (additionalData.type) {
                  case 'step':
                    // 处理 step 类型数据 - 属于"搜索过程"
                    const stepData = additionalData.data

                    // 先判断是否为换行符
                    if (stepData === '\n') {
                      // 如果是换行符，移除 lastMessage.content 中"搜索过程"下的内容，但保留标题
                      if (lastMessage && lastMessage.content) {
                        // 使用正则表达式移除"搜索过程"标题后的所有内容，但保留标题
                        const searchProcessRegex = new RegExp(
                          `(${MESSAGES.SEARCH_PROCESS})[\\s\\S]*?(?=<strong>|$)`,
                          'g',
                        )
                        lastMessage.content = lastMessage.content.replace(searchProcessRegex, '$1')
                        console.log('已从 lastMessage.content 中移除搜索过程下的内容，保留标题')
                      }
                      // 重置 stepContent，但不重置 hasShownSearchProcessHeader，保持"搜索过程"标题已显示的状态
                      stepContent = ''
                      continue // 跳过此次处理，不输出换行符
                    } else {
                      // 累积 step 内容
                      stepContent += stepData

                      // 在第一个 step 内容前添加"搜索过程："前缀（只显示一次）
                      if (!hasShownSearchProcessHeader) {
                        callback(
                          this.createStyledMessage(MESSAGES.SEARCH_PROCESS, STYLES.THINKING_HEADER),
                          false,
                          false,
                        )
                        hasShownSearchProcessHeader = true
                      }

                      // 返回 step 数据
                      callback(stepData, false, false)
                    }
                    break

                  case 'start_jx':
                    // 处理 start_jx 类型 - 移除"搜索过程"及相关下的内容
                    if (lastMessage && lastMessage.content) {
                      // 使用正则表达式移除所有"搜索过程"相关内容（包括标题）
                      const searchProcessRegex = new RegExp(
                        MESSAGES.SEARCH_PROCESS + '[\\s\\S]*?(?=<strong>|$)',
                        'g',
                      )
                      lastMessage.content = lastMessage.content.replace(searchProcessRegex, '')
                      console.log(
                        '遇到 start_jx，已从 lastMessage.content 中移除所有搜索过程相关内容',
                      )
                    }
                    // 重置相关状态
                    stepContent = ''
                    hasShownSearchProcessHeader = false
                    break

                  case 'start_res':
                    // 处理搜索结果开始
                    hasShownThinkingHeader = this.handleMessageWithHeader(
                      MESSAGES.SEARCH_START,
                      hasShownThinkingHeader,
                      MESSAGES.THINKING_PROCESS,
                      callback,
                    )
                    break
                  case 'get_res':
                    // 处理搜索结果数据，只显示 content 内容
                    if (additionalData.data && additionalData.data.trim()) {
                      try {
                        const resData = JSON.parse(additionalData.data)
                        if (resData.content) {
                          let formattedContent = resData.content.replace(/\\n/g, '\n')

                          // 使用公共方法处理搜索结果的特殊格式
                          formattedContent = TextProcessor.processSearchResultContent(
                            formattedContent,
                            resData.title,
                          )

                          const contentDiv = `<div style="${STYLES.THINKING_CONTENT}">${formattedContent}</div>`

                          if (!hasShownThinkingHeader) {
                            callback(
                              TextProcessor.createStyledMessage(
                                MESSAGES.THINKING_PROCESS,
                                STYLES.THINKING_HEADER,
                              ) + contentDiv,
                              false,
                              true,
                            )
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
                          callback,
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
                        callback(
                          this.createStyledMessage(MESSAGES.RESULT_HEADER, STYLES.ANSWER_HEADER),
                          false,
                          false,
                        )
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
                          callback,
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
                        callback,
                      )
                    }
                    break
                }
              }

              // 处理正常的内容输出（非answer类型的内容）
              const content =
                json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : ''
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
      const errorMessage =
        err.name === 'AbortError' ? ERROR_MESSAGES.REQUEST_ABORTED : ERROR_MESSAGES.REQUEST_FAILED
      callback(errorMessage, true, false)
    } finally {
      abortController = null
    }
  }

  // 测试方法：使用模拟数据进行测试
  async sendToAIMock(message: any, callback: any, lastMessage: any) {
    console.log('🧪 使用模拟数据进行测试...')
    console.log('📝 测试消息:', message)
    console.log('📄 数据源: jsons.json')
    console.log('✨ 使用 responseReader 处理模拟数据，保持与真实API相同的处理逻辑')

    let hasShownThinkingHeader = false // 用于跟踪是否已显示"推理过程："标识
    let hasShownAnswerHeader = false // 用于跟踪是否已显示"结果："标识
    let abortController: any = null
    abortController = new AbortController()

    // 用于累积 step 类型的内容
    let stepContent = ''

    try {
      // 创建模拟的 Response 对象，模拟真实的 fetch 响应
      const mockResponse = await this.createMockResponse()

      // 🎯 关键改进：使用相同的 responseReader 处理模拟数据
      // 这确保了模拟测试与真实API使用完全相同的数据处理逻辑
      await this.responseReader(
        mockResponse,
        abortController,
        callback,
        hasShownThinkingHeader,
        hasShownAnswerHeader,
        lastMessage,
        stepContent,
      )
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
            await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 60))
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    // 返回与真实 fetch Response 兼容的对象
    return {
      body: {
        getReader() {
          return stream.getReader()
        },
      },
      ok: true,
      status: 200,
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
