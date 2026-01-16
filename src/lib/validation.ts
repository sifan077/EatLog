/**
 * 输入验证和清理工具
 * 防止 SQL 注入、XSS 攻击和其他安全威胁
 */

// SQL 注入防护 - 转义特殊字符
export function escapeSql(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/'/g, "''") // 转义单引号
    .replace(/"/g, '""') // 转义双引号
    .replace(/\\/g, '\\\\') // 转义反斜杠
    .replace(/;/g, '\\;') // 转义分号
    .replace(/--/g, '\\-\\-') // 转义 SQL 注释
    .replace(/\//g, '\\/') // 转义斜杠
    .replace(/\*/g, '\\*'); // 转义星号
}

// XSS 防护 - 转义 HTML 特殊字符
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;') // 转义 & 符号
    .replace(/</g, '&lt;') // 转义 < 符号
    .replace(/>/g, '&gt;') // 转义 > 符号
    .replace(/"/g, '&quot;') // 转义 " 符号
    .replace(/'/g, '&#x27;') // 转义 ' 符号
    .replace(/\//g, '&#x2F;'); // 转义 / 符号
}

// 验证和清理搜索关键词
export function sanitizeSearchKeyword(keyword: string): string {
  if (typeof keyword !== 'string') {
    throw new Error('搜索关键词必须是字符串');
  }

  // 移除前后空格
  let sanitized = keyword.trim();

  // 限制长度（防止 DoS 攻击）
  if (sanitized.length > 100) {
    throw new Error('搜索关键词过长（最多100个字符）');
  }

  // 移除或转义危险字符
  sanitized = sanitized
    .replace(/[<>\"']/g, '') // 移除 HTML 危险字符
    .replace(/[%;()]/g, '') // 移除 SQL 注入字符
    .replace(/--/g, '') // 移除 SQL 注释
    .replace(/\/\*/g, '') // 移除多行注释开始
    .replace(/\*\//g, ''); // 移除多行注释结束

  // 如果清理后为空，抛出错误
  if (!sanitized) {
    throw new Error('搜索关键词不能为空或只包含特殊字符');
  }

  return sanitized;
}

// 验证和清理文本内容
export function sanitizeTextContent(content: string, maxLength: number = 1000): string {
  if (typeof content !== 'string') {
    return '';
  }

  // 移除前后空格
  let sanitized = content.trim();

  // 限制长度
  if (sanitized.length > maxLength) {
    throw new Error(`文本内容过长（最多${maxLength}个字符）`);
  }

  // 移除 HTML 标签（可选，根据需求调整）
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // 移除控制字符（换行符除外）
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

// 验证标签数组
export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) {
    throw new Error('标签必须是数组');
  }

  return tags.map((tag, index) => {
    if (typeof tag !== 'string') {
      throw new Error(`标签 ${index + 1} 必须是字符串`);
    }

    let sanitized = tag.trim();

    if (sanitized.length === 0) {
      throw new Error(`标签 ${index + 1} 不能为空`);
    }

    if (sanitized.length > 50) {
      throw new Error(`标签 ${index + 1} 过长（最多50个字符）`);
    }

    // 移除危险字符
    sanitized = sanitized.replace(/[<>\"';]/g, '');

    return sanitized;
  });
}

// 验证价格输入
export function sanitizePrice(price: string | number): number {
  let numPrice: number;

  if (typeof price === 'string') {
    // 移除货币符号和其他非数字字符（除了小数点）
    const cleanPrice = price.replace(/[^0-9.]/g, '');
    numPrice = parseFloat(cleanPrice);
  } else {
    numPrice = price;
  }

  if (isNaN(numPrice) || numPrice < 0) {
    throw new Error('价格必须是有效的非负数');
  }

  // 限制价格范围（最多 99999.99）
  if (numPrice > 99999.99) {
    throw new Error('价格过高（最大 99999.99）');
  }

  return Math.round(numPrice * 100) / 100; // 保留两位小数
}

// 验证文件类型
export function validateFileType(fileName: string, allowedTypes: string[]): boolean {
  const extension = fileName.toLowerCase().split('.').pop();
  return extension ? allowedTypes.includes(extension) : false;
}

// 验证 UUID 格式
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// 验证日期格式
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// 验证餐食类型
export function isValidMealType(mealType: string): mealType is import('@/lib/types').MealType {
  const validTypes = ['breakfast', 'lunch', 'dinner', 'afternoon_snack', 'evening_snack', 'snack'];
  return validTypes.includes(mealType);
}
