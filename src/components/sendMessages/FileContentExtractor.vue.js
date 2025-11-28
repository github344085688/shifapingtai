import { ref } from 'vue';
const props = withDefaults(defineProps(), {
    modelValue: '',
});
const emit = defineEmits();
// 响应式数据
const fileInput = ref();
const isLoading = ref(false);
const errorMessage = ref('');
// 清除文件数据的方法
const clearFileData = () => {
    // 清除文件输入
    if (fileInput.value) {
        fileInput.value.value = '';
    }
    // 清除所有状态
    isLoading.value = false;
    errorMessage.value = '';
    // 清除v-model值
    emit('update:modelValue', '');
};
// 暴露清除方法给父组件
const __VLS_exposed = {
    clearFileData,
};
defineExpose(__VLS_exposed);
// 触发文件选择
const triggerFileInput = () => {
    fileInput.value?.click();
};
// 显示错误信息
const showError = (message) => {
    errorMessage.value = message;
};
// 清除错误信息
const clearError = () => {
    errorMessage.value = '';
};
// 读取文本文件
const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            resolve(content);
        };
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        reader.readAsText(file, 'UTF-8');
    });
};
// 读取DOCX文件
const readDocxFile = async (file) => {
    try {
        // 动态导入mammoth库
        const mammoth = await import('mammoth');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target?.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    resolve(result.value);
                }
                catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            reader.readAsArrayBuffer(file);
        });
    }
    catch (error) {
        throw new Error('无法加载文档处理库，请确保已安装mammoth依赖');
    }
};
// 处理文件选择
const handleFileSelect = async (event) => {
    const target = event.target;
    const file = target.files?.[0];
    if (!file)
        return;
    // 检查文件类型
    const allowedTypes = ['.txt', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
        showError('仅支持.txt和.docx文件格式');
        // 清空文件输入
        if (target)
            target.value = '';
        return;
    }
    // 检查文件大小（1MB = 1024 * 1024 bytes）
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
        showError('文件大小不能超过1MB');
        // 清空文件输入
        if (target)
            target.value = '';
        return;
    }
    isLoading.value = true;
    try {
        let content = '';
        if (fileExtension === '.txt') {
            content = await readTextFile(file);
        }
        else if (fileExtension === '.docx') {
            content = await readDocxFile(file);
        }
        // 更新v-model值
        emit('update:modelValue', content);
        // 触发文件内容提取事件
        emit('file-content-extracted', content, file.name);
    }
    catch (error) {
        console.error('文件读取失败:', error);
        showError('文件读取失败，请检查文件是否损坏或格式是否正确');
    }
    finally {
        isLoading.value = false;
        // 清空文件输入，允许重复选择同一文件
        if (target)
            target.value = '';
    }
};
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_withDefaultsArg = (function (t) { return t; })({
    modelValue: '',
});
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
// CSS variable injection 
// CSS variable injection end 
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "file-content-extractor" },
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
    ...{ onClick: (__VLS_ctx.triggerFileInput) },
    ...{ class: "flex items-center justify-center w-[20px] h-[20px] text-gray-600 hover:text-[#e23338] transition-colors" },
    title: "选择文件提取内容",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
    t: "1753778539566",
    ...{ class: "icon" },
    viewBox: "0 0 1024 1024",
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    'p-id': "6005",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    d: "M979.2 377.6h-704c-38.4 0-60.8 19.2-76.8 57.6-51.2 137.6-102.4 275.2-156.8 412.8-19.2 48-6.4 73.6 38.4 73.6h697.6c38.4 0 64-19.2 80-60.8 51.2-137.6 105.6-275.2 156.8-409.6 19.2-48 6.4-73.6-35.2-73.6z",
    fill: "#bfbfbf",
    'p-id': "6006",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
    d: "M275.2 339.2c166.4 3.2 336 0 502.4 0h35.2c16-105.6-6.4-128-80-124.8-124.8 3.2-252.8 0-380.8 0-22.4 0-32-3.2-32-35.2 0-51.2-19.2-70.4-60.8-70.4H60.8C16 108.8 0 128 0 185.6v633.6h6.4c6.4-12.8 9.6-25.6 16-35.2 44.8-118.4 92.8-236.8 137.6-355.2 22.4-60.8 57.6-89.6 115.2-89.6z",
    fill: "#bfbfbf",
    'p-id': "6007",
});
__VLS_asFunctionalElement(__VLS_intrinsicElements.input)({
    ...{ onChange: (__VLS_ctx.handleFileSelect) },
    ref: "fileInput",
    type: "file",
    accept: ".txt,.docx",
    ...{ class: "hidden" },
});
/** @type {typeof __VLS_ctx.fileInput} */ ;
if (__VLS_ctx.isLoading) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex items-center p-6 space-x-3 bg-white rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "animate-spin h-5 w-5 text-[#e23338]" },
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.circle, __VLS_intrinsicElements.circle)({
        ...{ class: "opacity-25" },
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        'stroke-width': "4",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
        ...{ class: "opacity-75" },
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ class: "text-gray-700" },
    });
}
if (__VLS_ctx.errorMessage) {
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.clearError) },
        ...{ class: "flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "p-6 mx-4 max-w-md bg-white rounded-lg" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: "flex items-center mb-4" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.svg, __VLS_intrinsicElements.svg)({
        ...{ class: "mr-2 w-6 h-6 text-red-500" },
        fill: "currentColor",
        viewBox: "0 0 20 20",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.path, __VLS_intrinsicElements.path)({
        'fill-rule': "evenodd",
        d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
        'clip-rule': "evenodd",
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.h3, __VLS_intrinsicElements.h3)({
        ...{ class: "text-lg font-medium text-gray-900" },
    });
    __VLS_asFunctionalElement(__VLS_intrinsicElements.p, __VLS_intrinsicElements.p)({
        ...{ class: "mb-4 text-gray-600" },
    });
    (__VLS_ctx.errorMessage);
    __VLS_asFunctionalElement(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.clearError) },
        ...{ class: "w-full bg-[#e23338] text-white py-2 px-4 rounded-lg hover:bg-[#d12329] transition-colors" },
    });
}
/** @type {__VLS_StyleScopedClasses['file-content-extractor']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['w-[20px]']} */ ;
/** @type {__VLS_StyleScopedClasses['h-[20px]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:text-[#e23338]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['icon']} */ ;
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-3']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['animate-spin']} */ ;
/** @type {__VLS_StyleScopedClasses['h-5']} */ ;
/** @type {__VLS_StyleScopedClasses['w-5']} */ ;
/** @type {__VLS_StyleScopedClasses['text-[#e23338]']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-25']} */ ;
/** @type {__VLS_StyleScopedClasses['opacity-75']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
/** @type {__VLS_StyleScopedClasses['z-50']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-black']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-opacity-50']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-4']} */ ;
/** @type {__VLS_StyleScopedClasses['max-w-md']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['mr-2']} */ ;
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
/** @type {__VLS_StyleScopedClasses['text-red-500']} */ ;
/** @type {__VLS_StyleScopedClasses['text-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-[#e23338]']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-[#d12329]']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            fileInput: fileInput,
            isLoading: isLoading,
            errorMessage: errorMessage,
            triggerFileInput: triggerFileInput,
            clearError: clearError,
            handleFileSelect: handleFileSelect,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            ...__VLS_exposed,
        };
    },
    __typeEmits: {},
    __typeProps: {},
    props: {},
});
; /* PartiallyEnd: #4569/main.vue */
//# sourceMappingURL=FileContentExtractor.vue.js.map