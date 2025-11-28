import { ref, defineComponent, nextTick, onMounted } from 'vue';
import { AiText } from 'juejin-puts';
import { status } from 'juejin-state';
import aiConfig, { ConsultationOnLegalIssues, CACHE_DURATION } from '@/config/aiConfig';
import AIService from '@/servers/aiservis';
import ConcurrentAIService from '@/servers/concurrentAiService';
import router from '@/router';
import { useTitle } from '@/composables/useTitle';
import SendMessages from '@/components/sendMessages/sendMessages.vue';
const state = status();
const globalState = state.state;
const { title, updateTitle } = useTitle('法研智答');
defineComponent({ name: 'Ai' });
const gotopage = () => {
    alert();
    router.push({ name: 'AcrossTheEntireNetwork' });
};
const autoScroll = ref(true);
const userScrolled = ref(false);
onMounted(() => {
    if (globalState.legalResearchSmartAnswer &&
        globalState.legalResearchSmartAnswer.aiResults &&
        globalState.legalResearchSmartAnswer.generalAiTime) {
        const currentTime = Date.now();
        const savedTime = globalState.legalResearchSmartAnswer.generalAiTime;
        const timeDifference = currentTime - savedTime;
        if (timeDifference < CACHE_DURATION) {
            messages.value = globalState.legalResearchSmartAnswer.aiResults;
            if (messages.value.length > 0)
                updateTitle(`法研智答`);
        }
        else {
            messages.value = [];
            delete globalState.legalResearchSmartAnswer.aiResults;
            delete globalState.legalResearchSmartAnswer.generalAiTime;
        }
    }
    if (globalState.legalResearchSmartAnswer && globalState.legalResearchSmartAnswer.aiResults)
        messages.value = globalState.legalResearchSmartAnswer.aiResults;
    window.addEventListener('scroll', handleUserScroll);
    window.addEventListener('touchmove', handleUserScroll);
});
const handleUserScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight < documentHeight - 50) {
        userScrolled.value = true;
        autoScroll.value = false;
    }
};
const concurrentLabels = ref([
    { key: 'xsyw', label: '相似疑问' },
    { key: 'xgft', label: '相关法条' },
    { key: 'wlgd', label: '网络观点' },
    { key: 'cpgdz', label: '裁判观点' },
    { key: 'swyj', label: '实务研究' },
    { key: 'xsal', label: '相似案例' },
]);
// 复制成功提示/无数据提示
const showCopySuccess = ref(false);
const showNoDataTip = ref(false);
const isWeixinUrl = (url) => {
    if (!url)
        return false;
    return url.startsWith('http://mp.weixin.qq.com') || url.includes('https://mp.weixin.qq.com/');
};
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess.value = true;
        setTimeout(() => (showCopySuccess.value = false), 2000);
    }
    catch {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopySuccess.value = true;
        setTimeout(() => (showCopySuccess.value = false), 2000);
    }
};
const cleanUrl = (url) => (url ? url.replace(/`/g, '').trim() : '');
const getApiKeyFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('apiKey') || aiConfig.apiKey;
};
const aiConfigs = {
    api: ConsultationOnLegalIssues.api,
    apiKey: getApiKeyFromUrl(),
    model: ConsultationOnLegalIssues.model,
    isTimer: true,
    useMock: false,
};
const aiService = new AIService(aiConfigs);
const concurrentAiService = new ConcurrentAIService(getApiKeyFromUrl());
const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求']);
const messages = ref([]);
const userInput = ref('');
const chatContainer = ref(null);
const concurrentResults = ref([]);
const handleExampleClick = (question) => {
    userInput.value = question;
    sendMessages();
};
const sendMessages = async () => {
    const message = userInput.value;
    if (!message)
        return;
    autoScroll.value = true;
    userScrolled.value = false;
    addMessage(message, 'user');
    updateTitle(`法研智答`);
    const newMessage = { role: 'user', content: message };
    const assistantMessage = {
        content: '',
        sender: 'assistant',
        isLoading: true,
        aiLoading: true,
        concurrentResults: concurrentAiService.getAllResults(),
    };
    messages.value.push(assistantMessage);
    // await aiService.sendToAIMock('测试消息', setMessage)
    aiService.sendToAI(newMessage, setMessage);
    await concurrentAiService.sendConcurrentRequests(newMessage, handleConcurrentCallback, concurrentLabels.value);
    userInput.value = '';
};
// const handleConcurrentCallback = (
//   key: string,
//   content: string,
//   isCompleted: boolean,
//   error?: string,
// ) => {
//   const lastMessage = messages.value[messages.value.length - 1]
//   if (lastMessage && lastMessage.sender === 'assistant') {
//     const lastResult = concurrentAiService.getAllResults()
//     lastMessage.concurrentResults = lastResult
//     lastResult.forEach((result) => (result.aiLoading = !result.isCompleted))
//     const allCompleted = lastResult.every((result) => result.isCompleted)
//     if (allCompleted && !lastMessage.aiLoading) {
//       lastMessage.isLoading = false
//       globalState.legalResearchSmartAnswer.aiResults = messages.value
//     }
//   }
// }
const handleConcurrentCallback = (key, content, isCompleted, error) => {
    const currentMessages = messages.value;
    const lastIndex = currentMessages.length - 1;
    const lastMessage = currentMessages[lastIndex];
    // 仅处理最后一条且是 assistant 的消息
    if (!lastMessage || lastMessage.sender !== 'assistant')
        return;
    // 从服务获取结果，但做不可变克隆与更新
    const serviceResults = concurrentAiService.getAllResults();
    const updatedResults = serviceResults.map((r) => {
        if (r.key === key) {
            return {
                ...r,
                // content: content ?? r.content,
                isCompleted: isCompleted ?? r.isCompleted,
                error: error ?? r.error,
                aiLoading: !(isCompleted ?? r.isCompleted),
            };
        }
        return {
            ...r,
            aiLoading: !r.isCompleted,
        };
    });
    const allCompleted = updatedResults.every((r) => r.isCompleted);
    // 只更新最后一条消息的内容与状态（不可变替换）
    const updatedLastMessage = {
        ...lastMessage,
        // content: content ? (lastMessage.content || '') + content : lastMessage.content,
        concurrentResults: updatedResults,
        isLoading: !allCompleted,
        aiLoading: !allCompleted,
    };
    // 不改变原有数据结构，只替换最后一条
    messages.value = [...currentMessages.slice(0, lastIndex), updatedLastMessage];
    // 全部完成后再写入全局结果
    if (allCompleted) {
        globalState.legalResearchSmartAnswer.aiResults = messages.value;
    }
};
const setMessage = (message, isDone, isThinking, isError = false) => {
    const lastMessage = messages.value[messages.value.length - 1];
    if (!lastMessage || lastMessage.sender !== 'assistant')
        return;
    if (isDone) {
        if (isError)
            lastMessage.content = `${lastMessage.content}${message}`;
        lastMessage.aiLoading = false;
        const allConcurrentCompleted = lastMessage.concurrentResults?.every((result) => result.isCompleted) ?? true;
        if (allConcurrentCompleted) {
            lastMessage.isLoading = false;
            globalState.legalResearchSmartAnswer = {};
            globalState.legalResearchSmartAnswer.aiResults = messages.value;
            globalState.legalResearchSmartAnswer.generalAiTime = Date.now();
        }
        return;
    }
    if (isThinking) {
        lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`;
    }
    else {
        lastMessage.aiLoading = false;
        lastMessage.content = `${lastMessage.content}${message}`;
    }
    if (autoScroll.value && !userScrolled.value) {
        scrollToBottom();
    }
};
const scrollToBottom = () => {
    nextTick(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, document.body.scrollHeight);
        }
    });
};
const addMessage = (content, sender) => {
    messages.value.push({ content, sender });
    if (autoScroll.value && !userScrolled.value) {
        scrollToBottom();
    }
};
const getConcurrentResult = (aiLoading, results, key) => {
    if (!aiLoading)
        false;
    return results?.find((result) => result.key === key);
};
const isConcurrentButtonDisabled = (message, key) => {
    if (!message.concurrentResults || message.concurrentResults.length === 0)
        return true;
    const result = message.concurrentResults.find((item) => item.key === key);
    if (!result || !result.content)
        return true;
    switch (key) {
        case 'xsyw':
        case 'swyj':
        case 'xsal':
            try {
                const content = JSON.parse(result.content);
                if (!Array.isArray(content) || content.length === 0)
                    return true;
            }
            catch {
                return true;
            }
            break;
        case 'xgft':
        case 'wlgd':
            if (!result.content || result.content.trim() === '')
                return true;
            break;
        default:
            break;
    }
    return false;
};
// 新增：解析包含加粗标题的 HTML 为分段数组
const htmlToText = (s) => {
    return s
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<hr[^>]*>/gi, '\n----------------\n')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\s+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};
const parseHtmlSections = (html) => {
    if (!html)
        return [];
    const normalized = String(html);
    const titleRegex = /<div[^>]*style="[^"]*font-weight:\s*bold[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const sections = [];
    let match;
    titleRegex.lastIndex = 0;
    while ((match = titleRegex.exec(normalized)) !== null) {
        const rawTitle = match[1];
        const title = htmlToText(rawTitle);
        const contentStart = titleRegex.lastIndex;
        sections.push({ title, contentStart });
    }
    const results = [];
    for (let i = 0; i < sections.length; i++) {
        const { title, contentStart } = sections[i];
        const nextStart = i + 1 < sections.length ? sections[i + 1].contentStart : normalized.length;
        const rawContent = normalized.slice(contentStart, nextStart);
        const content = htmlToText(rawContent);
        if (title || content) {
            results.push({ title, content });
        }
    }
    // 若未匹配到任何加粗标题，但仍有内容，则尝试用第一行作为标题
    if (results.length === 0) {
        const asText = htmlToText(normalized);
        const lines = asText.split('\n').filter((l) => l.trim() !== '');
        if (lines.length > 0) {
            const title = lines[0];
            const content = lines.slice(1).join('\n');
            results.push({ title, content });
        }
    }
    return results;
};
// 新增：解析并发内容（容错）
const getParsedContent = (content) => {
    if (!content)
        return '';
    const str = String(content).trim();
    // 1) 尝试直接 JSON
    try {
        return JSON.parse(str);
    }
    catch { }
    // 2) 提取包裹的 JSON（如 “xxx { ... } yyy”）
    const start = str.indexOf('{');
    const end = str.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        const jsonPart = str.slice(start, end + 1);
        try {
            return JSON.parse(jsonPart);
        }
        catch { }
    }
    // 3) 提取 “data=” 后的 JSON
    const eqIdx = str.indexOf('data=');
    if (eqIdx !== -1) {
        const maybe = str.slice(eqIdx + 5).trim();
        try {
            return JSON.parse(maybe);
        }
        catch { }
    }
    // 4) 解析包含加粗标题的 HTML 为数组（用于 wlgd / xgft 等）
    if (/<div[^>]*style="[^"]*font-weight:\s*bold/i.test(str)) {
        const sections = parseHtmlSections(str);
        if (sections.length > 0)
            return sections;
    }
    // 5) 返回原始字符串（模板中以 v-html 或纯文本展示）
    return str;
};
// 新增：切换折叠卡片
const toggleConcurrentCard = (message, key) => {
    if (isConcurrentButtonDisabled(message, key)) {
        showNoDataTip.value = true;
        setTimeout(() => (showNoDataTip.value = false), 2000);
        return;
    }
    message.selectedConcurrentResult = message.selectedConcurrentResult === key ? '' : key;
};
const newDialogue = () => {
    messages.value = [];
    delete globalState.legalResearchSmartAnswer.aiResults;
    delete globalState.legalResearchSmartAnswer.generalAiTime;
    updateTitle('法研智答');
};
const getConcurrentLabelByKey = (key) => {
    const label = concurrentLabels.value.find((item) => item.key === key);
    return label ? label.label : key;
};
const getConcurrentContentByKey = (results, key) => {
    if (!results)
        return '';
    const result = results.find((item) => item.key === key);
    return result ? result.content : '';
};
const groupCasesByDate = (list) => {
    if (!Array.isArray(list))
        return [];
    const groups = {};
    const order = [];
    for (const item of list) {
        const raw = String(item?.judgedate || '').trim();
        // 规范到 yyyy-mm-dd（若为空则归类到 '未知日期'）
        const key = raw ? raw.slice(0, 10) : '未知日期';
        if (!groups[key]) {
            groups[key] = [];
            order.push(key);
        }
        groups[key].push(item);
    }
    return order.map((date) => ({ date, cases: groups[date] }));
};
// 新增：统一的无数据判断（结合 aiLoading / error / 内容结构）
const isSectionNoData = (result) => {
    if (!result)
        return true;
    if (result.error)
        return false;
    if (result.aiLoading || result.isLoading)
        return false;
    // 针对 xsal 为 JSON 数组字符串的情况
    if (result.key === 'xsal') {
        try {
            const arr = JSON.parse(result.content);
            return !Array.isArray(arr) || arr.length === 0;
        }
        catch {
            return !result.content || result.content.trim() === '';
        }
    }
    // 其他栏目：内容为空或仅空白
    return !result.content || result.content.trim() === '';
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "w-full min-h-full pb-[68px] bg-gray-50 box-border" },
});
/** @type {[typeof SendMessages, typeof SendMessages, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SendMessages, new SendMessages({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.ConsultationOnLegalIssues.title),
    placeholder: (__VLS_ctx.ConsultationOnLegalIssues.placeholder),
    note: (__VLS_ctx.ConsultationOnLegalIssues.note),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.ConsultationOnLegalIssues.title),
    placeholder: (__VLS_ctx.ConsultationOnLegalIssues.placeholder),
    note: (__VLS_ctx.ConsultationOnLegalIssues.note),
}, ...__VLS_functionalComponentArgsRest(__VLS_0));
let __VLS_3;
let __VLS_4;
let __VLS_5;
const __VLS_6 = {
    onSendMessages: (__VLS_ctx.sendMessages)
};
const __VLS_7 = {
    onNewDialogue: (__VLS_ctx.newDialogue)
};
__VLS_2.slots.default;
{
    const { content: __VLS_thisSlot } = __VLS_2.slots;
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "box-border px-6 mb-6 w-full" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "font-medium text-gray-600" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "mt-1" },
    });
    for (const [example, index] of __VLS_getVForSourceType((__VLS_ctx.examples))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    __VLS_ctx.handleExampleClick(example);
                } },
            key: (index),
            ...{ class: "py-2 flex justify-between items-center text-red-600 bg-white border-0 border-b-[1px] border-gray-200 transition-colors duration-200 cursor-pointer hover:bg-gray-50" },
        });
        (example);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
            t: "1753862321982",
            ...{ class: "icon" },
            viewBox: "0 0 1024 1024",
            version: "1.1",
            xmlns: "http://www.w3.org/2000/svg",
            'p-id': "4390",
            width: "20",
            height: "20",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M593.066667 793.6a32.170667 32.170667 0 0 1 0-45.226667L829.44 512 593.066667 275.626667a32.170667 32.170667 0 0 1 0-45.226667c12.373333-12.373333 32.853333-12.373333 45.226666 0l258.986667 258.986667c12.373333 12.373333 12.373333 32.853333 0 45.226666l-258.986667 258.986667c-6.4 6.4-14.506667 9.386667-22.613333 9.386667s-16.213333-2.986667-22.613333-9.386667z",
            'p-id': "4391",
            fill: "#bfbfbf",
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
            d: "M149.333333 544c-17.493333 0-32-14.506667-32-32s14.506667-32 32-32h718.08c17.493333 0 32 14.506667 32 32s-14.506667 32-32 32H149.333333z",
            'p-id': "4392",
            fill: "#bfbfbf",
        });
    }
}
var __VLS_2;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "box-border px-2.5 mx-auto w-full bg-gray-50" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "pb-5 w-full" },
    ref: "chatContainer",
});
/** @type {typeof __VLS_ctx.chatContainer} */ ;
for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        key: (index),
        ...{ class: (['my-[15px] flex ', message.sender === 'user' ? 'justify-end' : 'justify-start']) },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "relative !w-full rounded-xl markdown_text" },
        ...{ class: ([
                message.sender === 'user'
                    ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                    : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
            ]) },
    });
    if (message.aiLoading) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "" },
        });
    }
    if (message.thinkingProcess) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mb-4 w-full thinking-process" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (message.thinkingProcess) }, null, null);
    }
    const __VLS_8 = {}.AiText;
    /** @type {[typeof __VLS_components.AiText, ]} */ ;
    // @ts-ignore
    const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
        popsMessage: (message),
    }));
    const __VLS_10 = __VLS_9({
        popsMessage: (message),
    }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    if (message.sender != 'user' && message.concurrentResults?.length) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mt-4" },
        });
        for (const [result, idx] of __VLS_getVForSourceType((message.concurrentResults))) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: (result.key),
                ...{ class: "mb-2 bg-white rounded-lg border border-gray-200 shadow-sm" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(message.sender != 'user' && message.concurrentResults?.length))
                            return;
                        __VLS_ctx.toggleConcurrentCard(message, result.key);
                    } },
                type: "button",
                ...{ class: "flex justify-between items-center px-3 py-2 w-full text左" },
                ...{ class: (__VLS_ctx.isConcurrentButtonDisabled(message, result.key)
                        ? 'cursor-not-allowed text-gray-400'
                        : 'cursor-pointer hover:bg-gray-50') },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (__VLS_ctx.getConcurrentLabelByKey(result.key) ||
                __VLS_ctx.concurrentLabels[idx]?.label ||
                result.name);
            if (result.aiLoading) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "flex items-center ml-2 text-xs text-gray-500" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "mr-1 loader_item" },
                });
            }
            else if (result.error) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "ml-2 text-xs text-red-600" },
                });
            }
            else if (__VLS_ctx.isSectionNoData(result)) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                    ...{ class: "ml-2 text-xs text-gray-400" },
                });
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "w-full min-h-full pb-[68px] bg-gray-50 box-border" },
            });
            /** @type {[typeof SendMessages, typeof SendMessages, ]} */ ;
            // @ts-ignore
            const __VLS_12 = __VLS_asFunctionalComponent(SendMessages, new SendMessages({
                ...{ 'onSendMessages': {} },
                ...{ 'onNewDialogue': {} },
                messagesLength: (__VLS_ctx.messages.length),
                userInput: (__VLS_ctx.userInput),
                title: (__VLS_ctx.ConsultationOnLegalIssues.title),
                placeholder: (__VLS_ctx.ConsultationOnLegalIssues.placeholder),
                note: (__VLS_ctx.ConsultationOnLegalIssues.note),
            }));
            const __VLS_13 = __VLS_12({
                ...{ 'onSendMessages': {} },
                ...{ 'onNewDialogue': {} },
                messagesLength: (__VLS_ctx.messages.length),
                userInput: (__VLS_ctx.userInput),
                title: (__VLS_ctx.ConsultationOnLegalIssues.title),
                placeholder: (__VLS_ctx.ConsultationOnLegalIssues.placeholder),
                note: (__VLS_ctx.ConsultationOnLegalIssues.note),
            }, ...__VLS_functionalComponentArgsRest(__VLS_12));
            let __VLS_15;
            let __VLS_16;
            let __VLS_17;
            const __VLS_18 = {
                onSendMessages: (__VLS_ctx.sendMessages)
            };
            const __VLS_19 = {
                onNewDialogue: (__VLS_ctx.newDialogue)
            };
            __VLS_14.slots.default;
            {
                const { content: __VLS_thisSlot } = __VLS_14.slots;
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "box-border px-6 mb-6 w-full" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "font-medium text-gray-600" },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "mt-1" },
                });
                for (const [example, index] of __VLS_getVForSourceType((__VLS_ctx.examples))) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ onClick: (...[$event]) => {
                                if (!(message.sender != 'user' && message.concurrentResults?.length))
                                    return;
                                __VLS_ctx.handleExampleClick(example);
                            } },
                        key: (index),
                        ...{ class: "py-2 flex justify之间 items-center text-red-600 bg-white border-0 border-b-[1px] border-gray-200 transition-colors duration-200 cursor-pointer hover:bg-gray-50" },
                    });
                    (example);
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                        t: "1753862321982",
                        ...{ class: "icon" },
                        viewBox: "0 0 1024 1024",
                        version: "1.1",
                        xmlns: "http://www.w3.org/2000/svg",
                        'p-id': "4390",
                        width: "20",
                        height: "20",
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
                        d: "M593.066667 793.6a32.170667 32.170667 0 0 1 0-45.226667L829.44 512 593.066667 275.626667a32.170667 32.170667 0 0 1 0-45.226667c12.373333-12.373333 32.853333-12.373333 45.226666 0l258.986667 258.986667c12.373333 12.373333 12.373333 32.853333 0 45.226666l-258.986667 258.986667c-6.4 6.4-14.506667 9.386667-22.613333 9.386667s-16.213333-2.986667-22.613333-9.386667z",
                        'p-id': "4391",
                        fill: "#bfbfbf",
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
                        d: "M149.333333 544c-17.493333 0-32-14.506667-32-32s14.506667-32 32-32h718.08c17.493333 0 32 14.506667 32 32s-14.506667 32-32 32H149.333333z",
                        'p-id': "4392",
                        fill: "#bfbfbf",
                    });
                }
            }
            var __VLS_14;
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "box-border px-2.5 mx-auto w-full bg-gray-50" },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "pb-5 w-full" },
                ref: "chatContainer",
            });
            /** @type {typeof __VLS_ctx.chatContainer} */ ;
            for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    key: (index),
                    ...{ class: ([
                            'my-[15px] flex ',
                            message.sender === 'user' ? 'justify-end' : 'justify-start',
                        ]) },
                });
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "relative !w-full rounded-xl markdown_text" },
                    ...{ class: ([
                            message.sender === 'user'
                                ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                                : 'bg白 text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
                        ]) },
                });
                if (message.aiLoading) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "" },
                    });
                }
                if (message.thinkingProcess) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mb-4 w-full thinking-process" },
                    });
                    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (message.thinkingProcess) }, null, null);
                }
                const __VLS_20 = {}.AiText;
                /** @type {[typeof __VLS_components.AiText, ]} */ ;
                // @ts-ignore
                const __VLS_21 = __VLS_asFunctionalComponent(__VLS_20, new __VLS_20({
                    popsMessage: (message),
                }));
                const __VLS_22 = __VLS_21({
                    popsMessage: (message),
                }, ...__VLS_functionalComponentArgsRest(__VLS_21));
                if (message.sender != 'user' && message.concurrentResults?.length) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "mt-4" },
                    });
                    for (const [result, idx] of __VLS_getVForSourceType((message.concurrentResults))) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            key: (result.key),
                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200 shadow-sm" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                            ...{ onClick: (...[$event]) => {
                                    if (!(message.sender != 'user' && message.concurrentResults?.length))
                                        return;
                                    if (!(message.sender != 'user' && message.concurrentResults?.length))
                                        return;
                                    __VLS_ctx.toggleConcurrentCard(message, result.key);
                                } },
                            type: "button",
                            ...{ class: "flex justify-between items-center px-3 py-2 w-full text-left" },
                            ...{ class: (__VLS_ctx.isConcurrentButtonDisabled(message, result.key)
                                    ? 'cursor-not-allowed text-gray-400'
                                    : 'cursor-pointer hover:bg-gray-50') },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                        (__VLS_ctx.getConcurrentLabelByKey(result.key) ||
                            __VLS_ctx.concurrentLabels[idx]?.label ||
                            result.name);
                        if (result.aiLoading) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "flex items-center ml-2 text-xs text-gray-500" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "mr-1 loader_item" },
                            });
                        }
                        else if (result.error) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "ml-2 text-xs text-red-600" },
                            });
                        }
                        else if (__VLS_ctx.isSectionNoData(result)) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "ml-2 text-xs text-gray-400" },
                            });
                        }
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                            ...{ class: "w-4 h-4 text-gray-500" },
                            viewBox: "0 0 20 20",
                            ...{ class: (message.selectedConcurrentResult === result.key
                                    ? 'transform rotate-180'
                                    : '') },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
                            d: "M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z",
                        });
                        const __VLS_24 = {}.transition;
                        /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
                        // @ts-ignore
                        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
                            name: "content-fade",
                        }));
                        const __VLS_26 = __VLS_25({
                            name: "content-fade",
                        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
                        __VLS_27.slots.default;
                        if (message.selectedConcurrentResult === result.key) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            if (result.aiLoading) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "flex items-center p-3 text-gray-600" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "mr-2 loader_item" },
                                });
                            }
                            else if (result.error) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "p-3 text-red-600" },
                                });
                                (result.error);
                            }
                            else if (__VLS_ctx.isSectionNoData(result)) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "p-3 text-gray-500" },
                                });
                            }
                            else {
                                if (result.key === 'xgft' &&
                                    Array.isArray(__VLS_ctx.getParsedContent(result.content)?.laws)) {
                                    for (const [law, lawIndex] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).laws))) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            key: (lawIndex),
                                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                            ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex-1" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-[15px] font-medium text-gray-800" },
                                        });
                                        (law.title);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex flex-wrap gap-2 mt-1" },
                                        });
                                        for (const [dir, dIdx] of __VLS_getVForSourceType((law.directory || []))) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                key: (dIdx),
                                                ...{ class: "px-2 py-0.5 text-xs text蓝-800 bg蓝-100 rounded-full" },
                                            });
                                            (dir);
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                            ...{ class: "ml-2 text-xs text-gray-500" },
                                        });
                                        (law.status);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "px-3 pb-3" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                        });
                                        (law.content);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2 text-xs text-gray-500" },
                                        });
                                        ((Number(law._score || 0) * 100).toFixed(1));
                                    }
                                }
                                else if (result.key === 'wlgd' &&
                                    Array.isArray(__VLS_ctx.getParsedContent(result.content)?.web)) {
                                    for (const [webItem, wIdx] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).web))) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            key: (wIdx),
                                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                            ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex-1" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-[15px] font-medium text-gray-800" },
                                        });
                                        (webItem.title || '网络观点');
                                        if (__VLS_ctx.globalState.environment === 'h5' &&
                                            webItem.url) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "mt-1 text-xs text-gray-600 break-all" },
                                            });
                                            (__VLS_ctx.cleanUrl(webItem.url));
                                        }
                                        if (webItem.score) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "ml-2 text-xs text-gray-500" },
                                            });
                                            ((Number(webItem.score || 0) * 100).toFixed(1));
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "px-3 pb-3" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                        });
                                        (webItem.content);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2" },
                                        });
                                        if (__VLS_ctx.globalState.environment === 'h5' &&
                                            webItem.url) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                                href: (__VLS_ctx.cleanUrl(webItem.url)),
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                ...{ class: "inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800" },
                                            });
                                        }
                                    }
                                }
                                else if (result.key === 'cpgdz' &&
                                    Array.isArray(__VLS_ctx.getParsedContent(result.content)?.expertview)) {
                                    for (const [viewItem, vIdx] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).expertview))) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            key: (vIdx),
                                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                            ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex-1" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-[15px] font-medium text-gray-800" },
                                        });
                                        (viewItem.title);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-1 text-xs text-gray-600" },
                                        });
                                        (viewItem.caseid);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                            ...{ class: "ml-2 text-xs text-gray-500" },
                                        });
                                        ((Number(viewItem._score || 0) * 100).toFixed(1));
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "px-3 pb-3" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                        });
                                        (viewItem.content);
                                    }
                                }
                                else if (result.key === 'xsal' &&
                                    Array.isArray(__VLS_ctx.getParsedContent(result.content))) {
                                    for (const [caseItem, index] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content)))) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            key: (index),
                                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                            ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex-1" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-[15px] font-medium text-gray-800" },
                                        });
                                        (caseItem.title);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "px-3 pb-3" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mb-4" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex flex-wrap gap-2 m2-1" },
                                        });
                                        if (caseItem.caseid) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-blue-800 bg-blue-100 rounded-full" },
                                            });
                                            (caseItem.caseid);
                                        }
                                        if (caseItem.court) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-green-800 bg-green-100 rounded-full" },
                                            });
                                            (caseItem.court);
                                        }
                                        if (caseItem.judgedate) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-purple-800 bg-purple-100 rounded-full" },
                                            });
                                            (caseItem.judgedate);
                                        }
                                        if (caseItem.procedure) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-pink-800 bg-pink-100 rounded-full" },
                                            });
                                            (caseItem.procedure);
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex flex-wrap gap-2" },
                                        });
                                        if (caseItem.typeofcase) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                            });
                                            (caseItem.typeofcase);
                                        }
                                        if (caseItem.causeofaction) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                            });
                                            (caseItem.causeofaction);
                                        }
                                        if (caseItem.level) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                            });
                                            (caseItem.level);
                                        }
                                        if (caseItem.abstract) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "mb-3" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                                ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "text-[15px] font-medium text-gray-800" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "px-3 pb-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                            });
                                            (caseItem.abstract);
                                        }
                                        if (caseItem.applicablelaw &&
                                            caseItem.applicablelaw.length > 0) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "mb-3" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                                ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "text-[15px] font-medium text-gray-800" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "px-3 pb-2 space-y-1" },
                                            });
                                            for (const [law, lawIndex] of __VLS_getVForSourceType((caseItem.applicablelaw))) {
                                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                    key: (lawIndex),
                                                    ...{ class: "p-2 pl-3 text-gray-600 bg蓝-50 rounded-r border-l-2 border蓝-200" },
                                                });
                                                (law);
                                            }
                                        }
                                        if (caseItem.applicablelawonly &&
                                            caseItem.applicablelawonly.length > 0) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "mb-3" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                                ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "text-[15px] font-medium text-gray-800" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "flex flex-wrap gap-2 px-3 pb-2" },
                                            });
                                            for (const [lawName, lawIndex] of __VLS_getVForSourceType((caseItem.applicablelawonly))) {
                                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                    key: (lawIndex),
                                                    ...{ class: "px-2 py-1 text-blue-800 bg-blue-100 rounded-full" },
                                                });
                                                (lawName);
                                            }
                                        }
                                        if (caseItem.highlight_list &&
                                            caseItem.highlight_list.length > 0) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "mb-3" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                                ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "text-[15px] font-medium text-gray-800" },
                                            });
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "px-3 pb-2 space-y-2" },
                                            });
                                            for (const [hl, hIdx] of __VLS_getVForSourceType((caseItem.highlight_list))) {
                                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                    key: (hIdx),
                                                    ...{ class: "leading-relaxed text-gray-700" },
                                                });
                                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                                __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (hl) }, null, null);
                                            }
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex justify-between items-center pt-3 border-t border-gray-100" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex flex-wrap gap-2 text-xs text-gray-500" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                        (caseItem.uniqid);
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                        (caseItem.database);
                                        if (caseItem.judgeyear) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                        }
                                        if (caseItem.judgeyear) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                            (caseItem.judgeyear);
                                        }
                                    }
                                }
                                else if (Array.isArray(__VLS_ctx.getParsedContent(result.content))) {
                                    for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content)))) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            key: (index),
                                            ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                            ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                        });
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "flex-1" },
                                        });
                                        if (item.title) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "text-[15px] font-medium text-gray-800" },
                                            });
                                            (item.title);
                                        }
                                        else {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "text-xs text-gray-600" },
                                            });
                                        }
                                        if (item._score) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                                ...{ class: "ml-2 text-xs text-gray-500" },
                                            });
                                            ((item._score * 100).toFixed(1));
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "px-3 pb-3" },
                                        });
                                        if (item.content) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                                ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                            });
                                            (item.content);
                                        }
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "mt-2" },
                                        });
                                        if (__VLS_ctx.globalState.environment === 'h5' && item.url) {
                                            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                                href: (__VLS_ctx.cleanUrl(item.url)),
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                ...{ class: "inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800" },
                                            });
                                        }
                                    }
                                }
                                else if (typeof __VLS_ctx.getParsedContent(result.content) === 'object' &&
                                    __VLS_ctx.getParsedContent(result.content) !== null) {
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "mb-2 bg-white rounded-lg border border-gray-200" },
                                    });
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                        ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                                    });
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "flex-1" },
                                    });
                                    if (__VLS_ctx.getParsedContent(result.content).title) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-[15px] font-medium text-gray-800" },
                                        });
                                        (__VLS_ctx.getParsedContent(result.content).title);
                                    }
                                    else {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "text-xs text-gray-600" },
                                        });
                                    }
                                    if (__VLS_ctx.getParsedContent(result.content)._score) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                            ...{ class: "ml-2 text-xs text-gray-500" },
                                        });
                                        ((__VLS_ctx.getParsedContent(result.content)._score * 100).toFixed(1));
                                    }
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "px-3 pb-3" },
                                    });
                                    if (__VLS_ctx.getParsedContent(result.content).content) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                            ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                        });
                                        (__VLS_ctx.getParsedContent(result.content).content);
                                    }
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "mt-2" },
                                    });
                                    if (__VLS_ctx.globalState.environment === 'h5' &&
                                        __VLS_ctx.getParsedContent(result.content).url) {
                                        __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                            href: (__VLS_ctx.cleanUrl(__VLS_ctx.getParsedContent(result.content).url)),
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            ...{ class: "inline-flex items-center mr-4 text蓝-600 underline break-all hover:text蓝-800" },
                                        });
                                    }
                                }
                                else {
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "p-3 bg白 rounded-lg border border-gray-200 shadow-sm" },
                                    });
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                    });
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                                    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getParsedContent(result.content)) }, null, null);
                                }
                            }
                        }
                        var __VLS_27;
                    }
                }
            }
            __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
                ...{ class: "w-4 h-4 text-gray-500" },
                viewBox: "0 0 20 20",
                ...{ class: (message.selectedConcurrentResult === result.key ? 'transform rotate-180' : '') },
            });
            __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
                d: "M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z",
            });
            const __VLS_28 = {}.transition;
            /** @type {[typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ]} */ ;
            // @ts-ignore
            const __VLS_29 = __VLS_asFunctionalComponent(__VLS_28, new __VLS_28({
                name: "content-fade",
            }));
            const __VLS_30 = __VLS_29({
                name: "content-fade",
            }, ...__VLS_functionalComponentArgsRest(__VLS_29));
            __VLS_31.slots.default;
            if (message.selectedConcurrentResult === result.key) {
                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                    ...{ class: "px-3 pb-3" },
                });
                if (result.aiLoading) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "flex items-center p-3 text-gray-600" },
                    });
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                        ...{ class: "mr-2 loader_item" },
                    });
                }
                else if (result.error) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "p-3 text-red-600" },
                    });
                    (result.error);
                }
                else if (__VLS_ctx.isSectionNoData(result)) {
                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                        ...{ class: "p-3 text-gray-500" },
                    });
                }
                else {
                    if (result.key === 'xgft' &&
                        Array.isArray(__VLS_ctx.getParsedContent(result.content)?.laws)) {
                        for (const [law, lawIndex] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).laws))) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                key: (lawIndex),
                                ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex-1" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-[15px] font-medium text-gray-800" },
                            });
                            (law.title);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex flex-wrap gap-2 mt-1" },
                            });
                            for (const [dir, dIdx] of __VLS_getVForSourceType((law.directory || []))) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    key: (dIdx),
                                    ...{ class: "px-2 py-0.5 text-xs text蓝-800 bg蓝-100 rounded-full" },
                                });
                                (dir);
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "ml-2 text-xs text-gray-500" },
                            });
                            (law.status);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                            });
                            (law.content);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2 text-xs text-gray-500" },
                            });
                            ((Number(law._score || 0) * 100).toFixed(1));
                        }
                    }
                    else if (result.key === 'wlgd' &&
                        Array.isArray(__VLS_ctx.getParsedContent(result.content)?.web)) {
                        for (const [webItem, wIdx] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).web))) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                key: (wIdx),
                                ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex-1" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-[15px] font-medium text-gray-800" },
                            });
                            (webItem.title || '网络观点');
                            if (__VLS_ctx.globalState.environment === 'h5' && webItem.url) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "mt-1 text-xs text-gray-600 break-all" },
                                });
                                (__VLS_ctx.cleanUrl(webItem.url));
                            }
                            if (webItem.score) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "ml-2 text-xs text-gray-500" },
                                });
                                ((Number(webItem.score || 0) * 100).toFixed(1));
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                            });
                            (webItem.content);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2" },
                            });
                            if (__VLS_ctx.globalState.environment === 'h5' && webItem.url) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                    href: (__VLS_ctx.cleanUrl(webItem.url)),
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...{ class: "inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800" },
                                });
                            }
                        }
                    }
                    else if (result.key === 'cpgdz' &&
                        Array.isArray(__VLS_ctx.getParsedContent(result.content)?.expertview)) {
                        for (const [viewItem, vIdx] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content).expertview))) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                key: (vIdx),
                                ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex-1" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-[15px] font-medium text-gray-800" },
                            });
                            (viewItem.title);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-1 text-xs text-gray-600" },
                            });
                            (viewItem.caseid);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "ml-2 text-xs text-gray-500" },
                            });
                            ((Number(viewItem._score || 0) * 100).toFixed(1));
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                            });
                            (viewItem.content);
                        }
                    }
                    else if (result.key === 'xsal' && Array.isArray(__VLS_ctx.getParsedContent(result.content))) {
                        for (const [caseItem, index] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content)))) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                key: (index),
                                ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                ...{ class: "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex-1" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-[15px] font-medium text-gray-800" },
                            });
                            (caseItem.title);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mb-4" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex flex-wrap gap-2 m2-1" },
                            });
                            if (caseItem.caseid) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-blue-800 bg-blue-100 rounded-full" },
                                });
                                (caseItem.caseid);
                            }
                            if (caseItem.court) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-green-800 bg-green-100 rounded-full" },
                                });
                                (caseItem.court);
                            }
                            if (caseItem.judgedate) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-purple-800 bg-purple-100 rounded-full" },
                                });
                                (caseItem.judgedate);
                            }
                            if (caseItem.procedure) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-pink-800 bg-pink-100 rounded-full" },
                                });
                                (caseItem.procedure);
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex flex-wrap gap-2" },
                            });
                            if (caseItem.typeofcase) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                });
                                (caseItem.typeofcase);
                            }
                            if (caseItem.causeofaction) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                });
                                (caseItem.causeofaction);
                            }
                            if (caseItem.level) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "px-2 py-1 text-gray-800 bg-gray-100 rounded-full" },
                                });
                                (caseItem.level);
                            }
                            if (caseItem.abstract) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "mb-3" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                    ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "text-[15px] font-medium text-gray-800" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "px-3 pb-2 leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                });
                                (caseItem.abstract);
                            }
                            if (caseItem.applicablelaw && caseItem.applicablelaw.length > 0) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "mb-3" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                    ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "text-[15px] font-medium text-gray-800" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "px-3 pb-2 space-y-1" },
                                });
                                for (const [law, lawIndex] of __VLS_getVForSourceType((caseItem.applicablelaw))) {
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        key: (lawIndex),
                                        ...{ class: "p-2 pl-3 text-gray-600 bg-blue-50 rounded-r border-l-2 border-blue-200" },
                                    });
                                    (law);
                                }
                            }
                            if (caseItem.applicablelawonly &&
                                caseItem.applicablelawonly.length > 0) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "mb-3" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                    ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "text-[15px] font-medium text-gray-800" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "flex flex-wrap gap-2 px-3 pb-2" },
                                });
                                for (const [lawName, lawIndex] of __VLS_getVForSourceType((caseItem.applicablelawonly))) {
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                        key: (lawIndex),
                                        ...{ class: "px-2 py-1 text-blue-800 bg-blue-100 rounded-full" },
                                    });
                                    (lawName);
                                }
                            }
                            if (caseItem.highlight_list && caseItem.highlight_list.length > 0) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "mb-3" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                    ...{ class: "px-3 py-2 rounded cursor-pointer hover:bg-gray-50" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "text-[15px] font-medium text-gray-800" },
                                });
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "px-3 pb-2 space-y-2" },
                                });
                                for (const [hl, hIdx] of __VLS_getVForSourceType((caseItem.highlight_list))) {
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                        key: (hIdx),
                                        ...{ class: "leading-relaxed text-gray-700" },
                                    });
                                    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                    __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (hl) }, null, null);
                                }
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex justify-between items-center pt-3 border-t border-gray-100" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex flex-wrap gap-2 text-xs text-gray-500" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                            (caseItem.uniqid);
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                            (caseItem.database);
                            if (caseItem.judgeyear) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                            }
                            if (caseItem.judgeyear) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
                                (caseItem.judgeyear);
                            }
                        }
                    }
                    else if (Array.isArray(__VLS_ctx.getParsedContent(result.content))) {
                        for (const [item, index] of __VLS_getVForSourceType((__VLS_ctx.getParsedContent(result.content)))) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                key: (index),
                                ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                                ...{ class: "flex justify之间 items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                            });
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "flex-1" },
                            });
                            if (item.title) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "text-[15px] font-medium text-gray-800" },
                                });
                                (item.title);
                            }
                            else {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "text-xs text-gray-600" },
                                });
                            }
                            if (item._score) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                    ...{ class: "ml-2 text-xs text-gray-500" },
                                });
                                ((item._score * 100).toFixed(1));
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "px-3 pb-3" },
                            });
                            if (item.content) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                    ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                                });
                                (item.content);
                            }
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "mt-2" },
                            });
                            if (__VLS_ctx.globalState.environment === 'h5' && item.url) {
                                __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                    href: (__VLS_ctx.cleanUrl(item.url)),
                                    target: "_blank",
                                    rel: "noopener noreferrer",
                                    ...{ class: "inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800" },
                                });
                            }
                        }
                    }
                    else if (typeof __VLS_ctx.getParsedContent(result.content) === 'object' &&
                        __VLS_ctx.getParsedContent(result.content) !== null) {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mb-2 bg白 rounded-lg border border-gray-200" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.details, __VLS_intrinsicElements.details)({});
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.summary, __VLS_intrinsicElements.summary)({
                            ...{ class: "flex justify之间 items-center px-3 py-2 cursor-pointer hover:bg-gray-50" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "flex-1" },
                        });
                        if (__VLS_ctx.getParsedContent(result.content).title) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-[15px] font-medium text-gray-800" },
                            });
                            (__VLS_ctx.getParsedContent(result.content).title);
                        }
                        else {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "text-xs text-gray-600" },
                            });
                        }
                        if (__VLS_ctx.getParsedContent(result.content)._score) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                                ...{ class: "ml-2 text-xs text-gray-500" },
                            });
                            ((__VLS_ctx.getParsedContent(result.content)._score * 100).toFixed(1));
                        }
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "px-3 pb-3" },
                        });
                        if (__VLS_ctx.getParsedContent(result.content).content) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                                ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                            });
                            (__VLS_ctx.getParsedContent(result.content).content);
                        }
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "mt-2" },
                        });
                        if (__VLS_ctx.globalState.environment === 'h5' &&
                            __VLS_ctx.getParsedContent(result.content).url) {
                            __VLS_asFunctionalElement(__VLS_intrinsicElements.a, __VLS_intrinsicElements.a)({
                                href: (__VLS_ctx.cleanUrl(__VLS_ctx.getParsedContent(result.content).url)),
                                target: "_blank",
                                rel: "noopener noreferrer",
                                ...{ class: "inline-flex items-center mr-4 text-blue-600 underline break-all hover:text-blue-800" },
                            });
                        }
                    }
                    else {
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "p-3 bg白 rounded-lg border border-gray-200 shadow-sm" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                            ...{ class: "leading-relaxed text-gray-700 whitespace-pre-wrap" },
                        });
                        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
                        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.getParsedContent(result.content)) }, null, null);
                    }
                }
            }
            var __VLS_31;
        }
    }
}
/** @type {__VLS_StyleScopedClasses['']} */ ;
/** @type {__VLS_StyleScopedClasses['']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-[68px]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-[1px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['my-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['!w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown_text']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-process']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text左']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['loader_item']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-[68px]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-6']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify之间']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['border-0']} */ ;
/** @type {__VLS_StyleScopedClasses['border-b-[1px]']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['my-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['!w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown_text']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-process']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['text-left']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-1']} */ ;
/** @type {__VLS_StyleScopedClasses['loader_item']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['loader_item']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text蓝-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg蓝-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['m2-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-pink-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-pink-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg蓝-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border蓝-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text蓝-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text蓝-800']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['w-4']} */ ;
/** @type {__VLS_StyleScopedClasses['h-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['loader_item']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-0.5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text蓝-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg蓝-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['m2-1']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-green-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-purple-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-purple-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-pink-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-pink-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2']} */ ;
/** @type {__VLS_StyleScopedClasses['pl-3']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-50']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-r']} */ ;
/** @type {__VLS_StyleScopedClasses['border-l-2']} */ ;
/** @type {__VLS_StyleScopedClasses['border-blue-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-2']} */ ;
/** @type {__VLS_StyleScopedClasses['py-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-100']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
/** @type {__VLS_StyleScopedClasses['border-t']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify之间']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-2']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify之间']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex-1']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['ml-2']} */ ;
/** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['px-3']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-3']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-2']} */ ;
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['underline']} */ ;
/** @type {__VLS_StyleScopedClasses['break-all']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-blue-800']} */ ;
/** @type {__VLS_StyleScopedClasses['p-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg白']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['leading-relaxed']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['whitespace-pre-wrap']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AiText: AiText,
            ConsultationOnLegalIssues: ConsultationOnLegalIssues,
            SendMessages: SendMessages,
            globalState: globalState,
            concurrentLabels: concurrentLabels,
            cleanUrl: cleanUrl,
            examples: examples,
            messages: messages,
            userInput: userInput,
            chatContainer: chatContainer,
            handleExampleClick: handleExampleClick,
            sendMessages: sendMessages,
            isConcurrentButtonDisabled: isConcurrentButtonDisabled,
            getParsedContent: getParsedContent,
            toggleConcurrentCard: toggleConcurrentCard,
            newDialogue: newDialogue,
            getConcurrentLabelByKey: getConcurrentLabelByKey,
            isSectionNoData: isSectionNoData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=legal.vue.js.map