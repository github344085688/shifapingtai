import aiConfig,{concurrentApis} from '@/config/aiConfig'

export interface ConcurrentResult {
  key: string
  name: string
  content: string
  isLoading: boolean
  isCompleted: boolean
  error?: string
}


export interface ConcurrentCallback {
  (key: string, content: string, isCompleted: boolean, error?: string): void
}


class ConcurrentAIService {
  private apiKey: string
  private model: string
  private results: Map<string, ConcurrentResult>
  private callback?: ConcurrentCallback

  constructor(apiKey?: string) {
    this.apiKey = apiKey || aiConfig.apiKey
    this.model = aiConfig.model
    this.results = new Map()
    
    // 初始化结果对象
    Object.values(concurrentApis).forEach(apiConfig => {
      this.results.set(apiConfig.key, {
        key: apiConfig.key,
        name: apiConfig.name,
        content: '',
        isLoading: false,
        isCompleted: false
      })
    })
  }

  // 获取所有结果
  getAllResults(): ConcurrentResult[] {
    return Array.from(this.results.values())
  }

  // 并发调用所有API - 优化版本
  async sendConcurrentRequests(message: any, callback: ConcurrentCallback): Promise<void> {
    this.callback = callback
    
    // 重置所有结果状态
    Object.values(concurrentApis).forEach(apiConfig => {
      const result = this.results.get(apiConfig.key)!
      result.isLoading = true
      result.isCompleted = false
      result.content = ''
      result.error = undefined
      
      // 立即通知开始加载
      this.callback?.(apiConfig.key, '', false)
    })

    // 使用循环处理每个API请求
    const apiConfigs = Object.values(concurrentApis)
    const promises = apiConfigs.map(apiConfig => 
      this.sendSingleRequest(apiConfig, message)
    )

    // 使用Promise.allSettled确保所有请求都完成，即使某些失败
    await Promise.allSettled(promises)
  }

  // 发送单个API请求 - 优化版本
  private async sendSingleRequest(
    apiConfig: typeof concurrentApis[keyof typeof concurrentApis], 
    message: any
  ): Promise<void> {
    const result = this.results.get(apiConfig.key)!
    
    try {
      const abortController = new AbortController()
      const signal = abortController.signal

      // 设置加载状态并通知
      result.isLoading = true
      result.isCompleted = false
      this.callback?.(apiConfig.key, '', false)

      // 构建请求参数，根据配置动态添加参数
      let requestBody: any

      // 特殊处理相似案例API
      if (apiConfig.name === '相似案例') {
        requestBody = {
          question: message.content , 
        }
      } else {
        // 其他API使用原有格式
        requestBody = {
          messages: [message],
          stream: false
        }

        // 优先使用配置中的model，如果没有则使用默认的this.model
        requestBody.model = apiConfig.model || this.model

        if (apiConfig.top_k !== undefined) {
          requestBody.top_k = apiConfig.top_k
        }

        if (apiConfig.threshold !== undefined) {
          requestBody.threshold = apiConfig.threshold
        }

        if (apiConfig.version !== undefined) {
          requestBody.version = apiConfig.version
        }

        if (apiConfig.casetype !== undefined) {
          requestBody.casetype = apiConfig.casetype
        }

        if (apiConfig.step !== undefined) {
          requestBody.step = apiConfig.step
        }
      }

      const response = await fetch(apiConfig.api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          Authorization: 'Bearer ' + this.apiKey,
        },
        body: JSON.stringify(requestBody),
        signal: signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // 获取响应数据
      const responseData = await response.json()
      
      // 过滤固定字段，提取实际的数组内容
      let extractedContent = ''
      if (responseData && responseData.data) {   
        if (!apiConfig.dataField) {
            extractedContent = apiConfig.simulatedData? apiConfig.simulatedData : responseData.data
          }
         else   {
            extractedContent = responseData.data[apiConfig.dataField] 
          } 
        
        // 如果没有找到匹配的字段，使用原始数据
        if (extractedContent === '') {
          extractedContent = responseData
        }
      } else {
        extractedContent = responseData
      }
      
      result.content = extractedContent
      result.isLoading = false
      result.isCompleted = true
      
      // 通知API完成
      this.callback?.(apiConfig.key, extractedContent, true)
      
    } catch (error: any) {
      result.isLoading = false
      result.isCompleted = true
      
      if (error.name === 'AbortError') {
        result.error = '请求已中断'
      } else {
        result.error = `网络请求失败: ${error.message}`
      }
      
      // 通知API出错
      this.callback?.(apiConfig.key, '', true, result.error)
    }
  }
}

export default ConcurrentAIService