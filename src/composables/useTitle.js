import { ref, watch, onMounted, onUnmounted } from 'vue';
/**
 * 用于动态更新页面title的composable函数
 * @param initialTitle 初始title
 * @returns 包含title响应式引用和更新函数的对象
 */
export function useTitle(initialTitle) {
    const title = ref(initialTitle || document.title);
    // 更新页面title的函数
    const updateTitle = (newTitle) => {
        title.value = newTitle;
        document.title = newTitle;
    };
    // 监听title变化并更新document.title
    const stopWatcher = watch(title, (newTitle) => {
        document.title = newTitle;
    }, { immediate: true });
    // 组件挂载时设置title
    onMounted(() => {
        if (title.value) {
            document.title = title.value;
        }
    });
    // 组件卸载时清理watcher
    onUnmounted(() => {
        stopWatcher();
    });
    return {
        title,
        updateTitle
    };
}
/**
 * 设置页面title的简单函数
 * @param newTitle 新的title
 */
export function setTitle(newTitle) {
    document.title = newTitle;
}
//# sourceMappingURL=useTitle.js.map