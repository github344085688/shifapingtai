import aiConfig,{concurrentApis} from '@/config/aiConfig'

export interface ConcurrentResult {
  key: string
  name: string
  content: string
  isLoading: boolean
  isCompleted: boolean
  aiLoading: boolean // 新增：每个API独立的aiLoading状态
  error?: string
}

// 修改回调接口，支持单个API的回调
export interface ConcurrentCallback {
  (key: string, content: string, isCompleted: boolean, error?: string): void
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
        isCompleted: false,
        aiLoading: false // 初始化aiLoading状态
      })
    })
  }

  // 获取所有结果
  getAllResults(): ConcurrentResult[] {
    return Array.from(this.results.values())
  }

  // 并发调用所有API - 改为循环处理
  async sendConcurrentRequests(message: any, callback: ConcurrentCallback): Promise<void> {
    // 重置所有结果状态
    Object.values(concurrentApis).forEach(apiConfig => {
      const result = this.results.get(apiConfig.key)!
      result.isLoading = true
      result.isCompleted = false
      result.aiLoading = true // 设置aiLoading为true
      result.content = ''
      result.error = undefined
    })

    // 循环处理每个API，每个API独立处理
    Object.values(concurrentApis).forEach(apiConfig => {
      this.sendSingleRequest(apiConfig, message, callback)
    })
  }

  // 发送单个API请求 - 添加callback参数
  private async sendSingleRequest(
    apiConfig: typeof concurrentApis[keyof typeof concurrentApis], 
    message: any,
    callback: ConcurrentCallback
  ): Promise<void> {
    try {
      const abortController = new AbortController()
      const signal = abortController.signal

      // 设置加载状态
      const result = this.results.get(apiConfig.key)!
      result.isLoading = true
      result.isCompleted = false
      result.aiLoading = true // API开始时设置aiLoading为true

      // 立即回调通知API开始
      callback(apiConfig.key, '', false)

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
          // 没有指定dataField，直接使用responseData.data
          extractedContent = responseData.data
        } else {
          // 有指定dataField，使用responseData.data[apiConfig.dataField]
          extractedContent = responseData.data[apiConfig.dataField] 
        } 
        
        // 如果提取的内容为空或无效，且有simulatedData，则使用simulatedData作为备用
        if ((!extractedContent || extractedContent === '') && apiConfig.simulatedData) {
          extractedContent = apiConfig.simulatedData
        }
        
        // 如果还是没有内容，使用原始响应数据
        if (!extractedContent || extractedContent === '') {
          extractedContent = responseData
        }
      } else {
        // 如果没有responseData.data，优先使用simulatedData，否则使用原始响应
        extractedContent = apiConfig.simulatedData || responseData
      }
      
      result.content = extractedContent
      result.isLoading = false
      result.isCompleted = true
      result.aiLoading = false // API完成时设置aiLoading为false
      
      // 回调通知API完成
      callback(apiConfig.key, extractedContent, true)
      
    } catch (error: any) {
      const result = this.results.get(apiConfig.key)!
      result.isLoading = false
      result.isCompleted = true
      result.aiLoading = false // 出错时也设置aiLoading为false
      
      if (error.name === 'AbortError') {
        result.error = '请求已中断'
      } else {
        result.error = `网络请求失败: ${error.message}`
      }

      // 回调通知API出错
      callback(apiConfig.key, '', true, result.error)
    }
  }
}

export default ConcurrentAIService

// 大数据胜诉评估报告单独接口
export interface BigDataAssessmentParams {
  amount: string
  caseCause: string
  province: string
  offset: number
  limit: number
  claim: string
  essentials: string
  order: string
}

export interface BigDataAssessmentResult {
  content: string
  isLoading: boolean
  isCompleted: boolean
  error?: string
}

export interface BigDataAssessmentCallback {
  (content: string | any, isCompleted: boolean, error?: string): void
}

class BigDataAssessmentService {
  private apiKey: string
  private api: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || aiConfig.apiKey
    this.api = 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/dsjsspgbg'
  }

  // 发送大数据胜诉评估报告请求
  async sendAssessmentRequest(
    parameters: BigDataAssessmentParams,
    callback: BigDataAssessmentCallback
  ): Promise<void> {
    try {
      const abortController = new AbortController()
      const signal = abortController.signal

      // 立即回调通知开始
      callback('', false)

      const requestBody = {
        ...parameters
      }

      const response = await fetch(this.api, {
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
      
      let extractedContent = ''
      if (responseData && responseData.data) {
        extractedContent = responseData.data
      } else {
        extractedContent = responseData
      }
      
      // 回调通知完成
      callback(extractedContent, true)
      
    } catch (error: any) {
      let errorMessage = ''
      if (error.name === 'AbortError') {
        errorMessage = '请求已中断'
      } else {
        errorMessage = `网络请求失败: ${error.message}`
      }

      // 回调通知出错
      callback('', true, errorMessage)
    }
  }
}

export { BigDataAssessmentService }