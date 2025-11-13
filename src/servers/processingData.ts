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
    processedContent = this.processHtmlContent(processedContent)
    // 清理不需要的文字    processedContent = this.processHtmlContent(processedContent)
    processedContent = processedContent
      .replace(/正在输入\.\.\./g, '')
      .replace(/\.打开对话/g, '')
      .replace(/\\\"/g, '"')
      .replace(/(?:<br>\s*){3,}/g, '<br><br>')
      .replace(/[ \t]*<br>[ \t]*/g, '<br>')

    // 处理 HTML 内容

    // 新增：预处理拆分的编号与孤立的点
    processedContent = processedContent
      // 将“数字 + 换行/<br> + .”合并为“数字.”
      .replace(/([0-9]+)\s*(?:<br>)\s*\./g, '$1.')
      // 将“数字. + 换行/<br>”也收敛为“数字.”
      .replace(/([0-9]+)\.\s*(?:<br>)/g, '$1.')
      // 合并“中文数字 + 换行/<br> + 、”为“中文数字、”
      .replace(/([一二三四五六七八九十百千万]+)\s*(?:<br>)\s*、/g, '$1、')
      // 合并“阿拉伯数字 + 换行/<br> + 、”为“数字、”
      .replace(/([0-9]+)\s*(?:<br>)\s*、/g, '$1、')
      // 合并“### + 空格 + 中文数字 + 换行/<br> + 、”为“### 中文数字、”
      .replace(/(#{1,6})\s*(?:<br>)\s*([一二三四五六七八九十百千万]+)\s*、/g, '$1 $2、')
      // 移除单独一行的句点（孤立的 .） — 已移除该规则，保留编号后的点
      // .replace(/(?:^|<br>|\r?\n)\s*\.(?=(<br>|\r?\n|$))/g, '')
      // 压缩连续英文点“..”为“.”
      .replace(/\.{2,}/g, '.')

    // 处理编号格式的断行（并缩进两个中文全角空格：　　）
    // 一、二、三等（前面带标点符号）
    processedContent = processedContent.replace(
      /([*]?)([一二三四五六七八九十]+)、/g,
      (match, asterisk, number, offset, string) => {
        // 避免在 Markdown 标题 "### 一、" 中断行
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}${number}、`
      },
    )

    // 第一步、第二步、第三步等
    processedContent = processedContent.replace(
      /([*]?)第([一二三四五六七八九十]+|[0-9]+)步，/g,
      (match, asterisk, number, offset, string) => {
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}第${number}步，`
      },
    )

    // 处理 \n（一）、\n（二）、\n（三）等格式
    processedContent = processedContent.replace(
      /\\n（([一二三四五六七八九十]+)）/g,
      (match, number) => {
        return `<br>　　（${number}）`
      },
    )

    // 1. 2. 3. 等（排除时间格式）- 同时处理有空格和无空格的情况
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)\.(\s|(?=[\u4e00-\u9fff]))/g,
      (match, asterisk, number, spaceOrChinese, offset, string) => {
        const beforeChar = string[offset - 1]
        const afterChars = string.substring(offset + match.length, offset + match.length + 3)
        // 避免时间格式
        if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
          return match
        }
        // 避免在 Markdown 标题 "### 1." 中断行
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}${number}.${spaceOrChinese}`
      },
    )

    // 1.， 2.。 3.； 等数字+点+中文标点
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)\.([，。；：])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        const beforeChar = string[offset - 1]
        if (/[0-9:]/.test(beforeChar)) {
          return match
        }
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}${number}.${punctuation}`
      },
    )

    // （一）（二）（三）等
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）/g,
      (match, asterisk, number) => {
        return `<br>　　${asterisk}（${number}）`
      },
    )

    // （一）、（二），（三）； 等（带标点）
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）([，。；：、])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        const beforeChar = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>　　${asterisk}（${number}）${punctuation}`
        }
        return match
      },
    )

    // 冒号后的中文编号：（一）：（二）：等
    processedContent = processedContent.replace(
      /([*]?)（([一二三四五六七八九十]+)）[:：]/g,
      (match, asterisk, number, offset, string) => {
        const beforeChar = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>　　${asterisk}（${number}）：`
        }
        return match
      },
    )

    // (1) (2) (3) 等阿拉伯数字括号格式
    processedContent = processedContent.replace(
      /([*]?)(\([0-9]+\))/g,
      (match, asterisk, number, offset, string) => {
        const beforeChar = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>　　${asterisk}${number}`
        }
        return match
      },
    )

    // 标点符号 + （数字）格式：。（1）、，（2）、；（3）等（半角/全角数字皆可）
    processedContent = processedContent.replace(
      /([。，、；：！？""''）】》])(\([1-9１-９][0-9０-９]*\))/g,
      (match, punctuation, numberPart) => {
        return `${punctuation}<br>　　${numberPart}`
      },
    )

    // (1), (2). (3)， 等括号 + 标点符号格式
    processedContent = processedContent.replace(
      /([*]?)(\([0-9]+\))([，。；：,.])/g,
      (match, asterisk, number, punctuation, offset, string) => {
        const beforeChar = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>　　${asterisk}${number}${punctuation}`
        }
        return match
      },
    )

    // 数字编号处理：1，2，3，等（排除时间）
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)，/g,
      (match, asterisk, number, offset, string) => {
        const beforeChar = string[offset - 1]
        const afterChars = string.substring(offset + match.length, offset + match.length + 3)
        if (/[0-9:]/.test(beforeChar) || /[0-9]{2}:/.test(afterChars)) {
          return match
        }
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}${number}，`
      },
    )

    // 数字顿号处理：1、2、3、等（统一断行）
    processedContent = processedContent.replace(
      /([*]?)([0-9]+)、/g,
      (match, asterisk, number, offset, string) => {
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}${number}、`
      },
    )

    // 圆圈数字编号 ①②③④⑤⑥⑦⑧⑨⑩…
    processedContent = processedContent.replace(
      /([*]?)([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])/g,
      (match, asterisk, circleNumber, offset, string) => {
        const beforeChar = string[offset - 1]
        if (
          /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef。，、；：！？""''（）【】《》a-zA-Z]/.test(
            beforeChar,
          )
        ) {
          return `<br>　　${asterisk}${circleNumber}`
        }
        return `<br>　　${asterisk}${circleNumber}`
      },
    )

    // 第一、第二等
    processedContent = processedContent.replace(
      /([*]?)第([一二三四五六七八九十]+)/g,
      (match, asterisk, number, offset, string) => {
        const prev = string.slice(Math.max(0, offset - 5), offset)
        if (/#/.test(prev)) return match
        return `<br>　　${asterisk}第${number}`
      },
    )

    // 编号处理后压缩连续中文标点
    processedContent = processedContent.replace(/([，。；：、]){2,}/g, '$1')

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
    let processedContent = content
    processedContent = processedContent.replace(/^(#{1,6})\s*\r?\n\s*([^\r\n].+)/gm, '$1 $2')
    processedContent = processedContent.replace(/^#{1,6}\s*$/gm, '')
    processedContent = processedContent.replace(/<br>\s*#{1,6}\s*(?=<br>|$)/g, '<br>')
    {
      const styles: Record<number, string> = {
        1: 'font-size: 1.6em; font-weight: bold; margin: 24px 0 12px 0; color: #333;',
        2: 'font-size: 1.4em; font-weight: bold; margin: 20px 0 10px 0; color: #333;',
        3: 'font-size: 1.2em; font-weight: bold; margin: 16px 0 8px 0; color: #333;',
        4: 'font-size: 1.1em; font-weight: bold; margin: 14px 0 8px 0; color: #333;',
        5: 'font-size: 1.0em; font-weight: bold; margin: 12px 0 6px 0; color: #333;',
        6: 'font-size: 0.95em; font-weight: bold; margin: 10px 0 6px 0; color: #333;',
      }
      for (let level = 1; level <= 6; level++) {
        const tag = `h${level}`
        const style = styles[level]
        processedContent = processedContent.replace(
          new RegExp(`^#{${level}}\\s*(\\S.+)$`, 'gm'),
          `<${tag} style="${style}">$1</${tag}>`,
        )
        processedContent = processedContent.replace(
          new RegExp(`<br>#{${level}}\\s*(\\S.+?)(?=<br>|$)`, 'g'),
          `<br><${tag} style="${style}">$1</${tag}>`,
        )
      }
    }

    // 去除 URL 链接（http/https）
    processedContent = processedContent.replace(/https?:\/\/[^\s<>"']+/gi, '')

    // 新增：处理带 <br> 的 "####"（确保只保留一个空行）
    processedContent = processedContent.replace(/<br>\s*####\s*(?=<br>|$)/g, '<br>')

    // 处理 Markdown 标题格式

    // 处理带<br>标签的markdown标题（因为前面已经将\n转换为<br>）

    processedContent = processedContent.replace(/^###\s*$/gm, '')
    processedContent = processedContent.replace(/<br>\s*###\s*(?=<br>|$)/g, '<br>')

    // 新增：带 <br> 的 ####～###### 标题

    processedContent = processedContent.replace(
      /\*\*\*([^*]+?)\*\*\*/g,
      '<strong><em>$1</em></strong>',
    )
    processedContent = processedContent.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    processedContent = processedContent.replace(/\*([^*]+?)\*/g, '<em>$1</em>')

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
      .replace(/#[\u4e00-\u9fffA-Za-z0-9_]+#/g, '')
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

    const toOrderedFromDash = (src: string, useBr: boolean) => {
      const parts = useBr ? src.split(/<br>/) : src.split(/\r?\n/)
      const out: string[] = []
      let buf: string[] = []
      const flush = () => {
        if (buf.length) {
          const items = buf.map((l) => l.replace(/^\s*-\s+/, '').trim()).filter((v) => v.length > 0)
          out.push(`<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`)
          buf = []
        }
      }
      for (const p of parts) {
        const t = p.trim()
        if (/^-\s+/.test(t)) {
          buf.push(p)
        } else {
          flush()
          out.push(p)
        }
      }
      flush()
      return useBr ? out.join('<br>') : out.join('\n')
    }

    const toOrderedFromNumbers = (src: string, useBr: boolean) => {
      const parts = useBr ? src.split(/<br>/) : src.split(/\r?\n/)
      const out: string[] = []
      let buf: string[] = []
      const flush = () => {
        if (buf.length) {
          const items = buf
            .map((l) => l.replace(/^\s*(?:　　)?\*?[0-9]+\.\s*/, '').trim())
            .filter((v) => v.length > 0)
          out.push(`<ol>${items.map((i) => `<li>${i}</li>`).join('')}</ol>`)
          buf = []
        }
      }
      for (const p of parts) {
        const t = p.trim()
        if (/^(?:　　)?\*?[0-9]+\.\s*/.test(t)) {
          buf.push(p)
        } else {
          flush()
          out.push(p)
        }
      }
      flush()
      return useBr ? out.join('<br>') : out.join('\n')
    }

    processedContent = toOrderedFromNumbers(processedContent, false)
    processedContent = toOrderedFromDash(processedContent, false)

    // 新增：统一将剩余的原始换行转为 <br>，保证换行显示

    // processedContent = toOrderedFromNumbers(processedContent, true)
    // processedContent = toOrderedFromDash(processedContent, true)

    if (processedContent === ' -') console.log('11111111111111111', processedContent)
    // 处理无序列表（- 开头的行）
    processedContent = processedContent.replace(
      /(?:^|\r?\n|\s)-\s*(.*?)(?=(\r?\n|$))/g,
      (match, item) => {
        // item 可能是空字符串或只包含空白，去掉两端空白
        const text = (item || '').trim()
        console.log('matched item:', JSON.stringify(text))
        return `<li>${text}</li>`
      },
    )

    console.log('after li replace:', JSON.stringify(processedContent))

    const wrapLiGroupsSafe = (src: string) => {
      let result = ''
      let lastIndex = 0
      const re = /(?:\s*<li>[\s\S]*?<\/li>\s*)+/g
      let m: RegExpExecArray | null
      while ((m = re.exec(src)) !== null) {
        const start = m.index
        const end = re.lastIndex
        result += src.slice(lastIndex, start)
        const before = src.slice(Math.max(0, start - 16), start)
        const after = src.slice(end, Math.min(src.length, end + 16))
        const hasOpen = /<\s*(ul|ol)\b/i.test(before)
        const hasClose = /<\/\s*(ul|ol)\b/i.test(after)
        if (hasOpen && hasClose) {
          result += m[0]
        } else {
          result += `<ul>${m[0].trim()}</ul>`
        }
        lastIndex = end
      }
      result += src.slice(lastIndex)
      return result
    }
    processedContent = wrapLiGroupsSafe(processedContent)

    processedContent = processedContent.replace(/(?:<br>\s*){3,}/g, '<br><br>')
    processedContent = processedContent.replace(/[ \t]*<br>[ \t]*/g, '<br>')
    processedContent = processedContent.replace(/\r\n/g, '\n')
    processedContent = processedContent.replace(/\r/g, '\n')
    processedContent = processedContent.replace(/\n{2,}/g, '<br><br>')
    processedContent = processedContent.replace(/[ \t]*\n/g, '<br>')

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
    // .replace(/\\n/g, '\n')
    // .replace(/\\\"/g, '"')

    // 处理法条编号格式
    // processedContent = processedContent.replace(
    //   /第([一二三四五六七八九十百千万]+|[0-9]+)条/g,
    //   '<br><strong>第$1条</strong>',
    // )

    // 小项编号（包括带星号）
    // processedContent = processedContent.replace(/（([一二三四五六七八九十]+)）/g, '<br>　　（$1）')
    // processedContent = processedContent.replace(/（\*）/g, '<br>　　（*）')
    // processedContent = processedContent.replace(/([0-9]+)、/g, '<br>　　$1、')
    // processedContent = processedContent.replace(/\*([0-9]+)、/g, '<br>　　*$1、')
    // processedContent = processedContent.replace(/^\*\s+/gm, '<br>　　* ')

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
    processedContent = this.processHtmlContent(processedContent)
    // 处理 "---\n\n" 转为断行

    // 去除重复内容 - 检测并移除重复的段落
    const paragraphs = processedContent.split(/\n+/)
    const uniqueParagraphs: string[] = []
    const seenContent = new Set<string>()

    for (const paragraph of paragraphs) {
      const cleanParagraph = paragraph.trim()
      if (cleanParagraph.length > 10) {
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
      .replace(/首页[>＞][^【]*?【/g, '【')
      .replace(/\[[0-9]{4}-[0-9]{2}-[0-9]{2}\]/g, '')
      .replace(/【法律依据】[^【]*$/g, '')
      .replace(/【注意事项】[^【]*$/g, '')
      .replace(/更多相关内容.*/g, '')
    processedContent = processedContent.replace(/---\n\n/g, '<br>')
    return this.processHtmlContent(processedContent)
  }
}
