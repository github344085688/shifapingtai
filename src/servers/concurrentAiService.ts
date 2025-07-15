import aiConfig from '@/config/aiConfig'

export interface ConcurrentResult {
  key: string
  name: string
  content: string
  isLoading: boolean
  isCompleted: boolean
  error?: string
}

export interface ConcurrentCallback {
  (allResults: ConcurrentResult[]): void
}

// 定义并发API配置
const concurrentApis = {
  xsyw: {
    key: 'xsyw',
    name: '相似疑问',
    api: aiConfig.xsywApi,
    "top_k":5,
    "threshold":0.7,
    "version":"v2",
    "model":"中国法研LLM",
 
  },
  wlgd: {
    key: 'wlgd', 
    name: '网络观点',
    api: aiConfig.wlgdApi, 
    "top_k":5,
    "model":"中国法研LLM",
    "version":"v2",
      content: 'content'
  },
  cpgdz: {
    key: 'cpgdz',
    name: '裁判观点', 
    api: aiConfig.cpgdzApi,
    "top_k":5,
    "model":"中国法研LLM",
    "version":"v2",
    "threshold":0.65,
        content: 'content'
    
  },
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: aiConfig.xsalApi,
    "top_k": 10,
  },
  swyj: {
    key: 'swyj',
    name: '实务研究',
    api: aiConfig.swyjApi,
    "top_k": 5,
    "model": "中国法研LLM",
    "threshold": 0.55,
    "version": "v2",
    content: 'content'
  }
}

class ConcurrentAIService {
  private apiKey: string
  private model: string
  private results: Map<string, ConcurrentResult>

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

  // 获取单个结果
  getResult(key: string): ConcurrentResult | undefined {
    return this.results.get(key)
  }

  // 并发调用所有API
  async sendConcurrentRequests(message: any, callback: ConcurrentCallback): Promise<void> {
    // 重置所有结果状态
    Object.values(concurrentApis).forEach(apiConfig => {
      const result = this.results.get(apiConfig.key)!
      result.isLoading = true
      result.isCompleted = false
      result.content = ''
      result.error = undefined
    })

    const promises = Object.values(concurrentApis).map(apiConfig => 
      this.sendSingleRequest(apiConfig, message)
    )

    // 使用Promise.allSettled确保所有请求都完成，即使某些失败
    await Promise.allSettled(promises)
    
    // 所有API完成后，调用回调函数一次
    callback(this.getAllResults())
  }

  // 发送单个API请求
  private async sendSingleRequest(
    apiConfig: typeof concurrentApis[keyof typeof concurrentApis], 
    message: any
  ): Promise<void> {
    let abortController: AbortController | null = null
    
    try {
      abortController = new AbortController()
      const signal = abortController.signal

      // 设置加载状态
      const result = this.results.get(apiConfig.key)!
      result.isLoading = true
      result.isCompleted = false

      // 构建请求参数，根据配置动态添加参数
      const requestBody: any = {
        messages: [message],
        stream: false, // 改为非流式响应
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

      // 获取响应数据，但不将其放入message中
      const responseData = await response.json()
     console.log
      
      // 只更新本地结果状态，不修改原始message

      // 过滤固定字段，提取实际的数组内容
      let extractedContent = ''
      if (responseData && responseData.data) {
        const filterKeys = ['t2wechat', 'expertview', 'qa', 'web']
        
        // 查找第一个匹配的字段并提取其数组内容
        for (const key of filterKeys) {
          if (responseData.data[key] !== undefined) {
            extractedContent = responseData.data[key]
            break
          }
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
      
    } catch (error: any) {
      const result = this.results.get(apiConfig.key)!
      result.isLoading = false
      result.isCompleted = true
      
      if (error.name === 'AbortError') {
        result.error = '请求已中断'
      } else {
        result.error = `网络请求失败: ${error.message}`
      }
    } finally {
      abortController = null
    }
  }
}

export default ConcurrentAIService