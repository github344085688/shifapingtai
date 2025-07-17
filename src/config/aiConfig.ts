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
  dataField?: string
  simulatedData?: any
} 

// 定义并发API配置 - 更新API地址
export const concurrentApis: Record<string, ApiConfig>= {
  xsyw: {
    key: 'xsyw',
    name: '相似疑问',
    api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsywzsk',
    top_k: 20,
    threshold: 0.7,
    version: 'v2',
    model: '中国法研LLM',
    dataField:'qa'
  },
  wlgd: {
    key: 'wlgd', 
    name: '网络观点',
    api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/wlgdzsk', 
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    dataField:'web'
  },
  cpgdz: {
    key: 'cpgdz',
    name: '裁判观点', 
    api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/cpgdzsk',
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.65,    
    dataField:'expertview'
  },
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsalzsk', 
    top_k: 20, 
    simulatedData: [
        {
            "applicablelaw": [
                "中华人民共和国民事诉讼法第二十三条",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释第十八条",
                "中华人民共和国民事诉讼法第一百二十七条"
            ],
            "applicablelawonly": [
                "中华人民共和国民事诉讼法",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2015）翠屏民管字第29号",
            "casetype": "民事",
            "chunk": null,
            "court": "宜宾市翠屏区人民法院",
            "database": "es",
            "highlight_list": [
                "本院认为，本案为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>，<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>为判令被告归还原告借款本金和利息。原被告未对履行地点进行明确约定。"
            ],
            "judgedate": "2015-07-24",
            "judgeyear": "2015",
            "procedure": "一审",
            "province": "四川省",
            "summyBycm": null,
            "summyByrw": null,
            "title": "原告黄裕峰诉被告四川宜宾智海摩托车制造有限责任公司民间借贷纠纷一案一审民事裁定书",
            "uniqid": "f0eeb7a0-7692-403b-8010-41d28823bb12",
            "purpose": null
        },
        {
            "applicablelaw": [
                "中华人民共和国民法通则第八十四条"
            ],
            "applicablelawonly": [
                "中华人民共和国民法通则"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2018）湘0802民初3412号",
            "casetype": null,
            "chunk": "借贷纠纷,是指公民之间、公民与非金融机构企业之间的借款行为 。 在本案,双方的债权债务关系清楚,证据确实充分,故原告的诉讼请求,理由正当,法院支持和 assistance 。",
            "court": "张家界市永定区人民法院",
            "database": "es",
            "highlight_list": [
                "本院认为,<font style='color:red;'>民间</font><font style='color:red;'>借贷</font><font style='color:red;'>纠纷</font>,是指公民之间、公民与非金融机构企业之间的借款行为",
                "在本案,原、被告双方的债权债务关系清楚,证据确实充分,故原告曲国斌的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>,理由正当,本院支持",
                "依照《中华人民共和国民法通则》第八十四条之规定,判决书如下:"
            ],
            "judgedate": "2018-11-03",
            "judgeyear": "2018",
            "procedure": "一审",
            "province": "湖南省",
            "summyBycm": "",
            "summyByrw": "",
            "title": "曲国斌与樊文青民间借贷纠纷一审民事判决书",
            "uniqid": "8b7c35af-1936-4fbe-b7bf-a9a8017ff210",
            "purpose": "借贷纠纷,是指公民之间、公民与非金融机构企业之间的借款行为 。 在本案,双方的债权债务关系清楚,证据确实充分,故原告的诉讼请求,理由正当,法院支持和 assistance 。"
        },
    ]},
       
  swyj: {
    key: 'swyj',
    name: '实务研究',
    api: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/swyjzsk',
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    dataField: 'research'
  }
}