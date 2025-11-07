// 样式常量

/**
 * 文字处理工具类
 * 提供各种文本内容处理的公共方法
 */
import { status } from 'juejin-state'

const state = status()
const globalState = state.state
export class TextProcessor {
  /**
   * 处理搜索结果内容
   * @param content 原始内容
   * @param title 标题（可选）
   * @returns 处理后的内容
   */
  static processSearchResultContent(content: string, title?: string): string {
    if (globalState.environment != 'h5') {
      return content
    }
    return content
  }

  /**
   * 处理 HTML 内容
   * @param content 原始内容
   * @returns 处理后的内容
   */
  static processHtmlContent(content: string): string {
    // 清理不需要的标签
    let processedContent = content
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
    if (globalState.environment != 'h5') {
      return processedContent
    } else {
      return content
    }
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
    // 新增：空内容直接不处理，保持当前头部状态
    const trimmed = (content ?? '').trim()
    if (!trimmed) {
      return hasShownHeader
    }

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
