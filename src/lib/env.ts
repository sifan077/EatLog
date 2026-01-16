/**
 * 环境变量验证和类型定义
 */

// 验证必需的环境变量
export function validateEnvVars(): void {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY'];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);

    // 在生产环境中抛出错误，在开发环境中给出警告
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    }
  }
}

// 安全的环境变量获取函数
export function getEnvVar(name: string, required: boolean = true): string | undefined {
  const value = process.env[name];

  if (!value && required) {
    const errorMessage = `Environment variable ${name} is required but not set`;
    console.error(errorMessage);

    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMessage);
    }
  }

  return value;
}

// Supabase 配置类型
export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// 获取 Supabase 配置
export function getSupabaseConfig(): SupabaseConfig {
  validateEnvVars();

  return {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL', true)!,
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY', true)!,
  };
}
