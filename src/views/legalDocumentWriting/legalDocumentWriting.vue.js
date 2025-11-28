import { ref, defineComponent, nextTick, onMounted } from 'vue';
import { AiText } from 'juejin-puts';
import { status } from 'juejin-state';
import aiConfig, { legalDocumentWriting, CACHE_DURATION } from '@/config/aiConfig';
import AIService from '@/servers/aiservis';
import { useTitle } from '@/composables/useTitle';
import SendMessages from '@/components/sendMessages/sendMessages.vue';
const state = status();
const globalState = state.state;
// 使用动态title功能
const { title, updateTitle } = useTitle('法律文书写作');
defineComponent({
    name: 'legalDocumentWriting',
});
// 自动滚动控制
const autoScroll = ref(true);
const userScrolled = ref(false);
onMounted(() => {
    // 初始化 acrossTheEntireNetwork 对象（如果不存在）
    if (!globalState.legalDocumentWriting) {
        globalState.legalDocumentWriting = {};
    }
    // 页面渲染前判断缓存是否有效
    if (globalState.legalDocumentWriting.aiResults &&
        globalState.legalDocumentWriting.generalAiTime) {
        const currentTime = Date.now();
        const savedTime = globalState.legalDocumentWriting.generalAiTime;
        const timeDifference = currentTime - savedTime;
        // 如果时间差小于常量（12小时），则使用缓存
        if (timeDifference < CACHE_DURATION) {
            messages.value = globalState.legalDocumentWriting.aiResults;
            // 如果有缓存的对话，更新title显示对话数量
            if (messages.value.length > 0) {
                const userMessages = messages.value.filter((msg) => msg.sender === 'user');
                updateTitle(`法律文书写作`);
            }
        }
        else {
            messages.value = [];
            delete globalState.legalDocumentWriting.aiResults;
            delete globalState.legalDocumentWriting.generalAiTime;
        }
    }
    if (globalState.legalDocumentWriting.aiResults)
        messages.value = globalState.legalDocumentWriting.aiResults;
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
    if (globalState.legalDocumentWriting) {
        delete globalState.legalDocumentWriting.aiResults;
        delete globalState.legalDocumentWriting.generalAiTime;
    }
    // 重置title为默认值
    updateTitle('法律文书写作');
};
// 从URL参数获取apiKey的函数
const getApiKeyFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('apiKey') || aiConfig.apiKey;
};
// console.log(legalDocumentWriting)
// 创建AIService实例时传入配置
const aiConfigs = {
    api: legalDocumentWriting.api,
    apiKey: getApiKeyFromUrl(),
    model: legalDocumentWriting.model,
    isTimer: true,
    // useMock: true,
};
const aiService = new AIService(aiConfigs);
// 预设问题示例
// const examples = ref(['离婚纠纷诉讼请求', '民间借贷纠纷诉讼请求', '劳动争议诉讼请求'])
// 聊天消息
const messages = ref([]);
const userInput = ref('');
const chatContainer = ref(null);
// 处理示例问题点击
const handleExampleClick = (question) => {
    userInput.value = question;
    sendMessages();
};
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
    updateTitle(`法律文书写作`);
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
    // await aiService.sendToAIMock('测试消息', setMessage)
    // 启动主要AI服务
    aiService.sendToAI(newMessage, setMessage);
    userInput.value = '';
};
const setMessage = (message, isDone, isThinking, isError = false) => {
    const lastMessage = messages.value[messages.value.length - 1];
    // 确保最后一条消息存在且是助手消息
    if (!lastMessage || lastMessage.sender != 'assistant') {
        return;
    }
    // console.log('setMessage', messages.value, isDone, isThinking, lastMessage)
    if (isDone) {
        if (isError) {
            lastMessage.content = `${lastMessage.content}${message}`;
        }
        lastMessage.aiLoading = false;
        lastMessage.isLoading = false;
        // 确保 acrossTheEntireNetwork 对象存在
        if (!globalState.legalDocumentWriting) {
            globalState.legalDocumentWriting = {};
        }
        globalState.legalDocumentWriting.aiResults = messages.value;
        globalState.legalDocumentWriting.generalAiTime = Date.now();
        return;
    }
    // 根据isThinking参数决定更新思考过程还是正常内容
    if (isThinking) {
        // 更新思考过程
        lastMessage.thinkingProcess = `${lastMessage.thinkingProcess || ''}${message}`;
    }
    else {
        // 更新正常内容和AI思考状态
        lastMessage.aiLoading = false; // 当开始输出正常内容时，思考状态结束
        lastMessage.content = `${lastMessage.content}${message}`;
    }
    // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
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
    // 只有在自动滚动开启且用户没有手动滚动时才自动滚动
    if (autoScroll.value && !userScrolled.value) {
        scrollToBottom();
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "w-full min-h-full pb-[68px] bg-gray-50" },
});
/** @type {[typeof SendMessages, ]} */ ;
// @ts-ignore
const __VLS_0 = __VLS_asFunctionalComponent(SendMessages, new SendMessages({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.legalDocumentWriting.title),
    placeholder: (__VLS_ctx.legalDocumentWriting.placeholder),
    note: (__VLS_ctx.legalDocumentWriting.note),
}));
const __VLS_1 = __VLS_0({
    ...{ 'onSendMessages': {} },
    ...{ 'onNewDialogue': {} },
    messagesLength: (__VLS_ctx.messages.length),
    userInput: (__VLS_ctx.userInput),
    title: (__VLS_ctx.legalDocumentWriting.title),
    placeholder: (__VLS_ctx.legalDocumentWriting.placeholder),
    note: (__VLS_ctx.legalDocumentWriting.note),
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
            ...{ class: "relative rounded-xl markdown_text" },
            ...{ class: ([
                    message.sender === 'user'
                        ? 'bg-[#e23338] text-[#ffffff] rounded-tr-[4px] max-w-[80%]  px-[15px] markdownUser'
                        : 'bg-white text-[#333] rounded-tl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] max-w-[100%]  p-[15px_15px] w-full box-border',
                ]) },
        });
        if (message.aiLoading) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "w-full" },
            });
        }
        if (message.thinkingProcess) {
            __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: "box-border mb-4 w-full thinking-process" },
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
    }
}
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-full']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-[68px]']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-[600px]']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['p-2.5']} */ ;
/** @type {__VLS_StyleScopedClasses['pb-5']} */ ;
/** @type {__VLS_StyleScopedClasses['my-[15px]']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['markdown_text']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['box-border']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['thinking-process']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            AiText: AiText,
            legalDocumentWriting: legalDocumentWriting,
            SendMessages: SendMessages,
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
//# sourceMappingURL=legalDocumentWriting.vue.js.map