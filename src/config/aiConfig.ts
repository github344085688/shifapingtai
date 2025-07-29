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
  xgftApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfgzsk',//相关法条
  wlgdApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/wlgdzsk',//网络观点
  cpgdzApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/cpgdzsk',//裁判观点
  xsalApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/xsalzsk',//相似案例
  swyjApi: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/swyjzsk',//实务研究
  qwsswd: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/qwsswd',//全网搜索问答
  flfgzx: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfgzx',//法律法规
  flwsxz: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flwsxz',//法律文书写作
  ssclsc: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/ssclsc',//诉讼策略生成
  flfxjy: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfxjy',//法律分析建议(诉讼策略)
  flfxyj: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/flfxyj',//法律分析意见(抗辩策略)
  dsjsspgbg: 'https://sfdsj.juejinvr.cn/app-api/sfdsj/aimodel/dsjsspgbg',//大数据胜诉评估报告
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
export const concurrentApis: Record<string, ApiConfig>= {
  xsyw: {
    key: 'xsyw',
    name: '相似疑问',
    api: apiMap.xsywApi,
    top_k: 20,
    threshold: 0.7,
    version: 'v2',
    model: '中国法研LLM',
    dataField:'qa'
  },
  xgft: {
    key: 'xgft',
    name: '相关法条',
    api: apiMap.xgftApi,
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.7,
    dataField:'laws'
  },
  wlgd: {
    key: 'wlgd', 
    name: '网络观点',
    api: apiMap.wlgdApi, 
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    dataField:'web'
  },
  cpgdz: {
    key: 'cpgdz',
    name: '裁判观点', 
    api: apiMap.cpgdzApi,
    top_k: 20,
    model: '中国法研LLM',
    version: 'v2',
    threshold: 0.65,    
    dataField:'expertview'
  },
  swyj: {
    key: 'swyj',
    name: '实务研究',
    api: apiMap.swyjApi,
    top_k: 20,
    model: '中国法研LLM',
    threshold: 0.55,
    version: 'v2',    
    dataField:'t2wechat'
  },
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: apiMap.xsalApi, 
    top_k: 20, 
//     simulatedData: [
//     {
//         "applicablelaw": [
//             "中华人民共和国劳动争议调解仲裁法第二十一条",
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第八条",
//             "中华人民共和国民事诉讼法第一百七十一条",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释第三百三十二条"
//         ],
//         "applicablelawonly": [
//             "中华人民共和国劳动争议调解仲裁法",
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释",
//             "中华人民共和国民事诉讼法",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2020）豫01民终7053号",
//         "casetype": null,
//         "chunk": null,
//         "court": "河南省郑州市中级人民法院",
//         "database": "es",
//         "highlight_list": [
//             "李海燕与<font style='color:red;'>争议</font>的实体法律关系具有民事法律规范意义上的利害关系,起诉时亦有明确的被告,有具体的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>和事实、理由,属于受诉人民法院管辖,且已经过<font style='color:red;'>劳动</font>仲裁前置程序,于法律规定的起诉要件齐备",
//             "本院认为,诉是当事人向法院提出的<font style='color:red;'>请求</font>,是为抽象<font style='color:red;'>请求</font>;<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>是当事人以诉为载体向法院提出的具体的、实体上的<font style='color:red;'>请求</font>,一者为程序问题,一者为以程序为载体的实体<font style='color:red;'>请求</font>",
//             "双方当事人分别向<font style='color:red;'>劳动</font>合同履行地和用人单位所在地的<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>仲裁委员会申请仲裁的,由<font style='color:red;'>劳动</font>合同履行地的<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>仲裁委员会管辖”;《最高人民法院关于审理<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>案件适用法律若干问题的解释》第八条规定:“<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>案件由用人单位所在地或者<font style='color:red;'>劳动</font>合同履行地的基层人民法院管辖……”"
//         ],
//         "judgedate": "2020-06-18",
//         "judgeyear": "2020",
//         "procedure": "二审",
//         "province": "河南省",
//         "summyBycm": null,
//         "summyByrw": null,
//         "title": "李海燕、兆琪（上海）贸易有限公司洛阳分公司劳动争议二审民事裁定书",
//         "uniqid": "2b6e3367-bab1-4312-a28d-abeb00c08ce4",
//         "purpose": null
//     },
//     {
//         "applicablelaw": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释（四）第二条第一款",
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第十三条",
//             "中华人民共和国劳动合同法第四十六条",
//             "中华人民共和国劳动合同法第三十八条",
//             "中华人民共和国民事诉讼法第二百五十三条"
//         ],
//         "applicablelawonly": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释（四）",
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释",
//             "中华人民共和国劳动合同法",
//             "中华人民共和国民事诉讼法"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2018）津0116民初80331号",
//         "casetype": "民事",
//         "chunk": "用人单位存在《中华人民共和国劳动合同法》第三十八条的违法行为,劳动者提出解除劳动关系,应当支付经济补偿金 。",
//         "court": "天津市滨海新区人民法院",
//         "database": "es",
//         "highlight_list": [
//             "被告刘家立辩称,一、本案中的<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font><font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>均属于仲裁终局裁决事项 。 仲裁裁决已生效,单位无权提起<font style='color:red;'>诉讼</font> 。"
//         ],
//         "judgedate": "2018-04-17",
//         "judgeyear": "2018",
//         "procedure": "一审",
//         "province": "天津市",
//         "summyBycm": "被告刘家立2010年被原告中成公司录用，签订了两次无固定期限劳动合同，2016年起实行年薪工资责任制，对于收入调整细节双方争议较大。原告中成公司多次主张已支付或未支付工资，且刘家立多次请假及伤病，导致工资问题。2017年1月起，刘家立因病假、事假导致劳动关系终止。中成公司不服仲裁裁决提出诉讼，导致继续工资争议。",
//         "summyByrw": "法院确认仲裁非终局裁决，原告中成公司需支付被告刘家立2016年7月至12月工资差额24768.8元、病假工资差额44768.8元；驳回被告关于经济补偿金的请求。判决依据《劳动合同法》第三十八条、四十六条及司法解释相关规定。",
//         "title": "中成国际运输有限公司天津分公司与刘家立劳动争议一审民事判决书",
//         "uniqid": "4c158a9e-6516-4eaf-a138-a8f100a772e9",
//         "purpose": "用人单位存在《中华人民共和国劳动合同法》第三十八条的违法行为,劳动者提出解除劳动关系,应当支付经济补偿金 。"
//     },
//     {
//         "applicablelaw": [
//             "中华人民共和国民事诉讼法第一百四十五条",
//             "中华人民共和国民事诉讼法第一百五十四条"
//         ],
//         "applicablelawonly": [
//             "中华人民共和国民事诉讼法"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2017）川0821民初1840号",
//         "casetype": "民事",
//         "chunk": null,
//         "court": "旺苍县人民法院",
//         "database": "es",
//         "highlight_list": [
//             "本院认为,原告旺苍县同心煤业有限公司与被告何开云已就<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>的相关事宜庭外达成协议,原告申请撤诉,被告撤回提出的<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>的<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>,是对其<font style='color:red;'>诉讼</font>权利的自由处分,且不损害国家、集体和他人利益,本院应予准许"
//         ],
//         "judgedate": "2018-03-12",
//         "judgeyear": "2018",
//         "procedure": "一审",
//         "province": "四川省",
//         "summyBycm": null,
//         "summyByrw": null,
//         "title": "旺苍县同心煤业有限公司与何开云劳动争议一审民事裁定书",
//         "uniqid": "ece6a96c-038f-42fb-aa40-a8bc01206d61",
//         "purpose": null
//     },
//     {
//         "applicablelaw": [
//             "中华人民共和国民事诉讼法第一百七十一条",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释第三百三十二条"
//         ],
//         "applicablelawonly": [
//             "中华人民共和国民事诉讼法",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2019）鲁14民终2157号",
//         "casetype": "民事",
//         "chunk": null,
//         "court": "山东省德州市中级人民法院",
//         "database": "es",
//         "highlight_list": [
//             "原审中上诉人按照<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>案件提出了与<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>有关的<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>和事实、理由，并进行了开庭审理。开庭后，一审法院让上诉人变更<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>，再次开庭后又驳回了上诉人的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>。",
//             "梁树华、高占华、梁燕华、梁茂伟根据侵权责任法等法律规定提出的以上人身损害赔偿<font style='color:red;'>请求</font>与<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font><font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>所依据的法律关系非同一种类，不符合合并审理条件。",
//             "本院认为，本院发回重审的裁定明确了一审法院准许上诉人由<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>纠纷<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>变更为一般民事侵权纠纷<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>违反法定程序。"
//         ],
//         "judgedate": "2019-08-16",
//         "judgeyear": "2019",
//         "procedure": "二审",
//         "province": "山东省",
//         "summyBycm": null,
//         "summyByrw": null,
//         "title": "梁树华、高占华劳动争议二审民事裁定书",
//         "uniqid": "f0c58f66-a2c7-4057-a9b6-aab9017d4b12",
//         "purpose": null
//     },
//     {
//         "applicablelaw": [
//             "中华人民共和国民事诉讼法第一百一十九条",
//             "中华人民共和国民事诉讼法第一百五十四条",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释第二百零八条"
//         ],
//         "applicablelawonly": [
//             "中华人民共和国民事诉讼法",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2020）皖0402民初65号",
//         "casetype": null,
//         "chunk": null,
//         "court": "淮南市大通区人民法院",
//         "database": "es",
//         "highlight_list": [
//             "本案中,梁成富的第一项<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>并不是其与工矿配件厂之间因<font style='color:red;'>劳动</font>关系产生的权利义务纠纷,而是要求确认其为工矿配件厂连续十六年的锻工,该<font style='color:red;'>请求</font>既不属于双方当事人之间的财产关系也不属于人身关系,故不属于民事案件审理范围;梁成富的第二项<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>,<font style='color:red;'>争议</font>对方是社保部门,不是本案被告,故该<font style='color:red;'>请求</font>本院不予审理",
//             "本院经审查认为,<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>,是指<font style='color:red;'>劳动</font>关系的当事人之间因执行<font style='color:red;'>劳动</font>法律、法规和履行<font style='color:red;'>劳动</font>合同而发生的纠纷,即<font style='color:red;'>劳动</font>者与所在单位之间因<font style='color:red;'>劳动</font>关系中的权利义务而发生的纠纷",
//             "综上所述,梁成富的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>不属于民事案件审理范围,依法应予驳回"
//         ],
//         "judgedate": "2020-03-30",
//         "judgeyear": "2020",
//         "procedure": "一审",
//         "province": "安徽省",
//         "summyBycm": null,
//         "summyByrw": null,
//         "title": "梁成富与淮南市工矿配件厂劳动争议一审民事裁定书",
//         "uniqid": "741170d0-c242-4f39-9288-aba700984ddf",
//         "purpose": null
//     },
//     {
//         "applicablelaw": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释（一）第四十四条",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释第九十条"
//         ],
//         "applicablelawonly": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释（一）",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2020）津0105民初8427号",
//         "casetype": null,
//         "chunk": "用人单位与劳动者发生劳动争议,当事人可以依法申请调解、仲裁、提起诉讼,也可以协商解决 。 当事人对自己提出的诉讼请求所依据的事实或者反驳对方诉讼请求所依据的事实,应当提供证据加以证明,但法律另有规定的除外 。",
//         "court": "天津市河北区人民法院",
//         "database": "es",
//         "highlight_list": [
//             "用人单位与<font style='color:red;'>劳动</font>者发生<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>,当事人可以依法申请调解、仲裁、提起<font style='color:red;'>诉讼</font>,也可以协商解决",
//             "当事人对自己提出的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>所依据的事实或者反驳对方<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>所依据的事实,应当提供证据加以证明,但法律另有规定的除外"
//         ],
//         "judgedate": "2021-02-09",
//         "judgeyear": "2021",
//         "procedure": "一审",
//         "province": "天津市",
//         "summyBycm": "原告赵国权因与原公司存在长期劳动纠纷，曾于2019年提起诉讼，请求确认2003-2004年间的关系。法院已确认原告在2004年12月31日离职，但原被告已就该时期的劳动关系达成协议，原告获支持部分仲裁请求。判决后，赵国权上诉至中级法院，被驳回，再审请求被驳回。赵国权再审无果后再次向人民法院提起诉讼，但相关争议焦点在于劳动变更问题。",
//         "summyByrw": "法院认为，劳动者与用人单位之间的劳动争议可通过调解、仲裁或诉讼解决，但原告未能提供充分证据证明自2005年1月起与被告存在劳动关系，因此对其解除劳动关系的诉求缺乏事实支持。原告关于档案补交和经济补偿的诉讼请求基于证据不足，法院不予支持，强调举证责任。最终依据《民事诉讼法解释》第九十条，驳回原告解除劳动关系的请求，针对档案补交及经济损失的诉求不支持。",
//         "title": "赵国权与天津通信广播集团有限公司劳动争议一审民事判决书",
//         "uniqid": "f2a9be4a-be58-4401-a6bf-ace2014ab90b",
//         "purpose": "用人单位与劳动者发生劳动争议,当事人可以依法申请调解、仲裁、提起诉讼,也可以协商解决 。 当事人对自己提出的诉讼请求所依据的事实或者反驳对方诉讼请求所依据的事实,应当提供证据加以证明,但法律另有规定的除外 。"
//     },
//     {
//         "applicablelaw": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第十六条",
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第六条",
//             "最高人民法院关于民事诉讼证据的若干规定第二条"
//         ],
//         "applicablelawonly": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释",
//             "最高人民法院关于民事诉讼证据的若干规定"
//         ],
//         "casecause": "人事争议",
//         "caseid": "（2006）海南民二终字第181号",
//         "casetype": "民事",
//         "chunk": "1.我国劳动争议的法律救济,原则上实行“先裁后审”的程序,即发生劳动争议后,当事人不得直接向人民法院起诉,而应先就争议事项向劳动争议仲裁委员会申请仲裁;对仲裁裁决不服的,方可向人民法院起诉 。  \n2.人民法院受理劳动争议案件后,当事人增加诉讼请求的,如该诉讼请求与讼争的劳动争议具有不可分性,应当合并审理;如属独立的劳动争议,应当告知当事人向劳动争议仲裁委员会申请仲裁,以符合“先裁后审”的程序规定 。 ",
//         "court": "海南省第一中级人民法院",
//         "database": "al",
//         "highlight_list": [
//             "人民法院受理<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>案件后,当事人增加<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>的,如属独立的<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>,应当告知当事人向<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>仲裁委员会申请仲裁"
//         ],
//         "judgedate": "2000-01-01",
//         "judgeyear": "",
//         "procedure": "二审",
//         "province": "海南省",
//         "summyBycm": "仲裁案号:海南省儋州市劳动争议仲裁委员会裁决书儋劳仲案字〔2005〕第1号 一审案号:海南省儋州市人民法院民事判决书(2006)儋民初字第5号 二审案号:海南省海南中级人民法院民事判决书(2006)海南民二终字第181号 【案情介绍】 ",
//         "summyByrw": "劳动争议的法律救济:我国劳动争议法律救济程序――林某诉华南某某大学案 【案件信息】 原告(上诉人):林某 被告(被上诉人):华南某某大学 ",
//         "title": "林某诉华南某某大学人事争议案",
//         "uniqid": "C1347204",
//         "purpose": "1.我国劳动争议的法律救济,原则上实行“先裁后审”的程序,即发生劳动争议后,当事人不得直接向人民法院起诉,而应先就争议事项向劳动争议仲裁委员会申请仲裁;对仲裁裁决不服的,方可向人民法院起诉 。  \n2.人民法院受理劳动争议案件后,当事人增加诉讼请求的,如该诉讼请求与讼争的劳动争议具有不可分性,应当合并审理;如属独立的劳动争议,应当告知当事人向劳动争议仲裁委员会申请仲裁,以符合“先裁后审”的程序规定 。 "
//     },
//     {
//         "applicablelaw": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第六条",
//             "中华人民共和国民事诉讼法第一百七十条"
//         ],
//         "applicablelawonly": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释",
//             "中华人民共和国民事诉讼法"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2014）并民终字第47号",
//         "casetype": "民事",
//         "chunk": "劳动者在向法院提起诉讼前向仲裁委提出过仲裁申请,但仲裁与诉讼的请求事项并不一致,劳动者在原审诉讼中新提出要求用人单位赔偿因未依法缴纳社会保险造成的损失、解除双方的劳动合同并赔偿的,其在原审诉讼时并非是增加不可分的劳动争议诉讼请求,而是完全提出了新的诉讼请求,不符合上述司法解释合并审理的条件,法院不应审理并无不妥 。",
//         "court": "山西省太原市中级人民法院",
//         "database": "es",
//         "highlight_list": [
//             "上诉人在原审<font style='color:red;'>诉讼</font>时并非是增加不可分的<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font><font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>,而是完全提出了新的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>,不符合上述司法解释合并审理的条件,原审法院认定其主张是完全独立的<font style='color:red;'>劳动</font><font style='color:red;'>争议</font>,在未进行仲裁前置程序,法院不应审理并无不妥。"
//         ],
//         "judgedate": "2014-05-04",
//         "judgeyear": "2014",
//         "procedure": "二审",
//         "province": "山西省",
//         "summyBycm": "",
//         "summyByrw": "",
//         "title": "韩振英与山西迎泽宾馆劳动争议二审民事判决书",
//         "uniqid": "be75e5b0-43b7-4a57-88ea-2e7de9266ff7",
//         "purpose": "劳动者在向法院提起诉讼前向仲裁委提出过仲裁申请,但仲裁与诉讼的请求事项并不一致,劳动者在原审诉讼中新提出要求用人单位赔偿因未依法缴纳社会保险造成的损失、解除双方的劳动合同并赔偿的,其在原审诉讼时并非是增加不可分的劳动争议诉讼请求,而是完全提出了新的诉讼请求,不符合上述司法解释合并审理的条件,法院不应审理并无不妥 。"
//     },
//     {
//         "applicablelaw": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释第三条"
//         ],
//         "applicablelawonly": [
//             "最高人民法院关于审理劳动争议案件适用法律若干问题的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "",
//         "casetype": "民事",
//         "chunk": "提出仲裁要求的一方应当自劳动争议发生之日起60日内向劳动争议仲裁委员会提出书面申请;劳动者在其权益受到侵害10年之后提出仲裁申请,确已超过仲裁时效,不再享有胜诉权,劳动者的诉讼请求应予驳回 。 ",
//         "court": "",
//         "database": "al",
//         "highlight_list": [
//             "原告拿到开除档案的复印件后,于2006年2月20日向肥城市<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>仲裁委员会提出申诉,要求被告为其安置工作、缴纳养老保险、医疗保险、补发生活费,并称:自己从未收到过开除通知,一直不知道被开除,到2005",
//             "依照《<font style='color:red;'>劳动</font>法》的规定,当事人向人民法院提起<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font><font style='color:red;'>诉讼</font>必须经过<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>仲裁委员会的裁决 。 提出仲裁要求的一方应当自<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>发生之日起60日内向<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>仲裁委员会提出书面申请 。",
//             "对于原告主张的2005年12月25日看见负责人给她的开除通知时,才知道自己被开除的事实,<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font>才发生的观点不予支持 。"
//         ],
//         "judgedate": "2000-01-01",
//         "judgeyear": "",
//         "procedure": "一审",
//         "province": "",
//         "summyBycm": "被告:某水某某 原告于1994年3月调入某水某某,系集体制工人 。 之后原告断断续续没有上班,截至1996年7月25日累计旷工达135天 。 1996年8月30日,某水某某召开了厂办公会,以旷工欠勤为由,做出开除原告的决定,制做了开除通知,并派两位办公室人员通过邮寄的方式送达给原告,留存了邮寄凭证 。 自此,原告从未提出过任何异议 。 2005年某水某某改制,2005年12月25日,原告找到某水某某负责人,要求为其安排工作,返还其自己缴纳的养老保险金 。 该负责人找出当时的开除档案,复印后交给原告一份,并告知其在1996年就已经被开除 。  原告拿到开除档案的复印件后,于2006年2月20日向肥城市劳动争议仲裁委员会提出申诉,要求被告为其安置工作、缴纳养老保险、医疗保险、补发生活费,并称:自己从未收到过开除通知,一直不知道被开除,到2005年12月25日,看见负责人给她的开除通知时,才知道自己被开除的事实 。 被告称:当时已经将开除通知邮寄给了原告,邮寄凭证也存入了档案,被告当时已知道开除的事实,申诉超过仲裁时效 。 肥城市仲裁委员会以原告的申诉超过仲裁时效为由驳回原告的各项请求 。 原告不服,于2006年4月25日向肥城市人民法院提起诉讼 。 请求撤销仲裁裁决书,责令被告返还其交纳的养老保险金,补发生活费、取暖费、医疗保险金,赔偿其经济损失 。 某水某某辩称:原告要求返还养老保险金的内容已经超过法定仲裁时效,不再享有胜诉权;原告要求补发生活费、住房补贴及取暖费等费用的主张没有法律依据,请求法院在查明事实的基础上驳回原告的诉讼请求 。  法院审理后认为:在原告被开除后,其工资待遇停发,此时原告的合法权利即受到侵害,尤其是自1996年9月份起由原告自己交纳全部养老保险费用时,原告也应知道其权益受到侵害,而原告在2006年2月20日方提出仲裁申请,其请求已经超过法律规定的60日的仲裁时效 。 依照《劳动法》的规定,当事人向人民法院提起劳动争议诉讼必须经过劳动争议仲裁委员会的裁决 。 提出仲裁要求的一方应当自劳动争议发生之日起60日内向劳动争议仲裁委员会提出书面申请 。 对于原告主张的2005年12月25日看见负责人给她的开除通知时,才知道自己被开除的事实,劳动争议才发生的观点不予支持 。  法院判决:本案中原告在其权益受到侵害10年之后提出仲裁申请,确已超过仲裁时效,不再享有胜诉权,原告的诉讼请求应予驳回 。 依据《劳动法》第82条、《最高人民法院〈关于审理劳动争议案件适用法律若干问题的解释〉》第3条之规定,判决驳回原告李某对某水某某的诉讼请求 。 原、被告双方接到法院判决书后,在法定期限内均未提出上诉 。  ",
//         "summyByrw": "李某诉某水某某劳动争议纠纷案 【要点提示】 劳动法从立法上规定劳动争议申请仲裁的期限是60日,本意是为了促使劳动争议尽快得到解决,劳动者的合法权益尽快得到保护 。 新的司法解释将劳动争议发生之日做了利于劳动者一方的解释,对劳动者而言时效起算更为宽松 。 但是劳动者也不能无期限地躺在权利的床上睡觉,应当及时主张权利 。  【案情简介】 原告:李某(原某水某某职工) ",
//         "title": "李某诉某水某某劳动争议纠纷案",
//         "uniqid": "C1338207",
//         "purpose": "提出仲裁要求的一方应当自劳动争议发生之日起60日内向劳动争议仲裁委员会提出书面申请;劳动者在其权益受到侵害10年之后提出仲裁申请,确已超过仲裁时效,不再享有胜诉权,劳动者的诉讼请求应予驳回 。 "
//     },
//     {
//         "applicablelaw": [
//             "中华人民共和国民法典第五十九条",
//             "中华人民共和国民法典第六十八条",
//             "中华人民共和国民事诉讼法第一百二十二条",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释第六十四条"
//         ],
//         "applicablelawonly": [
//             "中华人民共和国民法典",
//             "中华人民共和国民事诉讼法",
//             "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
//         ],
//         "casecause": "劳动争议",
//         "caseid": "（2021）湘0302民初5606号",
//         "casetype": "民事",
//         "chunk": "劳动者与用人单位之间的纠纷,应属劳动者与用人单位之间的纠纷,故劳动者以用人单位为被告提起的劳动争议诉讼请求不符合法律规定,法院不予支持 。",
//         "court": "湘潭市雨湖区人民法院",
//         "database": "es",
//         "highlight_list": [
//             "<font style='color:red;'>劳动</font>者与用人单位之间的纠纷,应属<font style='color:red;'>劳动</font>者与用人单位之间的纠纷,故<font style='color:red;'>劳动</font>者以用人单位为被告提起的<font style='color:red;'><font style='color:red;'>劳动</font></font><font style='color:red;'><font style='color:red;'>争议</font></font><font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>不符合法律规定,法院不予支持 。"
//         ],
//         "judgedate": "2022-04-21",
//         "judgeyear": "2022",
//         "procedure": "一审",
//         "province": "湖南省",
//         "summyBycm": "",
//         "summyByrw": "",
//         "title": "何正强与湘潭市雨湖区湘锰事务中心劳动争议一审民事判决书",
//         "uniqid": "cdd60bae-6c24-45b7-9e99-aec20091ff54",
//         "purpose": "劳动者与用人单位之间的纠纷,应属劳动者与用人单位之间的纠纷,故劳动者以用人单位为被告提起的劳动争议诉讼请求不符合法律规定,法院不予支持 。"
//     }
// ]
  }
}

export const AcrossTheEntireNetwork:any ={ 
    key: 'qwsswd',
    name: '全网搜索问答',
    api: apiMap.qwsswd,  
    model: '中国法研LLM', 
    stream: true 
}

export const LawsAndRegulations:any ={ 
    key: 'flfgzx',
    name: '法律法规',
    api: apiMap.flfgzx,  
    model: '中国法研LLM', 
    stream: true 
}

export const legalDocumentWriting:any ={ 
    key: 'flwsxz',
    name: '法律文书写作',
    api: apiMap.flwsxz,  
    model: '中国法研LLM', 
    stream: true 
}

export const litigationStrategyGeneration:any ={ 
    key: 'ssclsc',
    name: '诉讼策略生成',
    api: apiMap.ssclsc, 
    model: '中国法研LLM', 
    stream: true 
}


export const litigationStrategy:any ={ 
    key: 'flfxjy',
    name: '法律分析意见诉讼策略',
    api: apiMap.flfxjy, 
    model: '中国法研LLM', 
    stream: true 
}


export const defenseStrategy:any ={ 
    key: 'flfxyj',
    name: '法律分析意见抗辩策略',
    api: apiMap.flfxyj, 
    model: '中国法研LLM', 
    stream: true 
}

export const bigDataVictoryAssessmentReport:any ={ 
    key: 'dsjsspgbg',
    name: '法律分析意见抗辩策略',
    api: apiMap.dsjsspgbg,  
    parameters:{
      "amount": "1456512345",
      "caseCause": "离婚纠纷",
      "province": "北京",
      "offset": 0,
      "limit": 10,
      "claim": "请求获得子女抚养权",
      "essentials": "原告是男 重婚或同居",
      "order": "desc"
      }
}