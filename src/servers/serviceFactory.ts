// 服务工厂，根据环境条件创建相应的服务
export async function createAIService(aiConfig: any) {
  // 只在开发环境中使用 Mock 服务
  if (import.meta.env.DEV && !import.meta.env.PROD) {
    try {
      // 动态导入，仅在开发环境中执行
      const module = await import('./moni');
      const MockAIService = module.default;
      return new MockAIService(aiConfig);
    } catch (error) {
      console.warn('Mock service not available in production build:', error);
      return null;
    }
  }
  
  // 在生产环境中返回 null，不使用 Mock 服务
  return null;
}

export function shouldUseMock(): boolean {
  // 只在开发环境中启用 Mock
  return import.meta.env.DEV && !import.meta.env.PROD;
}

// 添加生产环境检查函数
export function isProductionBuild(): boolean {
  return import.meta.env.PROD || false;
}