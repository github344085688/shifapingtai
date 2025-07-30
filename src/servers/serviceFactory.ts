// 服务工厂，根据环境条件创建相应的服务
export async function createAIService(aiConfig: any) {
  // 在开发环境中使用 Mock 服务
  if (import.meta.env.DEV) {
    const { default: MockAIService } = await import('./moni');
    return new MockAIService(aiConfig);
  }
  
  // 在生产环境中返回 null 或真实的 AI 服务
  return null;
}

export function shouldUseMock(): boolean {
  return import.meta.env.DEV;
}