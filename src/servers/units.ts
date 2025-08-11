/**
 * 从 URL 参数中获取并处理 API Key
 * @param paramName URL 参数名称，默认为 'modelKey'
 * @returns 处理后的 API Key
 */
export function getApiKeyFromUrl(paramName: string = 'modelKey'): string {
  // 获取当前页面的 URL 参数，支持 hash 路由
  let urlParams: URLSearchParams

  // 检查是否是 hash 路由
  if (window.location.hash && window.location.hash.includes('?')) {
    // 从 hash 中提取查询参数
    const hashParts = window.location.hash.split('?')
    if (hashParts.length > 1) {
      urlParams = new URLSearchParams(hashParts[1])
    } else {
      urlParams = new URLSearchParams()
    }
  } else {
    // 使用传统的查询参数
    urlParams = new URLSearchParams(window.location.search)
  }

  let modelKey = urlParams.get(paramName)

  // 如果没有找到指定参数，尝试查找 'apiKey' 参数作为备选
  if (!modelKey && paramName !== 'apiKey') {
    modelKey = urlParams.get('apiKey')
  }

  if (!modelKey) {
    console.warn(`URL 参数 ${paramName} 未找到`)
    return ''
  }

  // 在第五位（索引4）去掉 "0034"
  if (modelKey.length > 4 && modelKey.substring(4, 8) === '0034') {
    const processedKey = modelKey.substring(0, 4) + modelKey.substring(8)
    console.log('API Key 已处理，移除了位置4的"0034"')
    return processedKey
  }

  // 如果没有找到 "0034" 在指定位置，返回原始值
  console.log('API Key 无需处理，返回原始值')
  return modelKey
}

/**
 * 获取处理后的 Authorization header 值
 * @param paramName URL 参数名称，默认为 'modelKey'
 * @returns Bearer token 字符串
 */
export function getAuthorizationHeader(paramName: string = 'modelKey'): string {
  const apiKey = getApiKeyFromUrl(paramName)
  return `Bearer ${apiKey}`
}
