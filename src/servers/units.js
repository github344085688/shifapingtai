/**
 * 从 URL 参数中获取并处理 API Key
 * @param paramName URL 参数名称，默认为 'modelKey'
 * @returns 处理后的 API Key
 */
import { SET_TIMES } from '../config/aiConfig';
export function getApiKeyFromUrl(paramName = 'modelKey') {
    // 获取当前页面的 URL 参数，支持 hash 路由
    let urlParams;
    // 检查是否是 hash 路由
    if (window.location.hash && window.location.hash.includes('?')) {
        // 从 hash 中提取查询参数
        const hashParts = window.location.hash.split('?');
        if (hashParts.length > 1) {
            urlParams = new URLSearchParams(hashParts[1]);
        }
        else {
            urlParams = new URLSearchParams();
        }
    }
    else {
        // 使用传统的查询参数
        urlParams = new URLSearchParams(window.location.search);
    }
    let modelKey = urlParams.get(paramName);
    // 如果没有找到指定参数，尝试查找 'apiKey' 参数作为备选
    if (!modelKey && paramName !== 'apiKey') {
        modelKey = urlParams.get('apiKey');
    }
    if (!modelKey) {
        console.warn(`URL 参数 ${paramName} 未找到`);
        return '';
    }
    // 在第五位（索引4）去掉 "0034"
    if (modelKey.length > 4 && modelKey.substring(4, 8) === '0034') {
        const processedKey = modelKey.substring(0, 4) + modelKey.substring(8);
        // console.log('API Key 已处理，移除了位置4的"0034"')
        return processedKey;
    }
    console.log('API Key 无需处理，返回原始值');
    return modelKey;
}
/**
 * 获取处理后的 Authorization header 值
 * @param paramName URL 参数名称，默认为 'modelKey'
 * @returns Bearer token 字符串
 */
export function getAuthorizationHeader(paramName = 'modelKey') {
    const apiKey = getApiKeyFromUrl(paramName);
    return `Bearer ${apiKey}`;
}
// 新增：从 URL 获取 userId（支持 hash 路由与 query）
export function getUserIdFromUrl(paramName = 'userId') {
    let urlParams;
    if (window.location.hash && window.location.hash.includes('?')) {
        const hashParts = window.location.hash.split('?');
        urlParams = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();
    }
    else {
        urlParams = new URLSearchParams(window.location.search);
    }
    const userId = urlParams.get(paramName);
    // alert(userId)
    if (!userId) {
        console.warn(`URL 参数 ${paramName} 未找到`);
        return '';
    }
    return userId;
}
export function numberOfInterceptions(msg) {
    const hasWx = typeof window.wx !== 'undefined';
    const hasMiniProgram = hasWx && window.wx.miniProgram;
    const messageText = typeof msg === 'string' && msg.trim() ? msg : '您的免费次数已用用完，请充值后再使用。';
    // 统一的消息载荷
    let payload = {};
    if (msg.code === '点击') {
        // alert(msg.code)
        payload = {
            type: 'fromH5',
            data: msg,
            action: 'click',
        };
    }
    else {
        payload = {
            type: 'fromH5',
            data: messageText,
            action: 'updateUserInfo',
        };
    }
    // H5 通信：父窗口（iframe / 宿主容器）
    const postToParent = () => {
        try {
            if (typeof window !== 'undefined' &&
                window.parent &&
                window.parent !== window &&
                typeof window.parent.postMessage === 'function') {
                window.parent.postMessage(payload, '*');
                console.log('H5向父窗口发送消息:', payload);
            }
        }
        catch (e) {
            // 忽略父窗口通信错误
        }
    };
    // H5 通信：React Native WebView
    const postToRN = () => {
        try {
            const rn = window.ReactNativeWebView;
            if (rn && typeof rn.postMessage === 'function') {
                rn.postMessage(JSON.stringify(payload));
                console.log('H5向ReactNativeWebView发送消息:', payload);
            }
        }
        catch (e) {
            // 忽略RN通信错误
        }
    };
    // H5 通信：本页广播（供同域监听者使用）
    const postToSelf = () => {
        try {
            if (typeof window.postMessage === 'function') {
                window.postMessage(payload, '*');
                console.log('H5在当前页广播消息:', payload);
            }
        }
        catch (e) {
            // 忽略自广播错误
        }
    };
    if (hasMiniProgram) {
        // 保留原小程序通信逻辑
        try {
            ;
            window.wx.miniProgram.postMessage({ data: [payload] });
            console.log('H5发送消息到小程序:', payload);
        }
        catch (error) {
            // 小程序通信失败不影响 H5 通道
        }
        // 额外向H5宿主广播，便于宿主也能感知
        postToParent();
        postToRN();
        postToSelf();
        setTimeout(() => {
            try {
                ;
                window.wx.miniProgram.navigateBack();
            }
            catch (error) { }
        }, 200);
    }
    else {
        // 非小程序环境：走H5通信并提示
        postToParent();
        postToRN();
        postToSelf();
        alert(messageText);
    }
}
// 实现：调用 SET_TIMES 并在 POST 成功后返回 true
export const setTimes = async () => {
    try {
        const userId = getUserIdFromUrl();
        if (!userId) {
            console.warn('未获取到 userId，终止调用 SET_TIMES');
            return false;
        }
        const res = await fetch(SET_TIMES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: getAuthorizationHeader(),
            },
            body: JSON.stringify({ userId }),
        });
        if (!res.ok) {
            console.error('SET_TIMES 请求失败', res.status, res.statusText);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('调用 SET_TIMES 异常', error);
        return false;
    }
};
export const interceptData = async (response) => {
    return new Promise(async (resolve) => {
        try {
            const contentType = response.headers?.get?.('content-type') || '';
            // SSE 流直接放行，避免消耗主流
            if (contentType.includes('event-stream')) {
                return resolve({ code: 200, msg: '' });
            }
            // 尝试解析非流的 JSON 响应
            const clone = response.clone?.() || response;
            let text = '';
            try {
                text = await clone.text();
            }
            catch {
                return resolve({ code: 200, msg: '' });
            }
            if (!text)
                return resolve({ code: 200, msg: '' });
            let payload = null;
            try {
                payload = JSON.parse(text);
            }
            catch {
                const match = text.match(/\{[\s\S]*\}/);
                if (match) {
                    try {
                        payload = JSON.parse(match[0]);
                    }
                    catch { }
                }
            }
            if (!payload || typeof payload !== 'object')
                return resolve({ code: 200, msg: '' });
            const msg = payload.msg ?? payload.message;
            if (msg &&
                (msg === '非会员请求数量已超限,请购买套餐后再使用该功能' || msg === '账号未登录')) {
                numberOfInterceptions(msg);
                return resolve({ code: 500, msg: msg });
            }
            return resolve({ code: 200, msg: '' });
        }
        catch (e) {
            console.warn('interceptData 解析失败:', e);
            return resolve({ code: 200, msg: '' });
        }
    });
};
//# sourceMappingURL=units.js.map