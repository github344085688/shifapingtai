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
  xsal: {
    key: 'xsal',
    name: '相似案例',
    api: apiMap.xsalApi, 
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
            "chunk": "借贷纠纷,是指公民之间、公民与非金融机构企业之间的借款行为 。 在本案中,双方的债权债务关系清楚,证据确实充分,故原告的诉讼请求,理由正当,法院予以支持 。",
            "court": "张家界市永定区人民法院",
            "database": "es",
            "highlight_list": [
                "本院认为,<font style='color:red;'>民间</font><font style='color:red;'>借贷</font><font style='color:red;'>纠纷</font>,是指公民之间、公民与非金融机构企业之间的借款行为",
                "在本案中,原、被告双方的债权债务关系清楚,证据确实充分,故原告曲国斌的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>,理由正当,本院予以支持",
                "依照《中华人民共和国民法通则》第八十四条之规定,判决如下:"
            ],
            "judgedate": "2018-11-03",
            "judgeyear": "2018",
            "procedure": "一审",
            "province": "湖南省",
            "summyBycm": "",
            "summyByrw": "",
            "title": "曲国斌与樊文青民间借贷纠纷一审民事判决书",
            "uniqid": "8b7c35af-1936-4fbe-b7bf-a9a8017ff210",
            "purpose": "借贷纠纷,是指公民之间、公民与非金融机构企业之间的借款行为 。 在本案中,双方的债权债务关系清楚,证据确实充分,故原告的诉讼请求,理由正当,法院予以支持 。"
        },
        {
            "applicablelaw": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定第二十九条",
                "中华人民共和国合同法第二百一十条",
                "中华人民共和国民事诉讼法第二百五十三条"
            ],
            "applicablelawonly": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定",
                "中华人民共和国合同法",
                "中华人民共和国民事诉讼法"
            ],
            "casecause": "房屋买卖合同纠纷",
            "caseid": "（2017）川1922民初879号",
            "casetype": "民事",
            "chunk": "买卖合同中,当事人一方未支付价款或者报酬的,对方可以要求其支付价款或者报酬 。",
            "court": "南江县人民法院",
            "database": "es",
            "highlight_list": [
                "经法院示明后,原告冉长春同意将案由变更为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>,<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>:1、要求被告立即支付在原告处借款16万元,资金利息从2014年3月9日起至实际给付之日止按月利率1.5%计算;2、本案<font style='color:red;'>诉讼</font>费用由被告承担"
            ],
            "judgedate": "2017-09-22",
            "judgeyear": "2017",
            "procedure": "一审",
            "province": "四川省",
            "summyBycm": "2014年张映平与冉长春有两次互负债务，一笔借款5万元未清偿，另一笔9万元和5万元借款用于同一笔。张映平有2016年10月4日签订的《房屋买卖合同》和《房屋拆迁安置补偿协议》。原告欲明确16万元借款本金及利息，但因被告要求《合同》中的管辖权问题，原、被告发生诉讼。原告请求被告还款、支付投资利息和承担诉讼费用。",
            "summyByrw": "法院将房屋买卖改为民间借贷纠纷审理，确认原告冉长春出示收条的借款关系成立，支持原告主张的借款16万元。被告辩称部分拒受，不支持5万元借款的主张。法院依据《合同法》第二百一十条和《最高人民法院民间借贷规定》第二十九条(一)项，判决按月利率1.5%支付逾期利息，自2016年6月起计算。",
            "title": "原告冉长春与被告张映平房屋买卖合同纠纷一案民事判决书",
            "uniqid": "8263f837-8136-4ccf-8ca7-a841009aac67",
            "purpose": "买卖合同中,当事人一方未支付价款或者报酬的,对方可以要求其支付价款或者报酬 。"
        },
        {
            "applicablelaw": [
                "中华人民共和国合同法第一百零七条",
                "中华人民共和国合同法第二百零六条",
                "中华人民共和国合同法第二百零七条",
                "中华人民共和国民事诉讼法第六十七条",
                "中华人民共和国民事诉讼法第二百六十条"
            ],
            "applicablelawonly": [
                "中华人民共和国合同法",
                "中华人民共和国民事诉讼法"
            ],
            "casecause": "买卖合同纠纷",
            "caseid": "（2022）粤0306民初13407号",
            "casetype": "民事",
            "chunk": "借贷双方对逾期还款利息进行过约定的,法院应予支持 。",
            "court": "深圳市宝安区人民法院",
            "database": "es",
            "highlight_list": [
                "本案相关情况\n经审理查明，原告在本案审理过程中，将本案的案由明确为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>，<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>确认如下：1．判令被告向原告返还借款人民币（以下币种均同）100,000元及利息（以100,000元为基数，按月息"
            ],
            "judgedate": "2022-11-04",
            "judgeyear": "2022",
            "procedure": "一审",
            "province": "广东省",
            "summyBycm": "原告在审理中确认与被告的民间借贷纠纷，诉讼请求包括：1)被告返还100,000元借款及利息(月息2%至2020年8月19日24,920.55元、30,087.34元至2022年5月18日)；2)被告承担诉讼费用；3)否认与被告之间实际存在借贷关系。被告否认《车辆买卖协议》真实性，否认《借条》及车辆。原告承认交付车辆抵消一部路虎，双方就交车时间争议。被告确认支付购车款10万元中有部分为原告垫款。利息利率和车辆抵债关系存争议。被告称代原告垫付购车款，原告为此开具发票或报销。此案关键在于证据支持和法律适用。",
            "summyByrw": "法院认为原告与被告之间的民间借贷关系源于16万元的宝马车辆成交，但后者需支付16万元购车款中剩余的购车款。被告否认未支付，原告主张10万元借款且已提供担保，双方形成民间借贷。被告使用宝马车4年后未交还应交付的10万元购车款，构成违约。法院确认原告垫付购车款的性质，判决被告按月息2%支付逾期利息，自2019年8月7日至2022年5月18日，之后按年利率15.4%计算，原告的过高部分不予支持。最终依据《合同法》和《民事诉讼法》判决被告支付购车款及逾期利息。",
            "title": "郑永伍、姚树权买卖合同纠纷民事一审民事判决书",
            "uniqid": "8a4fe4ec-9689-437d-8cbc-afa400a6da72",
            "purpose": "借贷双方对逾期还款利息进行过约定的,法院应予支持 。"
        },
        {
            "applicablelaw": [
                "中华人民共和国民事诉讼法第二百四十七条",
                "中华人民共和国民事诉讼法第一百一十九条",
                "中华人民共和国民事诉讼法第一百七十一条",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释第三百三十二条"
            ],
            "applicablelawonly": [
                "中华人民共和国民事诉讼法",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2017）粤09民终1717号",
            "casetype": "民事",
            "chunk": null,
            "court": "广东省茂名市中级人民法院",
            "database": "es",
            "highlight_list": [
                "本院另审理查明：中山市第一人民法院审理的（2015）中一法民一初字第2271号案中，原告是陈树锋，被告是林宇行、杨帝水，案由是<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>，<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>是：1.林宇行向陈树锋归还借款利息247398元；2."
            ],
            "judgedate": "2017-10-16",
            "judgeyear": "2017",
            "procedure": "二审",
            "province": "广东省",
            "summyBycm": null,
            "summyByrw": null,
            "title": "陈树锋、郑小静民间借贷纠纷二审民事裁定书",
            "uniqid": "9aee4217-1b5a-4a8c-814f-a9c600e6a648",
            "purpose": null
        },
        {
            "applicablelaw": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定第九条",
                "中华人民共和国民法典第五百零九条",
                "中华人民共和国民法典第六百七十九条",
                "中华人民共和国民事诉讼法第六十七条",
                "中华人民共和国民事诉讼法第一百四十七条",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释第九十条",
                "中华人民共和国民事诉讼法第二百六十条"
            ],
            "applicablelawonly": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定",
                "中华人民共和国民法典",
                "中华人民共和国民事诉讼法",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2022）云2601民初7966号",
            "casetype": null,
            "chunk": "借贷纠纷是指自然人、非金融机构之间的借款合同的纠纷,性质是实践性合同,自然人之间的借款合同,自贷款人提供借款时生效 。",
            "court": "文山市人民法院",
            "database": "es",
            "highlight_list": [
                "本院认为,<font style='color:red;'>民间</font><font style='color:red;'>借贷</font><font style='color:red;'>纠纷</font>是指自然人、非金融机构之间的借款合同的<font style='color:red;'>纠纷</font>,性质是实践性合同,自然人之间的借款合同,自贷款人提供借款时生效",
                "故刘某梅主张熊某辉偿还借款5000元的<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>,本院予以支持",
                "综上所述,依照《最高人民法院关于审理<font style='color:red;'>民间</font><font style='color:red;'>借贷</font>案件适用法律若干问题的规定》第九条,《中华人民共和国民法典》第五百零九条、第六百七十九条,《中华人民共和国民事<font style='color:red;'>诉讼</font>法》第六十七条、第一百四十七条,《最高人民法院关于的解释》第九十条规定,判决如下:"
            ],
            "judgedate": "2023-01-06",
            "judgeyear": "2023",
            "procedure": "一审",
            "province": "云南省",
            "summyBycm": "",
            "summyByrw": "",
            "title": "刘某梅、熊某辉民事一审民事判决书",
            "uniqid": "50e29d61-98fd-467b-96c2-afcf017d0418",
            "purpose": "借贷纠纷是指自然人、非金融机构之间的借款合同的纠纷,性质是实践性合同,自然人之间的借款合同,自贷款人提供借款时生效 。"
        },
        {
            "applicablelaw": [
                "中华人民共和国民事诉讼法第一百五十七条",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释第二百四十七条"
            ],
            "applicablelawonly": [
                "中华人民共和国民事诉讼法",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2023）辽0124民初322号",
            "casetype": "民事",
            "chunk": null,
            "court": "法库县人民法院",
            "database": "es",
            "highlight_list": [
                "经查,本案翟禄曾于2021年8月25日作为原告起诉被告廉佳至本院,案号为(2021)辽0124民初2724号,案由为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font> 。 <font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>为:“1、被告还款39168元 。"
            ],
            "judgedate": "2023-02-27",
            "judgeyear": "2023",
            "procedure": "一审",
            "province": "辽宁省",
            "summyBycm": null,
            "summyByrw": null,
            "title": "翟禄与廉佳、李雪民间借贷纠纷一审民事裁定书",
            "uniqid": "bfb1f8c5-d5cc-42ac-99f3-afcc003bb952",
            "purpose": null
        },
        {
            "applicablelaw": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定第十九条",
                "中华人民共和国民事诉讼法第六十七条",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释第九十条"
            ],
            "applicablelawonly": [
                "最高人民法院关于审理民间借贷案件适用法律若干问题的规定",
                "中华人民共和国民事诉讼法",
                "最高人民法院关于适用中华人民共和国民事诉讼法的解释"
            ],
            "casecause": "侵权责任纠纷",
            "caseid": "（2023）渝0113民初19146号",
            "casetype": "民事",
            "chunk": "",
            "court": "重庆市巴南区人民法院",
            "database": "es",
            "highlight_list": [
                "根据原被告的诉辩称及提交的证据,本院确认本案以下事实:2021年3月22日,牛德亨公司作为原告向本院起诉王成权、秦小燕作为被告<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>,其<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>为要求王成权、秦小燕归还借款本金103668元及利息",
                "2023年3月20日,牛德亨公司再次作为原告向本院起诉王成权、秦小燕作为被告<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>,<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>与2021年4319号案件一致 。"
            ],
            "judgedate": "2023-11-20",
            "judgeyear": "2023",
            "procedure": "一审",
            "province": "重庆市",
            "summyBycm": "",
            "summyByrw": "",
            "title": "王成权,秦小燕与重庆牛德亨物流有限公司侵权责任纠纷一审民事判决书",
            "uniqid": "e946d8a9-5654-4974-a11d-b101012be871",
            "purpose": ""
        },
        {
            "applicablelaw": [
                "中华人民共和国民法通则若干问题的意见试行第一百二十一条“公民之间的借贷",
                "中华人民共和国民法通则第八十四条",
                "中华人民共和国民法通则第一百零八条",
                "中华人民共和国民事诉讼法第一百四十二条",
                "中华人民共和国民事诉讼法第一百四十四条",
                "中华人民共和国民事诉讼法第二百五十三条"
            ],
            "applicablelawonly": [
                "中华人民共和国民法通则",
                "中华人民共和国民事诉讼法"
            ],
            "casecause": "民间借贷纠纷",
            "caseid": "（2013）郴北民一初字第854号",
            "casetype": "民事",
            "chunk": "借贷双方未约定还款期限,出借人有权随时要求借款人返还借款,借款人应当根据出借人的请求及时返还 。",
            "court": "郴州市北湖区人民法院",
            "database": "es",
            "highlight_list": [
                "庭审中，原告明确其<font style='color:red;'>诉讼</font>案由为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>，<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>为：1、被告偿还借款900000元。2、被告从2012年9月按月息45000元之支付利息。\n另查明，现行中国人民银行基准年利率为6﹪。"
            ],
            "judgedate": "2014-03-20",
            "judgeyear": "2014",
            "procedure": "一审",
            "province": "湖南省",
            "summyBycm": "2011年，被告刘建秋与原告杨灶清共同投资借款90万元，其中原告直接付款。被告出具借条承诺每月45000元利润分红，但自2012年起停止支付利息。原告经催讨未果后提起诉讼，请求被告偿还借款90万元本金及调整后的利息45000元/月。此案涉及民间借贷纠纷，原告主张按6%利率偿还本金及利息。",
            "summyByrw": "本院审理为民间借贷纠纷，原告杨灶清交付900000元投资款后，被告承认借款关系，双方视为借贷而非共同出资。被告未约定还款期限，应按约定时间返还借款，法院支持原告偿还本金请求。鉴于《最高人民法院关于民间借贷若干意见》的规定，利率限定为不超过银行贷款四倍，被告已超出此范围。法院判决被告偿还本金及按月利率2%支付利息，对原告超出这一限额外的利息主张不予支持。",
            "title": "杨灶清杨灶清与被告刘建秋民间借贷纠纷一审民事判决书",
            "uniqid": "713a77e6-512a-49ed-9f55-999852464a2a",
            "purpose": "借贷双方未约定还款期限,出借人有权随时要求借款人返还借款,借款人应当根据出借人的请求及时返还 。"
        },
        {
            "applicablelaw": [
                "中华人民共和国合同法第六十条",
                "中华人民共和国民事诉讼法第六十四条",
                "中华人民共和国民事诉讼法第二百五十三条"
            ],
            "applicablelawonly": [
                "中华人民共和国合同法",
                "中华人民共和国民事诉讼法"
            ],
            "casecause": "买卖合同纠纷",
            "caseid": "（2018）云0602民初3104号",
            "casetype": "民事",
            "chunk": "买卖合同中,买受人以出卖人名义向出卖人借款,并出具借条,双方之间存在借贷关系,买受人应当偿还借款本金 。",
            "court": "昭通市昭阳区人民法院",
            "database": "es",
            "highlight_list": [
                "审理过程中,原告变更<font style='color:red;'>诉讼</font><font style='color:red;'>请求</font>:案由变更为<font style='color:red;'><font style='color:red;'>民间</font></font><font style='color:red;'><font style='color:red;'>借贷</font></font><font style='color:red;'><font style='color:red;'>纠纷</font></font>;<font style='color:red;'><font style='color:red;'>诉讼</font><font style='color:red;'>请求</font></font>变更为1、<font style='color:red;'>请求</font>被告陈鹏限期赔偿原告借款本金60万元;2、判令被告陈鹏自借款之日起承担本金月息2%的利息直到本金赔偿完毕为止;3、判令被告陈鹏变卖昭阳区南城仕家"
            ],
            "judgedate": "2019-01-23",
            "judgeyear": "2019",
            "procedure": "一审",
            "province": "云南省",
            "summyBycm": "",
            "summyByrw": "",
            "title": "孙华溪与陈鹏买卖合同纠纷一审民事判决书",
            "uniqid": "699b9d89-b15b-4df1-87ad-aa85009c882c",
            "purpose": "买卖合同中,买受人以出卖人名义向出卖人借款,并出具借条,双方之间存在借贷关系,买受人应当偿还借款本金 。"
        }
    ]
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
  }
}