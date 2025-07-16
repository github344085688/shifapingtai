export default {
  api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flwtzx',
  model: '中国法研LLM', 
  apiKey: '8d0edca24a164c99bf804911fc16fd29',

  
 }
export const api = {
  baseUrl: 'https://lxx.lanxiaoxiang.net',
}
 
  const apiMap = {
  xsywApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsywzsk',//相似疑问
  wlgdApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/wlgdzsk',//网络观点
  cpgdzApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/cpgdzsk',//裁判观点
  xsalApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsalzsk',//相似案例
  swyjApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/swyjzsk'//实务研究
}

// 定义API配置接口
interface ApiConfig {
  key: string
  name: string
  api: string
  top_k?: number
  threshold?: number
  version?: string
  model?: string
  casetype?: string[]
  step?: string
} 
// 定义并发API配置
export const concurrentApis: Record<string, ApiConfig>= {
  xsyw: {
    key: 'xsyw',
    name: '相似疑问',
    api: apiMap.xsywApi,
    top_k: 5,
    threshold: 0.7,
    version: 'v2',
    model: '中国法研LLM'
  },
  wlgd: {
    key: 'wlgd', 
    name: '网络观点',
    api: apiMap.wlgdApi, 
    top_k: 5,
    model: '中国法研LLM',
    version: 'v2'
  },
  cpgdz: {
    key: 'cpgdz',
    name: '裁判观点', 
    api: apiMap.cpgdzApi,
    top_k: 5,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.65
  },
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: apiMap.xsalApi, 
    top_k: 10,
    "casetype": [
    "刑事"
    ],
  },
  swyj: {
    key: 'swyj',
    name: '实务研究',
    api: apiMap.swyjApi,
    top_k: 5,
    model: '中国法研LLM',
    threshold: 0.55,
    version: 'v2'
  }
}