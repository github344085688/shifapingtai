class AIService {
  private aiConfig: any

  constructor(aiConfig: any) {
    this.aiConfig = aiConfig
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
            
          
            
            // 处理思考和推理数据
            const additionalData = json.choices[0]?.additional
            if (additionalData) {
              // 排除不需要的类型：step, qacls, start_search
              if (['step', 'qacls', 'start_search'].includes(additionalData.type)) {
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
                          callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong></div><div style="background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #007acc; line-height: 1.6;">${formattedContent}</div>`, false, true)
                          hasShownThinkingHeader = true
                        } else {
                          callback(`<div style="background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; border-left: 4px solid #007acc; line-height: 1.6;">${formattedContent}</div>`, false, true)
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
                case 'get_mat':
                  // 处理材料数据
                  if (additionalData.data && additionalData.data.trim()) {
                    if (!hasShownThinkingHeader) {
                      callback(`<div style="color: #888; margin: 8px 0;"><strong>推理过程：</strong>📋 ${additionalData.data}</div>`, false, true)
                      hasShownThinkingHeader = true
                    } else {
                      callback(`<div style="color: #888; margin: 8px 0;">📋 ${additionalData.data}</div>`, false, true)
                    }
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
                case 'start_jx': 
                  // 在推理开始后添加分隔符，为推理结果做准备
                  callback('<div style="height: 70px; display: flex; align-items: center; font-weight: bold; color: #333;"><strong>推理结果：</strong></div>', false, false)
                  break
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
}

export default AIService
