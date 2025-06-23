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
    let abortController: any = null
    abortController = new AbortController()
    const signal = abortController.signal
    let paramsBody: any = {}
    if (this.aiConfig.params) {
      Object.entries(this.aiConfig.params).forEach(([key, value]) => {
        paramsBody[key] = value
      })
    }
    console.log('paramsBody', this.aiConfig)
    const response = await fetch(this.aiConfig.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        Authorization: 'Bearer ' + this.aiConfig.apiKey,
      }, 
      body: JSON.stringify({
        model: this.aiConfig.model,
        messages: [  message],
        stream: true,
      }),
      signal: signal,
    })
    await this.responseReader(response, abortController, callback)
  }

  private async responseReader(response: any, abortController: any, callback: any) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = '' 
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callback(null, true)
          break
        }

        buffer += decoder.decode(value, { stream: true })
        // 按事件分割数据（每个事件以 \n\n 结尾）
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() || '' // 保留未完整数据

        for (const chunk of chunks) {
          const eventData = chunk.replace(/^data:\s*/, '').trim()
          if (!eventData) continue
          // 检查是否为[DONE]消息
          if (eventData === '[DONE]') {
            callback(null, true) // 标记流结束
            continue
          }
          try { 
            const json = JSON.parse(eventData)
            const content =
              json.choices[0] && json.choices[0].delta ? json.choices[0].delta.content : ''
            // 实时输出内容
            callback(content, false)
          } catch (e) {
            console.error('解析 JSON 失败:', e)
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        callback('【请求已中断】', true)
      } else {
        callback('网络请求失败', true)
      }
    } finally {
      abortController = null
    }
  }
}

export default AIService
