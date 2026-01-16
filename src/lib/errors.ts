/**
 * 安全的错误处理系统
 * 防止错误信息泄露敏感数据
 */

// 错误类型定义
export class AppError extends Error {
  constructor(
    message: string,
    public userMessage: string,
    public type: 'validation' | 'auth' | 'database' | 'network' | 'unknown' = 'unknown'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 验证错误
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, message, 'validation');
    this.name = 'ValidationError';
  }
}

// 认证错误
export class AuthError extends AppError {
  constructor(message: string) {
    super(message, '请重新登录', 'auth');
    this.name = 'AuthError';
  }
}

// 数据库错误
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, '操作失败，请稍后重试', 'database');
    this.name = 'DatabaseError';
  }
}

// 网络错误
export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, '网络连接失败，请检查网络设置', 'network');
    this.name = 'NetworkError';
  }
}

// 安全地处理 Supabase 错误
export function handleSupabaseError(error: unknown): never {
  console.error('Supabase Error:', error);

  // 认证相关错误
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    (error.message.includes('JWT') || error.message.includes('token'))
  ) {
    throw new AuthError('认证失败，请重新登录');
  }

  // 权限相关错误
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'PGRST301') {
    throw new AuthError('权限不足，请检查登录状态');
  }

  // 数据库连接错误
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code.startsWith('53')
  ) {
    throw new NetworkError('数据库连接失败');
  }

  // 数据验证错误
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code.startsWith('23')
  ) {
    throw new ValidationError('数据格式不正确');
  }

  // 网络错误
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'TypeError'
  ) {
    throw new NetworkError('网络请求失败');
  }

  // 默认错误
  throw new DatabaseError('操作失败，请稍后重试');
}

// 安全地处理验证错误
export function handleValidationError(error: unknown): never {
  console.error('Validation Error:', error);

  if (error instanceof ValidationError) {
    throw error;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'ValidationError'
  ) {
    const validationError = error as { message: string };
    throw new ValidationError(validationError.message);
  }

  // 通用验证错误处理
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : '输入数据无效';
  throw new ValidationError(message);
}

// 通用错误处理器
export function handleError(error: unknown): never {
  console.error('Error:', error);

  // 如果是已处理的 AppError，直接抛出
  if (error instanceof AppError) {
    throw error;
  }

  // 处理验证错误
  if (typeof error === 'object' && error !== null) {
    if ('name' in error && typeof error.name === 'string' && error.name.includes('Validation')) {
      const validationError = error as { message?: string };
      throw new ValidationError(validationError.message || '输入数据无效');
    }

    // 处理认证错误
    if ('status' in error && (error.status === 401 || error.status === 403)) {
      throw new AuthError('认证失败，请重新登录');
    }

    // 处理网络错误
    if ('name' in error && error.name === 'TypeError') {
      throw new NetworkError('网络连接失败');
    }

    // 处理 Supabase 错误
    if ('context' in error || 'code' in error) {
      handleSupabaseError(error);
    }

    // 默认错误消息
    const message =
      'message' in error && typeof error.message === 'string' ? error.message : '未知错误';
    throw new AppError(message, '操作失败，请稍后重试', 'unknown');
  }

  // 处理字符串错误
  if (typeof error === 'string') {
    throw new AppError(error, '操作失败，请稍后重试', 'unknown');
  }

  // 处理其他类型
  throw new AppError('未知错误', '操作失败，请稍后重试', 'unknown');
}

// 记录错误日志（生产环境中应该发送到监控服务）
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();

  let errorInfo: Record<string, unknown> = {};

  if (typeof error === 'object' && error !== null) {
    errorInfo = {
      name: 'name' in error ? error.name : undefined,
      message: 'message' in error ? String(error.message) : undefined,
      stack: 'stack' in error ? error.stack : undefined,
      type: 'type' in error ? error.type : undefined,
      code: 'code' in error ? error.code : undefined,
    };
  } else if (typeof error === 'string') {
    errorInfo = { message: error };
  }

  const logMessage = {
    timestamp,
    context,
    error: errorInfo,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'server',
  };

  // 在开发环境中输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 Error ${context ? `in ${context}` : ''}`);
    console.error(logMessage);
    console.groupEnd();
  } else {
    // 在生产环境中，只记录错误摘要
    console.error(
      `[${timestamp}] Error in ${context || 'unknown'}: ${errorInfo.message || 'Unknown error'}`
    );
  }
}
