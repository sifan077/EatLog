// Meal Types
export const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐', emoji: '🌅' },
  { value: 'lunch', label: '午餐', emoji: '🍜' },
  { value: 'afternoon_snack', label: '下午加餐', emoji: '☕' },
  { value: 'dinner', label: '晚餐', emoji: '🍽️' },
  { value: 'evening_snack', label: '晚上加餐', emoji: '🌙' },
  { value: 'snack', label: '零食', emoji: '🍪' },
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
