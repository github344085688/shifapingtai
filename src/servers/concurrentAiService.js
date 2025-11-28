// class ConcurrentAIService
import aiConfig, { concurrentApis } from '@/config/aiConfig';
import { TextProcessor } from './processingData';
import { getApiKeyFromUrl } from './units';
class ConcurrentAIService {
    constructor(apiKey) {
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "results", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activeApis", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.apiKey = apiKey || aiConfig.apiKey;
        this.model = aiConfig.model;
        this.results = new Map();
        this.activeApis = [];
        // 初始化结果对象
        Object.values(concurrentApis).forEach((apiConfig) => {
            this.results.set(apiConfig.key, {
                key: apiConfig.key,
                name: apiConfig.name,
                content: '',
                isLoading: false,
                isCompleted: false,
                aiLoading: false, // 初始化aiLoading状态
            });
        });
    }
    // 获取所有结果（仅返回本次激活的 API 对应的结果）
    getAllResults() {
        // 安全保护：activeApis 未设置则回退到现有结果
        if (!this.activeApis || this.activeApis.length === 0) {
            return Array.from(this.results.values());
        }
        return this.activeApis
            .map((api) => this.results.get(api.key))
            .filter((r) => !!r);
    }
    // 并发调用所有API - 改为循环处理
    async sendConcurrentRequests(message, callback, labels) {
        // 根据传入的 labels 映射到并发 API 配置；若未传则默认全部
        const selectedApis = labels && labels.length > 0
            ? labels
                .map((l) => concurrentApis[l.key])
                .filter((cfg) => !!cfg)
            : Object.values(concurrentApis);
        this.activeApis = selectedApis;
        selectedApis.forEach((apiConfig) => {
            if (!this.results.has(apiConfig.key)) {
                this.results.set(apiConfig.key, {
                    key: apiConfig.key,
                    name: apiConfig.name,
                    content: '',
                    isLoading: false,
                    isCompleted: false,
                    aiLoading: false,
                });
            }
            const result = this.results.get(apiConfig.key);
            result.isLoading = true;
            result.isCompleted = false;
            result.aiLoading = true;
            result.content = '';
            result.error = undefined;
        });
        selectedApis.forEach((apiConfig) => {
            this.sendSingleRequest(apiConfig, message, callback);
        });
    }
    // 处理特定API的响应数据
    processApiResponse(apiKey, extractedContent) {
        if ((apiKey === 'xgft' || apiKey === 'wlgd') && Array.isArray(extractedContent)) {
            // 处理相关法条数据
            return extractedContent
                .map((law) => {
                if (law.content && law.title) {
                    const processedContent = TextProcessor.processSearchResultContent(law.content, law.title);
                    // 添加法条的额外信息
                    let additionalInfo = '';
                    if (law.department) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em; margin-top: 8px;">发布机关：${law.department}</div>`;
                    }
                    if (law.status) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em;">状态：${law.status}</div>`;
                    }
                    if (law.law_type) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em;">类型：${law.law_type}</div>`;
                    }
                    if (law.directory && Array.isArray(law.directory)) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em;">条文路径：${law.directory.join(' > ')}</div>`;
                    }
                    return (processedContent +
                        additionalInfo +
                        '<hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">');
                }
                return TextProcessor.processSearchResultContent(law.content || '');
            })
                .join('');
        }
        else if (apiKey === 'wlgd' && Array.isArray(extractedContent)) {
            // 处理网络观点数据
            return extractedContent
                .map((web) => {
                if (web.content && web.title) {
                    const processedContent = TextProcessor.processSearchResultContent(web.content, web.title);
                    // 添加网络观点的额外信息
                    let additionalInfo = '';
                    if (web.url) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em; margin-top: 8px;">来源：<a href="${web.url}" target="_blank" style="color: #1890ff;">${web.url}</a></div>`;
                    }
                    if (web.score) {
                        additionalInfo += `<div style="color: #666; font-size: 0.9em;">相关度：${(web.score * 100).toFixed(1)}%</div>`;
                    }
                    return (processedContent +
                        additionalInfo +
                        '<hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;">');
                }
                return TextProcessor.processSearchResultContent(web.content || '');
            })
                .join('');
        }
        // 对于其他API或非数组数据，也使用TextProcessor处理
        const contentString = typeof extractedContent === 'string' ? extractedContent : JSON.stringify(extractedContent);
        return TextProcessor.processSearchResultContent(contentString);
    }
    // 发送单个API请求 - 添加callback参数
    async sendSingleRequest(apiConfig, message, callback) {
        // console.log('🌐 发起网络请求:ssssssssssssssssssssss', apiConfig)
        try {
            const abortController = new AbortController();
            const signal = abortController.signal;
            // 设置加载状态
            const result = this.results.get(apiConfig.key);
            result.isLoading = true;
            result.isCompleted = false;
            result.aiLoading = true; // API开始时设置aiLoading为true
            // 立即回调通知API开始
            callback(apiConfig.key, '', false);
            // 构建请求参数，根据配置动态添加参数
            let requestBody;
            // 特殊处理相似案例API
            if (apiConfig.name === '相似案例' || apiConfig.key === 'xsalgnfx') {
                requestBody = {
                    question: message.content,
                };
            }
            else {
                // 其他API使用原有格式
                requestBody = {
                    messages: [message],
                    stream: false,
                };
                // 优先使用配置中的model，如果没有则使用默认的this.model
                requestBody.model = apiConfig.model || this.model;
                if (apiConfig.top_k !== undefined) {
                    requestBody.top_k = apiConfig.top_k;
                }
                if (apiConfig.threshold !== undefined) {
                    requestBody.threshold = apiConfig.threshold;
                }
                if (apiConfig.version !== undefined) {
                    requestBody.version = apiConfig.version;
                }
                if (apiConfig.casetype !== undefined) {
                    requestBody.casetype = apiConfig.casetype;
                }
                if (apiConfig.step !== undefined) {
                    requestBody.step = apiConfig.step;
                }
            }
            const KeyFromUrl = getApiKeyFromUrl();
            const response = await fetch(apiConfig.api, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                    Authorization: 'Bearer ' + KeyFromUrl,
                },
                body: JSON.stringify(requestBody),
                signal: signal,
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // 获取响应数据
            const responseData = await response.json();
            // 过滤固定字段，提取实际的数组内容
            let extractedContent = '';
            // 在 sendSingleRequest 方法中，大约在第200-240行之间
            // 修改数据提取逻辑
            if (responseData && responseData.data !== undefined) {
                // 对于相似案例API，特殊处理数据格式
                if (apiConfig.key === 'xsal') {
                    // 相似案例返回格式: { code: 0, data: [...], msg: "成功" }
                    extractedContent = responseData.data;
                }
                else {
                    // 其他API使用原有逻辑
                    extractedContent = responseData.data[apiConfig.dataField] || responseData.data;
                }
                // 如果提取的内容为空，尝试使用模拟数据
                if ((!extractedContent || extractedContent === '') && apiConfig.simulatedData) {
                    extractedContent = apiConfig.simulatedData;
                }
                // 如果还是没有内容，使用原始响应数据
                if (!extractedContent || extractedContent === '') {
                    extractedContent = responseData;
                }
            }
            else {
                // 如果没有responseData.data，优先使用simulatedData，否则使用原始响应
                extractedContent = apiConfig.simulatedData || responseData;
            }
            // 对特定API进行文字处理 - 需要确保相似案例数据被正确处理
            let processedContent;
            if (apiConfig.key === 'xsal') {
                // 相似案例直接返回JSON字符串，让前端处理
                processedContent = JSON.stringify(extractedContent);
            }
            else {
                processedContent = this.processApiResponse(apiConfig.key, extractedContent);
            }
            result.content = processedContent;
            result.isLoading = false;
            result.isCompleted = true;
            result.aiLoading = false; // API完成时设置aiLoading为false
            // 回调通知API完成
            callback(apiConfig.key, processedContent, true);
        }
        catch (error) {
            const result = this.results.get(apiConfig.key);
            result.isLoading = false;
            result.isCompleted = true;
            result.aiLoading = false; // 出错时也设置aiLoading为false
            if (error.name === 'AbortError') {
                result.error = '请求已中断';
            }
            else {
                result.error = `网络请求失败: ${error.message}`;
            }
            // 回调通知API出错
            callback(apiConfig.key, '', true, result.error);
        }
    }
}
export default ConcurrentAIService;
//# sourceMappingURL=concurrentAiService.js.map