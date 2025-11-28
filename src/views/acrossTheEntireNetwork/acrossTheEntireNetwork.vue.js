import { ref, defineComponent, nextTick, onMounted } from 'vue';
import { AiText } from 'juejin-puts';
import { status } from 'juejin-state';
import aiConfig, { AcrossTheEntireNetwork, CACHE_DURATION } from '@/config/aiConfig';
import Aiservis from '@/servers/searchTheWholeWebAiservis';
import { useTitle } from '@/composables/useTitle';
import SendMessages from '@/components/sendMessages/sendMessages.vue';
const state = status();
const globalState = state.state;
// 使用动态title功能
const { title, updateTitle } = useTitle('全网搜索问答');
defineComponent({
    name: 'AcrossTheEntireNetwork',
});
// 自动滚动控制
const autoScroll = ref(true);
const userScrolled = ref(false);
// 添加防抖处理思考过程的更新
const thinkingProcessDebounceMap = new Map();
const thinkingProcessTimers = new Map();
const debouncedThinkingProcess = (content, messageIndex) => {
    // 如果内容为空，直接返回
    if (!content)
        return '';
    // 清除之前的定时器
    const existingTimer = thinkingProcessTimers.get(messageIndex);
    if (existingTimer) {
        clearTimeout(existingTimer);
    }
    // 设置新的防抖定时器
    const timer = setTimeout(() => {
        thinkingProcessDebounceMap.set(messageIndex, content);
        thinkingProcessTimers.delete(messageIndex);
    }, 100); // 100ms 防抖延迟
    thinkingProcessTimers.set(messageIndex, timer);
    // 返回当前缓存的内容，如果没有则返回新内容
    return thinkingProcessDebounceMap.get(messageIndex) || content;
};
onMounted(() => {
    // 初始化 acrossTheEntireNetwork 对象（如果不存在）
    if (!globalState.acrossTheEntireNetwork) {
        globalState.acrossTheEntireNetwork = {};
    }
    // 页面渲染前判断缓存是否有效
    if (globalState.acrossTheEntireNetwork.aiResults &&
        globalState.acrossTheEntireNetwork.generalAiTime) {
        const currentTime = Date.now();
        const savedTime = globalState.acrossTheEntireNetwork.generalAiTime;
        const timeDifference = currentTime - savedTime;
        // 如果时间差小于常量（12小时），则使用缓存
        if (timeDifference < CACHE_DURATION) {
            messages.value = globalState.acrossTheEntireNetwork.aiResults;
            // 如果有缓存的对话，更新title显示对话数量
            if (messages.value.length > 0) {
                const userMessages = messages.value.filter((msg) => msg.sender === 'user');
                updateTitle(`全网搜索问答`);
            }
        }
        else {
            messages.value = [];
            delete globalState.acrossTheEntireNetwork.aiResults;
            delete globalState.acrossTheEntireNetwork.generalAiTime;
        }
    }
    if (globalState.acrossTheEntireNetwork.aiResults)
        messages.value = globalState.acrossTheEntireNetwork.aiResults;
    // 监听用户滚动事件
    window.addEventListener('scroll', handleUserScroll);
    window.addEventListener('touchmove', handleUserScroll);
});
// 处理用户滚动事件
const handleUserScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    // 如果用户不在底部，说明用户手动滚动了
    if (scrollTop + windowHeight < documentHeight - 50) {
        userScrolled.value = true;
        autoScroll.value = false;
    }
};
// 开启新对话
const newDialogue = () => {
    messages.value = [];
    if (globalState.acrossTheEntireNetwork) {
        delete globalState.acrossTheEntireNetwork.aiResults;
        delete globalState.acrossTheEntireNetwork.generalAiTime;
    }
    // 重置title为默认值
    updateTitle('全网搜索问答');
};
// 从URL参数获取apiKey的函数
const getApiKeyFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('apiKey') || aiConfig.apiKey;
};
console.log(AcrossTheEntireNetwork);
// 创建Aiservis实例时传入配置
const aiConfigs = {
    api: AcrossTheEntireNetwork.api,
    apiKey: getApiKeyFromUrl(),
    model: AcrossTheEntireNetwork.model,
    isTimer: true,
};
const aiservis = new Aiservis(aiConfigs);
// 预设问题示例
// const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求'])
// 聊天消息
const messages = ref([]);
const userInput = ref('');
const chatContainer = ref(null);
// 发送消息
const sendMessages = async () => {
    const message = userInput.value;
    if (message === '')
        return;
    // 重新开启自动滚动
    autoScroll.value = true;
    userScrolled.value = false;
    // 添加用户消息
    addMessage(message, 'user');
    // 更新title显示对话数量
    updateTitle(`全网搜索问答`);
    const newMessage = {
        role: 'user',
        content: message,
    };
    // 添加助手消息
    const assistantMessage = {
        content: '',
        sender: 'assistant',
        isLoading: true,
        aiLoading: true,
    };
    messages.value.push(assistantMessage);
    // 启动主要AI服务
    const lastMessage = messages.value[messages.value.length - 1];
    // await aiservis.sendToAIMock('测试消息', setMessage, lastMessage)
    // 启动主要AI服务
    aiservis.sendToAI(newMessage, setMessage, lastMessage);
    userInput.value = '';
};
const setMessage = (message, isDone, isThinking, isError = false) => {
    const lastMessage = messages.value[messages.value.length - 1];
    // 确保最后一条消息存在且是助手消息
    if (!lastMessage || lastMessage.sender != 'assistant') {
        return;
    }
    if (isDone) {
        if (isError) {
            // 改进错误处理，避免显示技术性错误信息
            const userFriendlyMessage = message.includes('404')
                ? '抱歉，服务暂时不可用，请稍后重试。'
                : message;
            lastMessage.content = `${lastMessage.content}${userFriendlyMessage}`;
        }
        lastMessage.aiLoading = false;
        lastMessage.isLoading = false;
        // 确保 acrossTheEntireNetwork 对象存在
        if (!globalState.acrossTheEntireNetwork) {
            globalState.acrossTheEntireNetwork = {};
        }
        globalState.acrossTheEntireNetwork.aiResults = messages.value;
        globalState.acrossTheEntireNetwork.generalAiTime = Date.now();
        // 完成后强制更新一次，确保最终状态正确
        nextTick(() => {
            if (autoScroll.value && !userScrolled.value) {
                scrollToBottom();
            }
        });
        return;
    }
    // 批量更新，减少响应式触发次数
    if (isThinking) {
        // 使用 Object.assign 进行批量更新，减少响应式触发
        Object.assign(lastMessage, {
            thinkingProcess: `${lastMessage.thinkingProcess || ''}${message}`,
        });
    }
    else {
        // 批量更新正常内容和AI思考状态
        Object.assign(lastMessage, {
            aiLoading: false,
            content: `${lastMessage.content}${message}`,
        });
    }
    // 使用 requestAnimationFrame 优化滚动性能
    if (autoScroll.value && !userScrolled.value) {
        requestAnimationFrame(() => {
            scrollToBottom();
        });
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
    // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
    if (autoScroll.value && !userScrolled.value) {
        scrollToBottom();
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "w-full min-h-full pb-[68px] box-border bg-gray-50" },
});
/** @type {[typeof SendMessages, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SendMessages, new SendMessages({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    ...{ class: "w-full h-full" },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.AcrossTheEntireNetwork.title),
    placeholder: (__VLS_ctx.AcrossTheEntireNetwork.placeholder),
    note: (__VLS_ctx.AcrossTheEntireNetwork.note),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    ...{ class: "w-full h-full" },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.AcrossTheEntireNetwork.title),
    placeholder: (__VLS_ctx.AcrossTheEntireNetwork.placeholder),
    note: (__VLS_ctx.AcrossTheEntireNetwork.note),
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
var __VLS_2;
if (__VLS_ctx.messages.length > 0) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "max-w-[600px] mx-auto p-2.5" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "pb-5" },
        ref: "chatContainer",
    });
    /** @type {typeof __VLS_ctx.chatContainer} */ ;
    for (const [message, index] of __VLS_getVForSourceType((__VLS_ctx.messages))) {
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            key: (index),
            ...{ class: (['my-[15px] flex', message.sender === 'user' ? 'justify-end' : 'justify-start']) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "relative rounded-xl w-full !overflow-x-hidden markdown_text" },
            ...{ class: ([
                    message.sender === 'user'
                        ? 'bg-[#e23338] !text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px]  markdownUser'
                        : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px]',
                ]) },
        });
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (message.aiLoading) }, null, null);
        __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: "mb-4 thinking-process" },
        });
        __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (message.thinkingProcess && !message.aiLoading) }, null, null);
        __VLS_asFunctionalDirective(__VLS_directives.vHtml)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.debouncedThinkingProcess(message.thinkingProcess, index)) }, null, null);
        const __VLS_8 = {}.AiText;
        /** @type {[typeof __VLS_components.AiText, ]} */ ;
        // @ts-ignore
        const __VLS_9 = __VLS_asFunctionalComponent(__VLS_8, new __VLS_8({
            popsMessage: (message),
        }));
        const __VLS_10 = __VLS_9({
            popsMessage: (message),
        }, ...__VLS_functionalComponentArgsRest(__VLS_9));
    }
}
/** @type {__VLS_StyleScopedClasses['']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-[68px]']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[600px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['my-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['!overflow-x-hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown_text']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-process']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AiText: AiText,
            AcrossTheEntireNetwork: AcrossTheEntireNetwork,
            SendMessages: SendMessages,
            debouncedThinkingProcess: debouncedThinkingProcess,
            newDialogue: newDialogue,
            messages: messages,
            userInput: userInput,
            chatContainer: chatContainer,
            sendMessages: sendMessages,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=acrossTheEntireNetwork.vue.js.map