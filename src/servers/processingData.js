// 样式常量
const STYLES = {
    THINKING_CONTENT: 'background: #f9f9f9; padding: 16px; margin: 8px 0; border-radius: 8px; text-gray-500 line-height: 1.6; color: #676666;',
};
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
    static processSearchResultContent(content, title) {
        let processedContent = content;
        // 清理不需要的文字
        processedContent = processedContent.replace(/正在输入\.\.\./g, '').replace(/\.打开对话/g, '');
        // 添加对 ### 标题格式的处理（在编号处理之前）
        return processedContent;
    }
    /**
     * 处理 HTML 内容
     * @param content 原始内容
     * @returns 处理后的内容
     */
    static processHtmlContent(content) {
        // 将换行符转换为 <br> 标签
        let processedContent = content;
        // 清理不需要的标签
        processedContent = processedContent
            .replace(/<img[^>]*>/gi, '') // 去掉 img 标签
            .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1') // 去掉 a 标签但保留文本内容
            .replace(/<url[^>]*>(.*?)<\/url>/gi, '$1') // 去掉 url 相关的标签
            .replace(/<(?!\/?(?:p|h[1-6]|ul|ol|li|strong|b|em|i|br|div|span)\b)[^>]*>/gi, ''); // 移除不允许的标签但保留内容
        // 去除 URL 链接（http/https）
        processedContent = processedContent.replace(/https?:\/\/[^\s<>"']+/gi, ''); // 去掉 http 和 https 链接
        // 去除来源相关信息
        processedContent = processedContent
            .replace(/来源[:：]\s*/gi, '') // 去掉"来源："或"来源："
            .replace(/来源/gi, '') // 去掉单独的"来源"
            .replace(/['"]?https?:[^'"]*['"]?/gi, '') // 去掉所有包含http/https的内容，不管有没有引号
            .replace(/['"]?http:[^'"]*['"]?/gi, '') // 去掉所有包含http的内容，不管有没有引号
            .replace(/https?:xxx/gi, '') // 去掉http:xxx和https:xxx格式
            .replace(/http:xxx/gi, ''); // 去掉http:xxx格式
        // 去除邮箱地址
        processedContent = processedContent.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, ''); // 去掉邮箱地址
        // 去除热线电话号码
        processedContent = processedContent
            .replace(/热线[:：]\s*[\d-]+/gi, '') // 去掉热线电话
            .replace(/报料热线[:：]\s*[\d-]+/gi, '') // 去掉报料热线
            .replace(/电话[:：]\s*[\d-]+/gi, ''); // 去掉电话号码
        // 去除浏览器升级提示相关内容
        processedContent = processedContent
            .replace(/您使用的浏览器版本过低[^。]*。[^。]*升级浏览器/gi, '') // 去掉浏览器升级提示
            .replace(/建议升级或更换浏览器访问[^。]*升级浏览器/gi, ''); // 去掉浏览器升级建议
        // 去除澎湃新闻相关的无用信息
        processedContent = processedContent
            .replace(/仅提供信息发布平台[^。]*申请澎湃号请用电脑访问/gi, '') // 去掉澎湃号申请提示
            .replace(/http:\/\/renzheng\.thepaper\.cn[^。]*/gi, '') // 去掉澎湃认证链接
            .replace(/\+\d+收藏我要举报/gi, '') // 去掉收藏举报按钮
            .replace(/#[^#]*#/gi, '') // 去掉话题标签
            .replace(/查看更多/gi, '') // 去掉查看更多
            .replace(/开始答题/gi, '') // 去掉开始答题
            .replace(/扫码下载[^。]*客户端/gi, ''); // 去掉扫码下载提示
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
            .replace(/反馈/gi, ''); // 去掉反馈按钮
        return processedContent;
    }
    /**
     * 创建带样式的消息
     * @param content 内容
     * @param style 样式
     * @returns 带样式的HTML字符串
     */
    static createStyledMessage(content, style) {
        return `<div style="${style}">${content}</div>`;
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
    static handleMessageWithHeader(content, hasShownHeader, headerText, callback, isThinking = true, headerStyle) {
        if (!hasShownHeader) {
            callback(this.createStyledMessage(`${headerText}${content}`, headerStyle), false, isThinking);
            return true;
        }
        else {
            callback(this.createStyledMessage(content, headerStyle), false, isThinking);
            return hasShownHeader;
        }
    }
    /**
     * 处理法条内容（xgft API专用）
     * @param lawData 法条数据对象
     * @returns 格式化后的法条内容
     */
    static processLawContent(lawData) {
        let processedContent = lawData.content;
        // 基础文本清理
        processedContent = processedContent.replace(/正在输入\.\.\./g, '').replace(/\.打开对话/g, '');
        processedContent = this.processHtmlContent(processedContent);
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
    `;
        return lawHeader + processedContent;
    }
    /**
     * 处理网络搜索内容（wlgd API专用）
     * @param webData 网络搜索数据对象
     * @returns 格式化后的网络内容
     */
    static processWebContent(webData) {
        let processedContent = webData.content;
        // 基础文本清理
        processedContent = processedContent.replace(/正在输入\.\.\./g, '').replace(/\.打开对话/g, '');
        // 移除无用信息
        processedContent = processedContent
            .replace(/首页[>＞][^【]*?【/g, '【') // 移除导航路径
            .replace(/\[[0-9]{4}-[0-9]{2}-[0-9]{2}\]/g, '') // 移除日期标记
            .replace(/【法律依据】[^【]*$/g, '') // 移除法律依据部分（通常在末尾且很长）
            .replace(/【注意事项】[^【]*$/g, '') // 移除注意事项部分
            .replace(/更多相关内容.*/g, '') // 移除"更多相关内容"及后续
            .replace(/相关推荐.*/g, '') // 移除相关推荐
            .replace(/扫码关注.*/g, '') // 移除扫码关注
            .replace(/关注微信.*/g, ''); // 移除关注微信
        // 构建网络内容信息头部（不显示URL）
        const webHeader = `
      <div style="background: #f0f8ff; padding: 12px; margin: 8px 0; border-left: 4px solid #28a745; border-radius: 4px;">
        <div style="font-weight: bold; color: #333; margin-bottom: 4px;">${webData.name || webData.title}</div>
        <div style="font-size: 0.9em; color: #666;">
          <span style="margin-right: 12px;">来源：${webData.name}</span>
          <span>相关度评分：${(webData.score * 100).toFixed(1)}%</span>
        </div>
      </div>
    `;
        return webHeader + processedContent;
    }
}
//# sourceMappingURL=processingData.js.map