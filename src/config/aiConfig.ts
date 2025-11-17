export default {
  api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flwtzx',
  model: '中国法研LLM',
  apiKey: '05432954ab614837b45230d37679763d',
}
export const CACHE_DURATION = 15 * 24 * 60 * 60 * 1000
export const SET_TIMES = `https://sfdsj.juejinvr.cn/app-api/sfdsj/reqtimes/setTimes`
export const api = {
  baseUrl: 'https://lxx.lanxiaoxiang.net',
}

const apiMap = {
  flwtzx: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flwtzx', //法律问题咨询DS(
  xsywApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsywzsk', //相似疑问
  xgftApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfgzsk', //相关法条
  wlgdApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/wlgdzsk', //网络观点
  cpgdzApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/cpgdzsk', //裁判观点
  xsalApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsalzsk', //相似案例
  swyjApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/swyjzsk', //实务研究
  qwsswd: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/qwsswd', //全网搜索问答
  flfgzx: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfgzx', //法律法规
  flwsxz: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flwsxz', //法律文书写作
  ssclsc: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/ssclsc', //诉讼策略生成
  flfxjy: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfxjy', //法律分析建议(诉讼策略)
  flfxyj: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfxyj', //法律分析意见(抗辩策略)
  dsjsspgbg: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/dsjsspgbg', //大数据胜诉评估报告
  xzzfzs: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xzzfzs', //行政执法助手
  xzfcfz: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xzfcfz', //行政处罚辅助
  xsalgnfx: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsaltj', //行政处理相似案例相似案例归纳分析
  involvedDepartments: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xzzfbmyc', //涉及部门
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
  dataField?: string
  simulatedData?: any
}
// 定义并发API配置
export const concurrentApis = {
  xsyw: {
    key: 'xsyw',
    name: '相似疑问',
    api: apiMap.xsywApi,
    top_k: 20,
    threshold: 0.7,
    version: 'v2',
    model: '中国法研LLM',
    dataField: 'qa',
  },
  xgft: {
    key: 'xgft',
    name: '相关法条',
    api: apiMap.xgftApi,
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.7,
    dataField: 'laws',
  },
  wlgd: {
    key: 'wlgd',
    name: '网络观点',
    api: apiMap.wlgdApi,
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    dataField: 'web',
  },
  cpgdz: {
    key: 'cpgdz',
    name: '裁判观点',
    api: apiMap.cpgdzApi,
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.65,
    dataField: 'expertview',
  },
  swyj: {
    key: 'swyj',
    name: '实务研究',
    api: apiMap.swyjApi,
    top_k: 20,
    model: '中国法研LLM',
    threshold: 0.55,
    version: 'v2',
    dataField: 't2wechat',
  },
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: apiMap.xsalApi,
    top_k: 20,
  },
  xsalgnfx: {
    key: 'xsalgnfx',
    name: '行政处理相似案例',
    api: apiMap.xsalgnfx,
    top_k: 20,
  },
  involvedDepartments: {
    key: 'involvedDepartments',
    name: '涉及部门',
    api: apiMap.involvedDepartments,
    top_k: 20,
    dataField: 'departments',
  },
}
//法律问题咨询
export const ConsultationOnLegalIssues: any = {
  key: 'flwtzx',
  name: '法研智答',
  api: apiMap.flwtzx,
  model: '中国法研LLM',
  stream: true,
  title: '我是法研智答。',
  placeholder: '请输入案情内容',
  note: '根据案情、法律问题提供网络观点、相似案例、相关法条、法相似问题、法律知识、裁判观点',
}

export const AcrossTheEntireNetwork: any = {
  key: 'qwsswd',
  name: '全网搜索问答',
  api: apiMap.qwsswd,
  model: '中国法研LLM',
  stream: true,
  title: '我是关于法律全网搜索助手。',
  placeholder: '请输入搜索内容',
  note: '快速、准确的查找全网络法律法规信息！',
}

export const LawsAndRegulations: any = {
  key: 'flfgzx',
  name: '法律法规',
  api: apiMap.flfgzx,
  model: '中国法研LLM',
  stream: true,
  title: '我是法律法规助手。',
  placeholder: '请输入查询内容',
  note: '根据案情、法律问题描述查找相关法规、法条',
}

export const legalDocumentWriting: any = {
  key: 'flwsxz',
  name: '法律文书写作',
  api: apiMap.flwsxz,
  model: '中国法研LLM',
  stream: true,
  title: '我是法律文书写作助手。',
  placeholder: '请输入内容',
  note: '提供法律文书写作服务，包括起诉状、调解协议书、法律分析意见书等。',
}

export const litigationStrategyGeneration: any = {
  key: 'ssclsc',
  name: '诉讼策略生成',
  api: apiMap.ssclsc,
  model: '中国法研LLM',
  stream: true,
  title: '我是诉讼策略生成助手。',
  placeholder: '请输入内容',
  note: '根据详细案情提供诉请、胜算分析证据建议等信息',
}

export const litigationStrategy: any = {
  key: 'flfxjy',
  name: '法律分析意见-诉讼策略',
  api: apiMap.flfxjy,
  model: '中国法研LLM',
  stream: true,
  title: '我是法律分析意见助手。',
  placeholder: '请输入内容',
  note: '诉讼策略',
}

export const defenseStrategy: any = {
  key: 'flfxyj',
  name: '法律分析意见抗辩策略',
  api: apiMap.flfxyj,
  model: '中国法研LLM',
  stream: true,
  title: '我是法律分析意见助手。',
  placeholder: '请输入内容',
  note: '抗辩策略',
}

export const bigDataVictoryAssessmentReport: any = {
  key: 'dsjsspgbg',
  name: '法律分析意见抗辩策略',
  api: apiMap.dsjsspgbg,
  parameters: {
    amount: '1456512345',
    caseCause: '离婚纠纷',
    province: '北京',
    offset: 0,
    limit: 10,
    claim: '请求获得子女抚养权',
    essentials: '原告是男 重婚或同居',
    order: 'desc',
  },
}

export const administrativeLawEnforcementAssistant: any = {
  key: 'xzzfzs',
  name: '行政执法助手',
  api: apiMap.xzzfzs,
  model: '中国法研LLM',
  stream: true,
  title: '我是行政执法助手助手。',
  placeholder: '请输入内容',
  note: '为执法部门提供行政执法辅助建议',
}

export const administrativePenaltyAssistance: any = {
  key: 'xzfcfz',
  name: '行政处罚辅助',
  api: apiMap.xzfcfz,
  model: '中国法研LLM',
  stream: true,
  title: '我是行政处罚辅助助手。',
  placeholder: '请输入内容',
  note: '为执法部门提供行政执法辅助建议',
}

// const concurrentLabels = ref([
//   { key: 'involvedDepartments', label: '相关事件涉及部门' },
//   { key: 'xgft', label: '相关问题涉及到的法律法规' },
//   { key: 'xsalgnfx', label: '相似案例' },
// ])
