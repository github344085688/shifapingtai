import MockAIService from './moni'
import { TextProcessor } from './processingData'
import { getApiKeyFromUrl, setTimes, interceptData } from './units'

// 样式常量
const STYLES = {
  THINKING_HEADER: 'color: #000000; margin: 8px 0;',
  THINKING_CONTENT:
    'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6; color: #676666;',
  ANSWER_HEADER: 'display: flex; align-items: center; font-weight: bold; color: #000000; ',
  ERROR_STYLE: 'color: red; font-weight: bold;',
  WARNING_STYLE: 'color: orange; font-weight: bold;',
}

// 消息模板
const MESSAGES = {
  SEARCH_START: '获取搜索结果：',
  THINKING_PROCESS: '<strong></strong>',
  RESULT_HEADER: ' ',
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

    // 在开发环境下，且配置了 useMock 时，自动切换到模拟模式
    if (import.meta.env.DEV && this.mockService && aiConfig?.useMock) {
      this.enableMockMode()
    }
  }

  // 辅助方法：创建带样式的消息
  private createStyledMessage(content: string, style: string): string {
    return TextProcessor.createStyledMessage(content, style)
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

  async sendToAI(message: any, callback: any, lastMessage: any = null) {
    // console.log('import.meta.env.DEV2222222222', this.aiConfig)

    // 在发送到 AI 之前先记录次数，确保 POST 成功后再继续
    if (this.aiConfig.isTimer) await setTimes()
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
    const KeyFromUrl = getApiKeyFromUrl()
    // console.log('paramsBody------------------------', KeyFromUrl)
    try {
      const response = await fetch(this.aiConfig.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          Authorization: 'Bearer ' + KeyFromUrl,
        },
        body: JSON.stringify({
          model: this.aiConfig.model,
          messages: [message],
          stream: true,
        }),
        signal: signal,
      })
      const Intercepted: any = await interceptData(response)
      if (Intercepted && Intercepted.code === 500) {
        callback(Intercepted.msg, true, false, true)
        return
      }
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
    // numberOfInterceptions('')
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let countershu = 0
    let stepContent = '' // 用于累积 step 内容
    hasShownSearchProcessHeader = hasShownSearchProcessHeader || false
    let listStarted = false
    let collectingListItem = false
    let numListStarted = false
    let numCollectingItem = false
    let numPendingNumber: string | null = null
    let parenOpen = false

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callback(null, true, false)
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // 清理缓冲区中的无效字符
        buffer = buffer.replace(/\r/g, '')

        // 按事件分割数据（每个事件以 \n\n 结尾）
        const chunks = buffer.split('\n\n')
        if (chunks[0]) {
          // 检查是否包含错误代码401
          if (
            countershu === 0 &&
            chunks[0].includes('"code":401') &&
            !chunks[0].startsWith('retry:')
          ) {
            const firstChunkData = chunks[0].replace(/^data:\s*/, '').trim()
            if (firstChunkData && firstChunkData.startsWith('{')) {
              try {
                const errorData = JSON.parse(firstChunkData)
                callback(
                  this.createStyledMessage(errorData.message, STYLES.ERROR_STYLE),
                  true,
                  false,
                )
                return
              } catch (e) {
                console.warn('Failed to parse error data:', e)
              }
            }
          }
        }

        buffer = chunks.pop() || '' // 保留最后一个不完整的块
        countershu++

        for (const chunk of chunks) {
          // 跳过空chunk或只包含空白字符的chunk
          if (!chunk || !chunk.trim()) {
            continue
          }

          // 跳过 retry: 行
          if (chunk.startsWith('retry:')) {
            continue
          }

          const eventData = chunk.replace(/^data:\s*/, '').trim()
          if (!eventData) continue

          if (eventData === '[DONE]') {
            if (listStarted && collectingListItem) {
              callback('</li></ul>', false, false)
              collectingListItem = false
              listStarted = false
            }
            if (numListStarted) {
              if (numCollectingItem) {
                callback('</li></ol>', false, false)
              } else {
                callback('</ol>', false, false)
              }
              numCollectingItem = false
              numListStarted = false
              numPendingNumber = null
            }
            callback(null, true, false)
            continue
          }

          // 验证是否为有效的JSON格式（必须以{开头）
          if (!eventData.startsWith('{')) {
            console.warn('Skipping non-JSON data:', eventData.substring(0, 50))
            continue
          }

          try {
            // 使用专门的SSE JSON解析方法
            const json = this.parseSSEJsonData(eventData)

            // 如果解析失败，跳过这个chunk
            if (!json) {
              continue
            }
            // 检查模型是否包含 "gpt" 字符串或者是 "fyllm" 模型
            const model = json.model || this.aiConfig.model || ''
            const isGptModel = false
            // model.toLowerCase().includes('gpt') || model.toLowerCase().includes('fyllm')

            // 检查是否为法律相关接口
            const isLegalInterface = this.isLegalInterface()

            if (isGptModel || isLegalInterface) {
              // 新增：统一跳过无 delta.content 或为空字符串的消息
              const deltaContentRaw = json.choices?.[0]?.delta?.content
              const hasDeltaContent =
                typeof deltaContentRaw === 'string'
                  ? deltaContentRaw.trim().length > 0
                  : !!deltaContentRaw
              if (!hasDeltaContent) {
                continue
              }

              // 如果是 GPT 模型、fyllm 模型或法律接口，使用增强逻辑处理推理数据、搜索结果数据、材料数据
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

                // 新增：屏蔽 citation 中包含 t2we*、laws1、laws_1 的ID；以及单行只有一个 “#”
                const dataStrFilter = (additionalData.data || '').trim()
                if (additionalData.type === 'citation') {
                  const blockedExact = new Set(['laws1', 'laws_1'])
                  const isBlockedId = (id: string) =>
                    typeof id === 'string' &&
                    (id.toLowerCase().startsWith('t2we') || blockedExact.has(id))

                  let shouldBlock = false
                  try {
                    if (dataStrFilter.startsWith('[')) {
                      const ids = JSON.parse(dataStrFilter)
                      if (Array.isArray(ids)) {
                        shouldBlock = ids.some((id) => isBlockedId(id))
                      }
                    }
                  } catch {}

                  // 解析失败时的兜底：直接字符串命中
                  if (!shouldBlock) {
                    if (
                      /"t2we[^"]*"/i.test(dataStrFilter) ||
                      dataStrFilter.includes('laws_1') ||
                      dataStrFilter.includes('laws1')
                    ) {
                      shouldBlock = true
                    }
                  }

                  if (shouldBlock) {
                    continue
                  }
                }

                if (dataStrFilter === '#') {
                  continue
                }

                switch (additionalData.type) {
                  case 'step':
                    // 处理 step 类型数据 - 属于"搜索过程"
                    const stepData = additionalData.data

                    // 屏蔽单行 '#' 的 step
                    if (stepData && String(stepData).trim() === '#') {
                      continue
                    }

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
                        const dataStr = additionalData.data.trim()
                        if (!dataStr.startsWith('{') && !dataStr.startsWith('[')) {
                          console.warn('Skipping non-JSON additionalData:', dataStr)
                          break
                        }
                        const resData = JSON.parse(dataStr)
                        if (resData.content) {
                          let formattedContent = resData.content.replace(/\\n/g, '\n')

                          // 根据接口类型选择不同的处理方法
                          if (this.isLawInterface()) {
                            // 法律法规接口使用法条处理
                            formattedContent = TextProcessor.processLawContent(resData)
                          } else if (this.isWebSearchInterface()) {
                            // 网络搜索接口使用网络内容处理
                            formattedContent = TextProcessor.processWebContent(resData)
                          } else {
                            // 其他接口使用通用搜索结果处理
                            formattedContent = TextProcessor.processSearchResultContent(
                              formattedContent,
                              resData.title,
                            )
                          }

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
                    let answerContent = json.choices[0]?.delta?.content || ''
                    // 屏蔽单行 '#' 的 answer
                    if (!answerContent || answerContent.trim() === '#') {
                      break
                    }
                    // 流式 H3 解析：仅基于 '###' 开始 和 '\n' 结束
                    if (typeof (this as any)._inH3 === 'undefined') {
                      ;(this as any)._inH3 = false
                      ;(this as any)._h3Buffer = ''
                    }

                    const h3Style =
                      'font-size:1.2em;font-weight:bold;margin:16px 0 8px 0;color:#333;'

                    const flushH3 = () => {
                      const text = String((this as any)._h3Buffer || '').trim()
                      ;(this as any)._h3Buffer = ''
                      ;(this as any)._inH3 = false
                      if (!text) return
                      const h3Html = `<h3 style="${h3Style}">${text}</h3>\n`
                      if (!hasShownAnswerHeader) {
                        callback(
                          this.createStyledMessage(MESSAGES.RESULT_HEADER, STYLES.ANSWER_HEADER),
                          false,
                          false,
                        )
                        hasShownAnswerHeader = true
                      }
                      callback(h3Html, false, false)
                    }

                    const tok = answerContent

                    // 检测开始：严格匹配以 '###' 起始
                    if (!(this as any)._inH3 && /^###(?:\s|$)/.test(tok)) {
                      ;(this as any)._inH3 = true
                      const after = tok.replace(/^###\s*/, '')
                      const nlIdx = after.indexOf('\n')
                      if (nlIdx >= 0) {
                        ;(this as any)._h3Buffer = after.slice(0, nlIdx)
                        flushH3()
                        const rest = after.slice(nlIdx + 1)
                        if (rest) {
                          const processed = TextProcessor.processSearchResultContent(rest)
                          if (!hasShownAnswerHeader) {
                            callback(
                              this.createStyledMessage(
                                MESSAGES.RESULT_HEADER,
                                STYLES.ANSWER_HEADER,
                              ),
                              false,
                              false,
                            )
                            hasShownAnswerHeader = true
                          }
                          callback(processed, false, false)
                        }
                      } else {
                        ;(this as any)._h3Buffer = after
                      }
                      break
                    }

                    // 处于 H3 中：累计直到遇到换行
                    if ((this as any)._inH3) {
                      const nlIdx = tok.indexOf('\n')
                      if (nlIdx >= 0) {
                        ;(this as any)._h3Buffer += tok.slice(0, nlIdx)
                        flushH3()
                        const rest = tok.slice(nlIdx + 1)
                        if (rest) {
                          const processed = TextProcessor.processSearchResultContent(rest)
                          if (!hasShownAnswerHeader) {
                            callback(
                              this.createStyledMessage(
                                MESSAGES.RESULT_HEADER,
                                STYLES.ANSWER_HEADER,
                              ),
                              false,
                              false,
                            )
                            hasShownAnswerHeader = true
                          }
                          callback(processed, false, false)
                        }
                      } else {
                        ;(this as any)._h3Buffer += tok
                      }
                      break
                    }

                    if (answerContent) {
                      const processed = TextProcessor.processSearchResultContent(answerContent)
                      if (!hasShownAnswerHeader) {
                        callback(
                          this.createStyledMessage(MESSAGES.RESULT_HEADER, STYLES.ANSWER_HEADER),
                          false,
                          false,
                        )
                        hasShownAnswerHeader = true
                      }
                      callback(processed, false, false)
                    }
                    break
                  case 'queries':
                    // 搜索查询语句
                    try {
                      const dataStr = additionalData.data.trim()
                      if (!dataStr.startsWith('[') && !dataStr.startsWith('{')) {
                        console.warn('Skipping non-JSON queries data:', dataStr)
                        break
                      }
                      const queries = JSON.parse(dataStr)
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
                  // 新增：处理法律相关的特殊数据类型
                  case 'law_article':
                    // 处理法条数据
                    if (additionalData.data && additionalData.data.trim()) {
                      try {
                        const dataStr = additionalData.data.trim()
                        if (!dataStr.startsWith('{') && !dataStr.startsWith('[')) {
                          console.warn('Skipping non-JSON law data:', dataStr)
                          break
                        }
                        const lawData = JSON.parse(dataStr)
                        const formattedContent = TextProcessor.processLawContent(lawData)
                        const contentDiv = `<div style="${STYLES.THINKING_CONTENT}">${formattedContent}</div>`

                        hasShownThinkingHeader = this.handleMessageWithHeader(
                          contentDiv,
                          hasShownThinkingHeader,
                          MESSAGES.THINKING_PROCESS,
                          callback,
                        )
                      } catch (e) {
                        console.error('解析法条数据失败:', e)
                      }
                    }
                    break
                  case 'web_search':
                    // 处理网络搜索数据
                    if (additionalData.data && additionalData.data.trim()) {
                      try {
                        const dataStr = additionalData.data.trim()
                        if (!dataStr.startsWith('{') && !dataStr.startsWith('[')) {
                          console.warn('Skipping non-JSON web data:', dataStr)
                          break
                        }
                        const webData = JSON.parse(dataStr)
                        const formattedContent = TextProcessor.processWebContent(webData)
                        const contentDiv = `<div style="${STYLES.THINKING_CONTENT}">${formattedContent}</div>`

                        hasShownThinkingHeader = this.handleMessageWithHeader(
                          contentDiv,
                          hasShownThinkingHeader,
                          MESSAGES.THINKING_PROCESS,
                          callback,
                        )
                      } catch (e) {
                        console.error('解析网络搜索数据失败:', e)
                      }
                    }
                    break
                  default:
                    // 其他类型的additional数据
                    if (additionalData.data && additionalData.data.trim()) {
                      // 对所有其他数据也进行 processSearchResultContent 处理
                      let processedData = TextProcessor.processSearchResultContent(
                        additionalData.data,
                      )

                      hasShownThinkingHeader = this.handleMessageWithHeader(
                        processedData,
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

              // 检查是否已经处理了answer类型的数据
              const hasAnswerType = json.choices[0]?.additional?.type === 'answer'

              if (content && deltaType !== 'answer' && !hasAnswerType) {
                const trimmed = (content || '').trim()
                if (trimmed === '**') {
                  continue
                }
                const isLineBreak = trimmed === '<br>' || content === '\n' || content === '\r\n'
                if (isLineBreak) {
                  if (numListStarted && numCollectingItem) {
                    callback('</li>', false, false)
                    numCollectingItem = false
                  }
                  if (listStarted && collectingListItem) {
                    callback('</li>', false, false)
                    collectingListItem = false
                  }
                  continue
                }
                const isDashBlockEnd = content === '  \n\n'
                if (isDashBlockEnd && listStarted && collectingListItem) {
                  callback('</li></ul>', false, false)
                  collectingListItem = false
                  listStarted = false
                  continue
                }

                const isOrderedListEnd = content === '。\n\n'
                if (isOrderedListEnd && numListStarted) {
                  if (numCollectingItem) {
                    callback('</li></ol>', false, false)
                  } else {
                    callback('</ol>', false, false)
                  }
                  numCollectingItem = false
                  numListStarted = false
                  numPendingNumber = null
                  continue
                }

                const isListItemEnd = content === '  \n'
                if (isListItemEnd && numListStarted && numCollectingItem) {
                  callback('</li>', false, false)
                  numCollectingItem = false
                  continue
                }

                const isNumericOnly = /^\s*[0-9]+\s*$/.test(content)
                if (isNumericOnly) {
                  if (!parenOpen) {
                    numPendingNumber = content.trim()
                    continue
                  }
                  // 在括号中出现的数字，直接输出，不进入有序列表状态机
                  const processedNumeric = TextProcessor.processSearchResultContent(content)
                  callback(processedNumeric, false, false)
                  continue
                }

                // 处理括号分片
                const isParenOpen = content.trim() === '（' || content.trim() === '('
                if (isParenOpen) {
                  parenOpen = true
                  const processed = TextProcessor.processSearchResultContent(content)
                  callback(processed, false, false)
                  continue
                }
                const isParenClose = content.trim() === '）' || content.trim() === ')'
                if (isParenClose) {
                  parenOpen = false
                  const processed = TextProcessor.processSearchResultContent(content)
                  callback(processed, false, false)
                  continue
                }

                const isDotOnly = content === '.'
                if (isDotOnly && numPendingNumber) {
                  if (!numListStarted) {
                    callback('<ol><li>', false, false)
                    numListStarted = true
                    numCollectingItem = true
                  } else {
                    callback('<li>', false, false)
                    numCollectingItem = true
                  }
                  numPendingNumber = null
                  continue
                }

                const isDashOnly = /^\s*-\s*$/.test(content)
                if (isDashOnly) {
                  if (!listStarted) {
                    callback('<ul><li>', false, false)
                    listStarted = true
                    collectingListItem = true
                  } else {
                    callback('</li><li>', false, false)
                    collectingListItem = true
                  }
                  continue
                }

                let processedContent = TextProcessor.processSearchResultContent(content)
                callback(processedContent, false, false)
              }
            } else {
              // 如果不是 GPT 模型和法律接口，json.choices[0].delta.content 需要进行文字处理
              const content =
                json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : ''

              const trimmed2 = (content || '').trim()
              if (trimmed2 === '**') {
                // 跳过孤立的加粗标记分片
              } else {
                const isLineBreak2 = trimmed2 === '<br>' || content === '\n' || content === '\r\n'
                if (isLineBreak2) {
                  if (numListStarted && numCollectingItem) {
                    callback('</li>', false, false)
                    numCollectingItem = false
                  }
                  if (listStarted && collectingListItem) {
                    callback('</li>', false, false)
                    collectingListItem = false
                  }
                }
              }
              const isDashBlockEnd2 = content === '  \n\n'
              if (isDashBlockEnd2 && listStarted && collectingListItem) {
                callback('</li></ul>', false, false)
                collectingListItem = false
                listStarted = false
              } else {
                const isOrderedListEnd2 = content === '。\n\n'
                if (isOrderedListEnd2 && numListStarted) {
                  if (numCollectingItem) {
                    callback('</li></ol>', false, false)
                  } else {
                    callback('</ol>', false, false)
                  }
                  numCollectingItem = false
                  numListStarted = false
                  numPendingNumber = null
                } else {
                  const isListItemEnd2 = content === '  \n'
                  if (isListItemEnd2 && numListStarted && numCollectingItem) {
                    callback('</li>', false, false)
                    numCollectingItem = false
                  } else {
                    const isNumericOnly2 = /^\s*[0-9]+\s*$/.test(content)
                    if (isNumericOnly2) {
                      if (!parenOpen) {
                        numPendingNumber = content.trim()
                      } else {
                        const processedNumeric = content
                          ? TextProcessor.processSearchResultContent(content)
                          : ''
                        if (processedNumeric && processedNumeric.trim()) {
                          callback(processedNumeric, false, false)
                        }
                      }
                    } else if (content === '.' && numPendingNumber) {
                      if (!numListStarted) {
                        callback('<ol><li>', false, false)
                        numListStarted = true
                        numCollectingItem = true
                      } else {
                        callback('<li>', false, false)
                        numCollectingItem = true
                      }
                      numPendingNumber = null
                    } else {
                      const isParenOpen2 = content.trim() === '（' || content.trim() === '('
                      if (isParenOpen2) {
                        parenOpen = true
                        const processed = content
                          ? TextProcessor.processSearchResultContent(content)
                          : ''
                        if (processed && processed.trim()) {
                          callback(processed, false, false)
                        }
                      } else {
                        const isParenClose2 = content.trim() === '）' || content.trim() === ')'
                        if (isParenClose2) {
                          parenOpen = false
                          const processed = content
                            ? TextProcessor.processSearchResultContent(content)
                            : ''
                          if (processed && processed.trim()) {
                            callback(processed, false, false)
                          }
                        } else {
                          const isDashOnly2 = /^\s*-\s*$/.test(content)
                          if (isDashOnly2) {
                            if (!listStarted) {
                              callback('<ul><li>', false, false)
                              listStarted = true
                              collectingListItem = true
                            } else {
                              callback('</li><li>', false, false)
                              collectingListItem = true
                            }
                          } else {
                            const processedContent = content
                              ? TextProcessor.processSearchResultContent(content)
                              : ''
                            if (processedContent && processedContent.trim()) {
                              callback(processedContent, false, false)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('解析 JSON 失败:', {
              error: e,
              eventData: eventData.substring(0, 200),
              position: eventData.length,
              chunk: chunk.substring(0, 100),
            })
            // 继续处理下一个chunk，不中断整个流程
            continue
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

  // 新增：判断是否为法律相关接口
  private isLegalInterface(): boolean {
    const legalKeys = [
      'flwtzx', // 法律问题咨询
      'qwsswd', // 全网搜索问答
      'flfgzx', // 法律法规
      'flwsxz', // 法律文书写作
      'ssclsc', // 诉讼策略生成
      'flfxjy', // 法律分析意见-诉讼策略
      'flfxyj', // 法律分析意见抗辩策略
      'dsjsspgbg', // 大数据胜诉评估报告
      'xzzfzs', // acee
      'xzfcfz', // 行政处罚辅助
    ]
    return legalKeys.includes(this.aiConfig.key)
  }

  // 新增：判断是否为法律法规接口
  private isLawInterface(): boolean {
    const lawKeys = ['flfgzx'] // 法律法规
    return lawKeys.includes(this.aiConfig.key)
  }

  // 新增：判断是否为网络搜索接口
  private isWebSearchInterface(): boolean {
    const webSearchKeys = ['qwsswd'] // 全网搜索问答
    return webSearchKeys.includes(this.aiConfig.key)
  }

  /**
   * 解析SSE数据流中的JSON数据
   * @param eventData 原始事件数据
   * @returns 解析后的JSON对象或null
   */
  private parseSSEJsonData(eventData: string): any | null {
    try {
      // 清理数据
      let cleanData = eventData.trim()

      // 移除可能的前缀
      if (cleanData.startsWith('data:')) {
        cleanData = cleanData.substring(5).trim()
      }

      // 检查是否为空或特殊标记
      if (!cleanData || cleanData === '[DONE]') {
        return null
      }

      // 验证JSON格式
      if (!cleanData.startsWith('{')) {
        return null
      }

      // 查找完整的JSON对象
      let braceCount = 0
      let jsonEnd = -1

      for (let i = 0; i < cleanData.length; i++) {
        if (cleanData[i] === '{') {
          braceCount++
        } else if (cleanData[i] === '}') {
          braceCount--
          if (braceCount === 0) {
            jsonEnd = i
            break
          }
        }
      }

      if (jsonEnd === -1) {
        return null
      }

      const jsonString = cleanData.substring(0, jsonEnd + 1)
      return JSON.parse(jsonString)
    } catch (error) {
      console.warn('Failed to parse SSE JSON data:', {
        error: error,
        data: eventData.substring(0, 100),
      })
      return null
    }
  }

  // 修改：处理法律接口的答案内容 - 统一使用 processSearchResultContent
  private processLegalAnswerContent(content: string): string {
    return TextProcessor.processSearchResultContent(content)
  }

  // 修改：处理法律接口的通用内容 - 统一使用 processSearchResultContent
  private processLegalContent(content: string): string {
    return TextProcessor.processSearchResultContent(content)
  }

  // 测试方法：使用模拟数据进行测试
  async sendToAIMock(message: any, callback: any, lastMessage: any) {
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
