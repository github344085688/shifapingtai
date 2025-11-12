/**
 * 文字处理工具类
 * 提供各种文本内容处理的公共方法
 */
export class TextProcessor {
  /**
   * 处理搜索结果内容
   * @param content 原始内容
   * @param title 标题（可选）
   * @returns 处理后的内容
   */
  static processSearchResultContent(content: string, title?: string): string {
    let processedContent = content

    return processedContent
  }

  /**
   * 处理 HTML 内容
   * @param content 原始内容
   * @returns 处理后的内容
   */
  static processHtmlContent(content: string): string {
    // 将换行符转换为 <br> 标签
    let processedContent = content

    // 新增：处理带 <br> 的 "####"（确保只保留一个空行）
    processedContent = processedContent.replace(/<br>\s*####\s*(?=<br>|$)/g, '<br>')

    // 处理 Markdown 标题格式
    // ### 三级标题
    processedContent = processedContent.replace(
      /^###\s+(.+)$/gm,
      '<h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;">$1</h3>',
    )

    // ## 二级标题
    processedContent = processedContent.replace(
      /^##\s+(.+)$/gm,
      '<h2 style="font-size: 1.4em; font-weight: bold; margin: 20px 0 10px 0; color: #333;">$1</h2>',
    )

    // # 一级标题
    processedContent = processedContent.replace(
      /^#\s+(.+)$/gm,
      '<h1 style="font-size: 1.6em; font-weight: bold; margin: 24px 0 12px 0; color: #333;">$1</h1>',
    )

    // 新增：####～###### 标题（行首）
    processedContent = processedContent.replace(
      /^####\s+(.+)$/gm,
      '<h4 style="font-size: 1.1em; font-weight: bold; margin: 14px 0 8px 0; color: #333;">$1</h4>',
    )
    processedContent = processedContent.replace(
      /^#####\s+(.+)$/gm,
      '<br><h5 style="font-size: 1.0em; font-weight: bold; margin: 12px 0 6px 0; color: #333;">$1</h5>',
    )
    processedContent = processedContent.replace(
      /^######\s+(.+)$/gm,
      '<h6 style="font-size: 0.95em; font-weight: bold; margin: 10px 0 6px 0; color: #333;">$1</h6>',
    )

    // 处理带<br>标签的markdown标题（因为前面已经将\n转换为<br>）
    processedContent = processedContent.replace(
      /<br>###\s+(.+?)(?=<br>|$)/g,
      '<br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;">$1</h3>',
    )
    processedContent = processedContent.replace(
      /<br>##\s+(.+?)(?=<br>|$)/g,
      '<br><h2 style="font-size: 1.4em; font-weight: bold; margin: 20px 0 10px 0; color: #333;">$1</h2>',
    )
    processedContent = processedContent.replace(
      /<br>#\s+(.+?)(?=<br>|$)/g,
      '<br><h1 style="font-size: 1.6em; font-weight: bold; margin: 24px 0 12px 0; color: #333;">$1</h1>',
    )

    // 新增：带 <br> 的 ####～###### 标题
    processedContent = processedContent.replace(
      /<br>####\s+(.+?)(?=<br>|$)/g,
      '<br><h4 style="font-size: 1.1em; font-weight: bold; margin: 14px 0 8px 0; color: #333;">$1</h4>',
    )
    processedContent = processedContent.replace(
      /<br>#####\s+(.+?)(?=<br>|$)/g,
      '<br><h5 style="font-size: 1.0em; font-weight: bold; margin: 12px 0 6px 0; color: #333;">$1</h5>',
    )
    processedContent = processedContent.replace(
      /<br>######\s+(.+?)(?=<br>|$)/g,
      '<br><h6 style="font-size: 0.95em; font-weight: bold; margin: 10px 0 6px 0; color: #333;">$1</h6>',
    )

    // 新增：将无空格的 #中文编号 标题转为加粗（保留原有规则）
    processedContent = processedContent.replace(/^#([^\s].+)$/gm, '<strong>$1</strong>')
    processedContent = processedContent.replace(
      /<br>#([^\s].+?)(?=<br>|$)/g,
      '<br><strong>$1</strong>',
    )

    // 去除 URL 链接（http/https）
    processedContent = processedContent.replace(/https?:\/\/[^\s<>"']+/gi, '') // 去掉 http 和 https 链接

    // 去除来源相关信息
    processedContent = processedContent
      .replace(/来源[:：]\s*/gi, '') // 去掉"来源："或"来源："
      .replace(/来源/gi, '') // 去掉单独的"来源"
      .replace(/['"]?https?:[^'"]*['"]?/gi, '') // 去掉所有包含http/https的内容
      .replace(/['"]?http:[^'"]*['"]?/gi, '') // 去掉所有包含http的内容
      .replace(/https?:xxx/gi, '') // 去掉http:xxx和https:xxx格式
      .replace(/http:xxx/gi, '') // 去掉http:xxx格式

    // 去除邮箱地址
    processedContent = processedContent.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      '',
    )

    // 去除热线电话号码
    processedContent = processedContent
      .replace(/热线[:：]\s*[\d-]+/gi, '')
      .replace(/报料热线[:：]\s*[\d-]+/gi, '')
      .replace(/电话[:：]\s*[\d-]+/gi, '')

    // 去除浏览器升级提示相关内容
    processedContent = processedContent
      .replace(/您使用的浏览器版本过低[^。]*。[^。]*升级浏览器/gi, '')
      .replace(/建议升级或更换浏览器访问[^。]*升级浏览器/gi, '')

    // 去除澎湃新闻相关的无用信息
    processedContent = processedContent
      .replace(/仅提供信息发布平台[^。]*申请澎湃号请用电脑访问/gi, '')
      .replace(/http:\/\/renzheng\.thepaper\.cn[^。]*/gi, '')
      .replace(/\+\d+收藏我要举报/gi, '')
      .replace(/#[^#]*#/gi, '')
      .replace(/查看更多/gi, '')
      .replace(/开始答题/gi, '')
      .replace(/扫码下载[^。]*客户端/gi, '')

    // 去除版权和法律声明相关信息
    processedContent = processedContent
      .replace(/关于澎湃[^。]*开放平台/gi, '')
      .replace(/IPSHANGHAISIXTHTONE/gi, '')
      .replace(/新闻报料[^。]*报料邮箱[^。]*/gi, '')
      .replace(/沪ICP备[^。]*号/gi, '')
      .replace(/沪公网安备[^。]*号/gi, '')
      .replace(/互联网新闻信息服务许可证[^。]*号/gi, '')
      .replace(/增值电信业务经营许可证[^。]*号/gi, '')
      .replace(/©\d{4}-\d{4}[^。]*有限公司/gi, '')
      .replace(/反馈/gi, '')

    // 去除其他常见的无用信息
    processedContent = processedContent
      .replace(/Android版iPhone版iPad版/gi, '')
      .replace(/微博公众号抖音号/gi, '')
      .replace(/派生万物/gi, '')

    // 去掉最后的中文逗号 "，"
    processedContent = processedContent.replace(/，\s*$/, '')

    return processedContent
  }

  /**
   * 创建带样式的消息
   * @param content 内容
   * @param style 样式
   * @returns 带样式的HTML字符串
   */
  static createStyledMessage(content: string, style: string): string {
    return `<div style="${style}">${content}</div>`
  }

  /**
   * 处理带头部的消息
   * @param content 内容
   * @param hasShownHeader 是否已显示头部
   * @param headerText 头部文本
   * @param callback 回调函数
   * @param isThinking 是否为思考过程
   * @returns 是否已显示头部
   */
  static handleMessageWithHeader(
    content: string,
    hasShownHeader: boolean,
    headerText: string,
    callback: any,
    isThinking: boolean = true,
    headerStyle: string,
  ): boolean {
    if (!hasShownHeader) {
      callback(this.createStyledMessage(`${headerText}${content}`, headerStyle), false, isThinking)
      return true
    } else {
      callback(this.createStyledMessage(content, headerStyle), false, isThinking)
      return hasShownHeader
    }
  }

  /**
   * 处理法条内容（xgft API专用）
   * @param lawData 法条数据对象
   * @returns 格式化后的法条内容
   */
  static processLawContent(lawData: {
    type: string
    content: string
    title: string
    directory: string[]
    department: string
    status: string
    law_type: string
    _score: number
  }): string {
    let processedContent = lawData.content

    // 基础文本清理
    processedContent = processedContent.replace(/正在输入\.\.\./g, '').replace(/\.打开对话/g, '')

    processedContent = this.processHtmlContent(processedContent)

    // 构建法条信息头部
    const lawHeader = `
      <div style="background: #f8f9fa; padding: 12px; margin: 8px 0; border-left: 4px solid #007bff; border-radius: 4px;">
        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${lawData.title}</div>
        <div style="font-size: 0.9em; color: #666; margin-bottom: 2px;">
          <span style="margin-right: 12px;">发布机关：${lawData.department}</span>
          <span style="margin-right: 12px;">状态：${lawData.status}</span>
          <span style="margin-right: 12px;">类型：${lawData.law_type}</span>
        </div>
        <div style="font-size: 0.85em; color: #888;">
          <span style="margin-right: 12px;">相关性评分：${(lawData._score * 100).toFixed(1)}%</span>
          <span>条文路径：${lawData.directory.join(' > ')}</span>
        </div>
      </div>
    `
    return lawHeader + processedContent
  }

  /**
   * 处理网络搜索内容（wlgd API专用）
   * @param webData 网络搜索数据对象
   * @returns 格式化后的网络内容
   */
  static processWebContent(webData: {
    url: string
    title: string
    content: string
    score: number
    type: string
    name: string
  }): string {
    let processedContent = webData.content

    // 基础文本清理
    processedContent = processedContent
      .replace(/正在输入\.\.\./g, '')
      .replace(/\.打开对话/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\\"/g, '"')

    return this.processHtmlContent(processedContent)
  }
}
