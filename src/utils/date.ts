// Convert to Beijing Time (UTC+8)
function toBeijingTime(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Beijing time is UTC+8
  const offset = 8; // hours
  const utcTimestamp = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utcTimestamp + offset * 3600000);
}

// Get the start of the day (00:00:00) in Beijing Time
export function getStartOfDay(date: Date = new Date()): Date {
  const beijingDate = toBeijingTime(date);
  const result = new Date(beijingDate);
  result.setHours(0, 0, 0, 0);
  // Convert back to UTC for storage
  const offset = 8;
  return new Date(result.getTime() - offset * 3600000);
}

// Get the end of the day (23:59:59.999) in Beijing Time
export function getEndOfDay(date: Date = new Date()): Date {
  const beijingDate = toBeijingTime(date);
  const result = new Date(beijingDate);
  result.setHours(23, 59, 59, 999);
  // Convert back to UTC for storage
  const offset = 8;
  return new Date(result.getTime() - offset * 3600000);
}

// Format date to ISO string (Beijing Time)
export function formatDateToISO(date: Date): string {
  const beijingDate = toBeijingTime(date);
  return beijingDate.toISOString();
}

// Get current hour in Beijing Time (0-23)
export function getCurrentHour(): number {
  return toBeijingTime(new Date()).getHours();
}

// Auto-detect meal type based on current Beijing time
import { MEAL_TIME_RANGES } from '@/lib/constants';

export function detectMealType(hour?: number): string {
  const h = hour ?? getCurrentHour();

  if (h >= MEAL_TIME_RANGES.breakfast.start && h <= MEAL_TIME_RANGES.breakfast.end) {
    return 'breakfast';
  }
  if (h >= MEAL_TIME_RANGES.lunch.start && h <= MEAL_TIME_RANGES.lunch.end) {
    return 'lunch';
  }
  if (h >= MEAL_TIME_RANGES.afternoon_snack.start && h <= MEAL_TIME_RANGES.afternoon_snack.end) {
    return 'afternoon_snack';
  }
  if (h >= MEAL_TIME_RANGES.dinner.start && h <= MEAL_TIME_RANGES.dinner.end) {
    return 'dinner';
  }
  if (h >= MEAL_TIME_RANGES.evening_snack.start || h <= MEAL_TIME_RANGES.evening_snack.end) {
    return 'evening_snack';
  }
  return 'snack'; // Default to snack for any other time
}

// Format date for display in Beijing Time (e.g., "2026年1月3日")
export function formatDateDisplay(date: Date | string): string {
  const d = toBeijingTime(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  });
}

// Format time for display in Beijing Time (e.g., "12:30")
export function formatTimeDisplay(date: Date | string): string {
  const d = toBeijingTime(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  });
}

// Check if two dates are the same day in Beijing Time
export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = toBeijingTime(date1);
  const d2 = toBeijingTime(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Get days between two dates in Beijing Time
export function getDaysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = toBeijingTime(date1);
  const d2 = toBeijingTime(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}