// Meal Types
export const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐', emoji: '🌅' },
  { value: 'lunch', label: '午餐', emoji: '🍜' },
  { value: 'afternoon_snack', label: '下午加餐', emoji: '☕' },
  { value: 'dinner', label: '晚餐', emoji: '🍽️' },
  { value: 'evening_snack', label: '晚上加餐', emoji: '🌙' },
  { value: 'snack', label: '今日总结', emoji: '📊' },
] as const;

// Tag Suggestions
export const TAG_SUGGESTIONS = [
  '健康',
  '高蛋白',
  '低脂',
  '素食',
  '辣',
  '甜',
  '家常菜',
  '外卖',
  '自制',
  '快餐',
  '海鲜',
  '清淡',
  '重口味',
  '营养',
  '减脂',
  '增肌',
  '早餐',
  '午餐',
  '晚餐',
  '夜宵',
] as const;

// Storage Configuration
export const STORAGE_BUCKET = 'meal-photos';
export const STORAGE_PATH_FORMAT = '{user_id}/{timestamp}_{random}.jpg';

// Time Ranges for Meal Types (for auto-detection)
export const MEAL_TIME_RANGES = {
  breakfast: { start: 5, end: 8 }, // 5:00 - 8:59
  lunch: { start: 9, end: 13 }, // 9:00 - 13:59
  afternoon_snack: { start: 14, end: 16 }, // 14:00 - 16:59
  dinner: { start: 17, end: 20 }, // 17:00 - 20:59
  evening_snack: { start: 21, end: 4 }, // 21:00 - 4:59 (next day)
  snack: { start: 0, end: 23 }, // All day
} as const;

// ============================================
// User Profile Constants
// ============================================

// Activity Levels
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: '久坐不动', description: '几乎不运动' },
  { value: 'light', label: '轻度活动', description: '每周运动 1-3 天' },
  { value: 'moderate', label: '中度活动', description: '每周运动 3-5 天' },
  { value: 'active', label: '高度活动', description: '每周运动 6-7 天' },
  { value: 'very_active', label: '非常活跃', description: '每天运动或体力劳动' },
] as const;

// Diet Goals
export const DIET_GOALS = [
  '减脂',
  '增肌',
  '保持体重',
  '健康饮食',
  '控制血糖',
  '提高代谢',
  '增强免疫力',
  '改善睡眠',
] as const;

// Dietary Restrictions
export const DIETARY_RESTRICTIONS = [
  '素食',
  '纯素食',
  '无麸质',
  '无乳制品',
  '低钠',
  '低糖',
  '生酮饮食',
  '地中海饮食',
  '鱼类',
] as const;

// Common Allergies
export const COMMON_ALLERGIES = [
  '花生',
  '坚果',
  '海鲜',
  '贝类',
  '鸡蛋',
  '牛奶',
  '大豆',
  '小麦',
  '芝麻',
] as const;
