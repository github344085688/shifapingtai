// 样式常量
const STYLES = {
  THINKING_CONTENT:
    'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6; color: #676666;',
}

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

    // 清理不需要的文字
    processedContent = processedContent
      .replace(/正在输入\.\.\./g, '')
      .replace(/\.打开对话/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\\"/g, '"')

    // 新增：处理 "---\n\n" 转为断行
    processedContent = processedContent.replace(/---\n\n/g, '<br>')

    // 添加离婚后子女抚养费问题的特殊处理
    processedContent = processedContent.replace(/(离婚后子女抚养费问题)([1-9]\d*、)/g, '$1<br>$2')

    // 添加对 ### 标题格式的处理（在编号处理之前）
    processedContent = processedContent.replace(
      /(^|[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z])###(\s*)/g,
      (match, beforeChar, space, offset, string) => {
        // 如果前面有内容，则添加换行
        if (beforeChar && beforeChar !== '^') {
          return `${beforeChar}<br>###${space}`
        }
        return `<br>###${space}`
      },
    )

    // 添加对单独的 ### 的处理（没有后续内容的情况）
    processedContent = processedContent.replace(
      /(^|[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z])###$/g,
      (match, beforeChar) => {
        // 如果前面有内容，则添加换行
        if (beforeChar && beforeChar !== '^') {
          return `${beforeChar}<br>###`
        }
        return `<br>###`
      },
    )

    // 处理行首的单独 ###
    processedContent = processedContent.replace(/^###$/gm, '<br>###')

    // 处理编号格式的断行
    // 一、二、三等（前面带标点符号）
    processedContent = processedContent.replace(
      /([*]?)([一二三四五六七八九十]+)、/g,
      (match, asterisk, number) => {
        return `<br>${asterisk}${number}、`
      },
    )

    // 第一步、第二步、第三步等
    processedContent = processedContent.replace(
      /([*]?)第([一二三四五六七八九十]+|[0-9]+)步，/g,
      (match, asterisk, number) => {
        return `<br>${asterisk}第${number}步，`
      },
    )

    // 处理 \n（一）、\n（二）、\n（三）等格式
    processedContent = processedContent.replace(
      /\\n（([一二三四五六七八九十]+)）/g,
      (match, number) => {
        return `<br>（${number}）`
      },
    )

    // 1. 2. 3. 等（排除时间格式）- 修改为同时处理有空格和无空格的情况
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)\.(\s|(?=[\u4e00-\u9fff]))/g,
      (match, asterisk, number, spaceOrChinese, offset, string) => {
        // 检查前后文是否为时间格式（如 12:30 或 2023.01.01）
        const beforeChar = string[offset - 1]
        const afterChars = string.substring(offset + match.length, offset + match.length + 3)

        // 如果前面是数字或冒号，或后面是数字和冒号，可能是时间格式，不处理
        if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
          return match
        }

        // 检查前面是否有中文字符或其他内容，如果有则添加换行
        const beforeContext = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeContext,
          )
        ) {
          return `<br>${asterisk}${number}.${spaceOrChinese}`
        }

        return `<br>${asterisk}${number}.${spaceOrChinese}`
      },
    )

    // 添加对 1.， 2.， 3.， 等数字+点+标点符号格式的处理
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)\.([，。；：])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        // 检查前后文是否为时间格式
        const beforeChar = string[offset - 1]

        // 如果前面是数字或冒号，可能是时间格式，不处理
        if (/[0-9:]/.test(beforeChar)) {
          return match
        }

        // 检查前面是否有中文字符或其他内容，如果有则添加换行
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}${number}.${punctuation}`
        }

        return match
      },
    )

    // （一）（二）（三）等
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）/g,
      (match, asterisk, number) => {
        return `<br>${asterisk}（${number}）`
      },
    )

    // 处理带标点符号的中文编号：（一）、（二），（三）；等
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）([，。；：、])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        // 检查前面是否有中文字符或标点符号，如果有则添加换行
        const beforeChar = string[offset - 1]

        // 如果前面是中文字符、标点符号或字母，则添加换行
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}（${number}）${punctuation}`
        }

        return match
      },
    )

    // 处理冒号后的中文编号：（一）：（二）：等
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）[:：]/g,
      (match, asterisk, number, offset, string) => {
        // 检查前面是否有中文字符或标点符号，如果有则添加换行
        const beforeChar = string[offset - 1]

        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}（${number}）：`
        }

        return match
      },
    )

    // 添加对 (1) (2) (3) 等阿拉伯数字括号格式的处理
    processedContent = processedContent.replace(
      /([*]?)(\([0-9]+\))/g,
      (match, asterisk, number, offset, string) => {
        // 检查前面是否有中文字符或标点符号，如果有则添加换行
        const beforeChar = string[offset - 1]

        // 如果前面是中文字符、标点符号或字母，则添加换行
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}${number}`
        }

        return match
      },
    )

    // 新增：专门处理标点符号+（数字）格式的断行，如：。（1）、，（2）、；（3）等
    // 同时支持全角数字（１２３）和半角数字（123）
    processedContent = processedContent.replace(
      /([。，、；：！？""''）】》])(\([1-9１-９][0-9０-９]*\))/g,
      (match, punctuation, numberPart) => {
        // 在标点符号后的括号数字前添加换行
        return `${punctuation}<br>${numberPart}`
      },
    )

    // 新增：处理全角数字的括号格式，如（１）（２）（３）等
    processedContent = processedContent.replace(
      /([。，、；：！？""''）】》])(\([１-９][０-９]*\))/g,
      (match, punctuation, numberPart) => {
        // 在标点符号后的全角数字括号前添加换行
        return `${punctuation}<br>${numberPart}`
      },
    )

    // 添加对 (1), (2). (3)， 等括号+标点符号格式的处理
    processedContent = processedContent.replace(
      /([*]?)(\([0-9]+\))([，。；：,.])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        // 检查前面是否有中文字符或标点符号，如果有则添加换行
        const beforeChar = string[offset - 1]

        // 如果前面是中文字符、标点符号或字母，则添加换行
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}${number}${punctuation}`
        }

        return match
      },
    )

    // 修复数字编号处理：1，2，3，等（排除时间）
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)，/g,
      (match, asterisk, number, offset, string) => {
        // 检查前后文是否为时间格式
        const beforeChar = string[offset - 1]
        const afterChars = string.substring(offset + match.length, offset + match.length + 3)

        // 如果前面是数字或冒号，或后面是数字和冒号，可能是时间格式，不处理
        if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
          return match
        }

        return `<br>${asterisk}${number}，`
      },
    )

    // 修复数字顿号处理：1、2、3、等 - 重新编写逻辑确保正确断行
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)、/g,
      (match, asterisk, number, offset, string) => {
        // 直接在所有数字顿号前添加换行，不做复杂判断
        return `<br>${asterisk}${number}、`
      },
    )

    // 新增：处理圆圈数字编号 ①②③④⑤⑥⑦⑧⑨⑩
    processedContent = processedContent.replace(
      /([*]?)([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])/g,
      (match, asterisk, circleNumber, offset, string) => {
        // 检查前面是否有中文字符或其他内容，如果有则添加换行
        const beforeChar = string[offset - 1]

        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>${asterisk}${circleNumber}`
        }

        return `<br>${asterisk}${circleNumber}`
      },
    )

    // 第一、第二等
    processedContent = processedContent.replace(
      /([*]?)第([一二三四五六七八九十]+)/g,
      (match, asterisk, number) => {
        return `<br>${asterisk}第${number}`
      },
    )

    // 处理 HTML 内容
    processedContent = this.processHtmlContent(processedContent)

    // 如果有 title，添加灰黑色样式并另起一行
    if (title && title.trim()) {
      const titleHtml = `<div style="  font-weight: bold; margin-bottom: 8px; line-height: 1.4;">${title}</div>`
      processedContent = titleHtml + processedContent
    }

    return processedContent
  }

  /**
   * 处理 HTML 内容
   * @param content 原始内容
   * @returns 处理后的内容
   */
  static processHtmlContent(content: string): string {
    // 将换行符转换为 <br> 标签
    let processedContent = content.replace(/\n/g, '<br>')

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

    // 处理带<br>标签的markdown标题（因为前面已经将\n转换为<br>）
    processedContent = processedContent.replace(
      /<br>###\s+(.+?)(?=<br>|$)/g,
      '<br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;">$1</h3>',
    )

    // 处理单独的 ### （没有后续内容的情况）
    processedContent = processedContent.replace(
      /<br>###$/g,
      '<br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>',
    )

    // 处理中间位置的单独 ###
    processedContent = processedContent.replace(
      /<br>###(?=<br>)/g,
      '<br><h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>',
    )

    // 处理行首的单独 ###
    processedContent = processedContent.replace(
      /^###$/gm,
      '<h3 style="font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;"></h3>',
    )
    processedContent = processedContent.replace(
      /<br>##\s+(.+?)(?=<br>|$)/g,
      '<br><h2 style="font-size: 1.4em; font-weight: bold; margin: 20px 0 10px 0; color: #333;">$1</h2>',
    )
    processedContent = processedContent.replace(
      /<br>#\s+(.+?)(?=<br>|$)/g,
      '<br><h1 style="font-size: 1.6em; font-weight: bold; margin: 24px 0 12px 0; color: #333;">$1</h1>',
    )

    // 清理不需要的标签
    processedContent = processedContent
      .replace(/<img[^>]*>/gi, '') // 去掉 img 标签
      .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1') // 去掉 a 标签但保留文本内容
      .replace(/<url[^>]*>(.*?)<\/url>/gi, '$1') // 去掉 url 相关的标签
      .replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|br|div|span)\b)[^>]*>/gi, '') // 移除不允许的标签但保留内容

    // 去除 URL 链接（http/https）
    processedContent = processedContent.replace(/https?:\/\/[^\s<>"']+/gi, '') // 去掉 http 和 https 链接

    // 去除来源相关信息
    processedContent = processedContent
      .replace(/来源[:：]\s*/gi, '') // 去掉"来源："或"来源："
      .replace(/来源/gi, '') // 去掉单独的"来源"
      .replace(/['"]?https?:[^'"]*['"]?/gi, '') // 去掉所有包含http/https的内容，不管有没有引号
      .replace(/['"]?http:[^'"]*['"]?/gi, '') // 去掉所有包含http的内容，不管有没有引号
      .replace(/https?:xxx/gi, '') // 去掉http:xxx和https:xxx格式
      .replace(/http:xxx/gi, '') // 去掉http:xxx格式

    // 防止法律文件标题中的编号在《》内断行
    // 处理《...（一）》、《...（二）》等格式，确保（编号）不会断行
    processedContent = processedContent.replace(
      /《([^》]*?)(<br>|<br\s*\/?>)(\([一二三四五六七八九十]+\))/gi,
      '《$1$3',
    )

    // 处理《...（数字）》格式
    processedContent = processedContent.replace(/《([^》]*?)(<br>|<br\s*\/?>)(\(\d+\))/gi, '《$1$3')

    // 处理更复杂的《》内断行情况，确保整个《》内容不被断行分割
    processedContent = processedContent.replace(
      /《([^》]*?)(<br>|<br\s*\/?>)([^》]*?\([一二三四五六七八九十]+\)[^》]*?)》/gi,
      '《$1$3》',
    )

    // 处理《》内任何位置的断行，确保《》内容完整
    processedContent = processedContent.replace(
      /《([^》]*?)(<br>|<br\s*\/?>)([^》]*?)》/gi,
      '《$1$3》',
    )

    // 去除邮箱地址
    processedContent = processedContent.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
      '',
    ) // 去掉邮箱地址

    // 去除热线电话号码
    processedContent = processedContent
      .replace(/热线[:：]\s*[\d-]+/gi, '') // 去掉热线电话
      .replace(/报料热线[:：]\s*[\d-]+/gi, '') // 去掉报料热线
      .replace(/电话[:：]\s*[\d-]+/gi, '') // 去掉电话号码

    // 去除浏览器升级提示相关内容
    processedContent = processedContent
      .replace(/您使用的浏览器版本过低[^。]*。[^。]*升级浏览器/gi, '') // 去掉浏览器升级提示
      .replace(/建议升级或更换浏览器访问[^。]*升级浏览器/gi, '') // 去掉浏览器升级建议

    // 去除澎湃新闻相关的无用信息
    processedContent = processedContent
      .replace(/仅提供信息发布平台[^。]*申请澎湃号请用电脑访问/gi, '') // 去掉澎湃号申请提示
      .replace(/http:\/\/renzheng\.thepaper\.cn[^。]*/gi, '') // 去掉澎湃认证链接
      .replace(/\+\d+收藏我要举报/gi, '') // 去掉收藏举报按钮
      .replace(/#[^#]*#/gi, '') // 去掉话题标签
      .replace(/查看更多/gi, '') // 去掉查看更多
      .replace(/开始答题/gi, '') // 去掉开始答题
      .replace(/扫码下载[^。]*客户端/gi, '') // 去掉扫码下载提示

    // 去除版权和法律声明相关信息
    processedContent = processedContent
      .replace(/关于澎湃[^。]*开放平台/gi, '') // 去掉关于澎湃相关信息
      .replace(/IPSHANGHAISIXTHTONE/gi, '') // 去掉特殊标识
      .replace(/新闻报料[^。]*报料邮箱[^。]*/gi, '') // 去掉新闻报料信息
      .replace(/沪ICP备[^。]*号/gi, '') // 去掉ICP备案号
      .replace(/沪公网安备[^。]*号/gi, '') // 去掉公网安备号
      .replace(/互联网新闻信息服务许可证[^。]*号/gi, '') // 去掉服务许可证
      .replace(/增值电信业务经营许可证[^。]*号/gi, '') // 去掉经营许可证
      .replace(/©\d{4}-\d{4}[^。]*有限公司/gi, '') // 去掉版权信息
      .replace(/反馈/gi, '') // 去掉反馈按钮

    // 去除其他常见的无用信息
    processedContent = processedContent
      .replace(/Android版iPhone版iPad版/gi, '') // 去掉版本信息
      .replace(/微博公众号抖音号/gi, '') // 去掉社交媒体信息
      .replace(/派生万物/gi, '') // 去掉派生万物

    // 清理多余的空白字符和标点符号
    processedContent = processedContent
      .replace(/\s+/g, ' ') // 合并多个空格为一个
      .replace(/(<br>\s*){2,}/gi, '<br>') // 合并多个连续的换行
      .replace(/[:：]\s*$/gi, '') // 去掉行末的冒号
      .replace(/^\s*[:：]/gi, '') // 去掉行首的冒号
      .trim() // 去掉首尾空白

    // 新增：处理连续的 <br><br> 中间没有内容的情况，去掉一个
    processedContent = processedContent.replace(/<br>\s*<br>/gi, '<br>')

    // 基础文本清理
    processedContent = processedContent
      .replace(/\\n/g, '\n') // 处理转义的换行符
      .trim() // 去掉首尾空白

    // 处理markdown标题
    // ### 标题 -> h3
    processedContent = processedContent.replace(
      /###\s*\*\*([^*]+)\*\*/g,
      '<h3 style="color: #2c5aa0; font-weight: bold; margin: 16px 0 8px 0;">$1</h3>',
    )

    // ## 标题 -> h2
    processedContent = processedContent.replace(
      /##\s*\*\*([^*]+)\*\*/g,
      '<h2 style="color: #1a4480; font-weight: bold; margin: 20px 0 12px 0;">$1</h2>',
    )

    // 处理普通的粗体文本
    processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // 处理换行符
    processedContent = processedContent.replace(/\n+/g, '<br>')

    // 清理多余的换行
    processedContent = processedContent.replace(/(<br>\s*){3,}/gi, '<br><br>')

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
    processedContent = processedContent
      .replace(/正在输入\.\.\./g, '')
      .replace(/\.打开对话/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\\"/g, '"')

    // 处理法条编号格式
    // 第一条、第二条等
    processedContent = processedContent.replace(
      /第([一二三四五六七八九十百千万]+|[0-9]+)条/g,
      '<br><strong>第$1条</strong>',
    )

    // 处理条款内的小项编号（包括带星号的特殊格式）
    // （一）、（二）、（三）等
    processedContent = processedContent.replace(/（([一二三四五六七八九十]+)）/g, '<br>　　（$1）')

    // 处理带星号的特殊编号：（*）
    processedContent = processedContent.replace(/（\*）/g, '<br>　　（*）')

    // 处理数字编号的小项：1、2、3、等
    processedContent = processedContent.replace(/([0-9]+)、/g, '<br>　　$1、')

    // 处理带星号的数字编号：*1、*2、*3、等
    processedContent = processedContent.replace(/\*([0-9]+)、/g, '<br>　　*$1、')

    // 处理其他可能的星号编号格式
    // 处理独立的星号编号：* 内容
    processedContent = processedContent.replace(/^\*\s+/gm, '<br>　　* ')

    // 处理HTML内容
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

    // 处理 "---\n\n" 转为断行
    processedContent = processedContent.replace(/---\n\n/g, '<br>')

    // 去除重复内容 - 检测并移除重复的段落
    const paragraphs = processedContent.split(/\n+/)
    const uniqueParagraphs: string[] = []
    const seenContent = new Set<string>()

    for (const paragraph of paragraphs) {
      const cleanParagraph = paragraph.trim()
      if (cleanParagraph.length > 10) {
        // 只处理有意义的段落
        const normalizedContent = cleanParagraph.replace(/\s+/g, ' ').toLowerCase()
        if (!seenContent.has(normalizedContent)) {
          seenContent.add(normalizedContent)
          uniqueParagraphs.push(cleanParagraph)
        }
      } else if (cleanParagraph.length > 0) {
        uniqueParagraphs.push(cleanParagraph)
      }
    }

    processedContent = uniqueParagraphs.join('\n')

    // 移除无用信息
    processedContent = processedContent
      .replace(/首页[>＞][^【]*?【/g, '【') // 移除导航路径
      .replace(/\[[0-9]{4}-[0-9]{2}-[0-9]{2}\]/g, '') // 移除日期标记
      .replace(/【法律依据】[^【]*$/g, '') // 移除法律依据部分（通常在末尾且很长）
      .replace(/【注意事项】[^【]*$/g, '') // 移除注意事项部分
      .replace(/更多相关内容.*/g, '') // 移除"更多相关内容"及后续
      .replace(/相关推荐.*/g, '') // 移除相关推荐
      .replace(/扫码关注.*/g, '') // 移除扫码关注
      .replace(/关注微信.*/g, '') // 移除关注微信

    // 处理标题和段落格式
    processedContent = processedContent.replace(
      /【([^】]+)】/g,
      '<br><strong style="color: #2c5aa0;">【$1】</strong><br>',
    )

    // 处理HTML内容
    processedContent = this.processHtmlContent(processedContent)

    // 构建网络内容信息头部（不显示URL）
    const webHeader = `
      <div style="background: #f0f8ff; padding: 12px; margin: 8px 0; border-left: 4px solid #28a745; border-radius: 4px;">
        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${webData.name || webData.title}</div>
        <div style="font-size: 0.9em; color: #666;">
          <span style="margin-right: 12px;">来源：${webData.name}</span>
          <span>相关度评分：${(webData.score * 100).toFixed(1)}%</span>
        </div>
      </div>
    `

    return webHeader + processedContent
  }
}
