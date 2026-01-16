'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MealLog, MealLogInput, UserProfile, UserProfileInput } from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/utils/date';
import {
  sanitizeSearchKeyword,
  sanitizeTextContent,
  sanitizeTags,
  sanitizePrice,
  isValidUUID,
  isValidDate,
  isValidMealType,
} from '@/lib/validation';
import {
  handleSupabaseError,
  handleError,
  ValidationError,
  AuthError,
  logError,
} from '@/lib/errors';

// ============================================
// 安全辅助函数
// ============================================

// 验证用户认证状态
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateUser(supabase: any): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthError('未登录，请重新登录');
  }

  return user.id;
}

// 验证和清理输入数据
function validateMealLogInput(input: Partial<MealLogInput>): MealLogInput {
  const errors: string[] = [];

  // 验证照片路径
  if (!input.photo_paths || !Array.isArray(input.photo_paths) || input.photo_paths.length === 0) {
    errors.push('至少需要一张照片');
  }

  // 验证餐食类型
  if (!input.meal_type || !isValidMealType(input.meal_type)) {
    errors.push('餐食类型无效');
  }

  // 验证内容
  if (input.content) {
    try {
      input.content = sanitizeTextContent(input.content, 200);
    } catch {
      errors.push('内容格式不正确');
    }
  } else {
    input.content = null;
  }

  // 验证价格
  if (input.price !== undefined && input.price !== null) {
    try {
      input.price = sanitizePrice(input.price);
    } catch {
      errors.push('价格格式不正确');
    }
  } else {
    input.price = 0;
  }

  // 验证位置
  if (input.location) {
    try {
      input.location = sanitizeTextContent(input.location, 100);
    } catch {
      errors.push('位置格式不正确');
    }
  } else {
    input.location = null;
  }

  // 验证标签
  if (input.tags) {
    try {
      input.tags = sanitizeTags(input.tags);
    } catch {
      errors.push('标签格式不正确');
    }
  } else {
    input.tags = null;
  }

  // 验证时间
  if (input.eaten_at && !isValidDate(input.eaten_at)) {
    errors.push('时间格式不正确');
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return input as MealLogInput;
}

// 验证和清理用户配置文件输入数据
function validateUserProfileInput(input: Partial<UserProfileInput>): UserProfileInput {
  const errors: string[] = [];

  // 验证显示名称
  if (input.display_name !== undefined) {
    try {
      input.display_name = sanitizeTextContent(input.display_name, 50);
      if (input.display_name.length === 0) {
        input.display_name = null;
      }
    } catch {
      errors.push('显示名称格式不正确');
    }
  }

  // 验证生物信息
  if (input.bio !== undefined) {
    try {
      input.bio = sanitizeTextContent(input.bio, 500);
      if (input.bio.length === 0) {
        input.bio = null;
      }
    } catch {
      errors.push('个人简介格式不正确');
    }
  }

  // 验证身高
  if (input.height !== undefined && input.height !== null) {
    if (typeof input.height !== 'number' || input.height <= 0 || input.height > 300) {
      errors.push('身高必须为有效的数字（0-300cm）');
    }
  }

  // 验证体重
  if (input.weight !== undefined && input.weight !== null) {
    if (typeof input.weight !== 'number' || input.weight <= 0 || input.weight > 500) {
      errors.push('体重必须为有效的数字（0-500kg）');
    }
  }

  // 验证活动水平
  if (input.activity_level !== undefined && input.activity_level !== null) {
    const validLevels = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
    if (!validLevels.includes(input.activity_level)) {
      errors.push('活动水平无效');
    }
  }

  // 验证饮食目标
  if (input.diet_goals !== undefined && input.diet_goals !== null) {
    try {
      input.diet_goals = sanitizeTags(input.diet_goals);
    } catch {
      errors.push('饮食目标格式不正确');
    }
  }

  // 验证饮食限制
  if (input.dietary_restrictions !== undefined && input.dietary_restrictions !== null) {
    try {
      input.dietary_restrictions = sanitizeTags(input.dietary_restrictions);
    } catch {
      errors.push('饮食限制格式不正确');
    }
  }

  // 验证过敏原
  if (input.allergies !== undefined && input.allergies !== null) {
    try {
      input.allergies = sanitizeTags(input.allergies);
    } catch {
      errors.push('过敏原格式不正确');
    }
  }

  // 验证每日卡路里目标
  if (input.daily_calorie_target !== undefined && input.daily_calorie_target !== null) {
    if (
      typeof input.daily_calorie_target !== 'number' ||
      input.daily_calorie_target < 500 ||
      input.daily_calorie_target > 10000
    ) {
      errors.push('每日卡路里目标必须在 500-10000 之间');
    }
  }

  // 验证时区
  if (input.timezone !== undefined && input.timezone !== null) {
    try {
      input.timezone = sanitizeTextContent(input.timezone, 50);
    } catch {
      errors.push('时区格式不正确');
    }
  }

  // 验证语言
  if (input.language !== undefined && input.language !== null) {
    try {
      input.language = sanitizeTextContent(input.language, 10);
    } catch {
      errors.push('语言格式不正确');
    }
  }

  // 验证出生日期
  if (input.birth_date !== undefined && input.birth_date !== null) {
    if (!isValidDate(input.birth_date)) {
      errors.push('出生日期格式不正确');
    } else {
      const birthDate = new Date(input.birth_date);
      const now = new Date();
      const age = now.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 150) {
        errors.push('出生日期无效');
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join('; '));
  }

  return input as UserProfileInput;
}

// ============================================
// Meal Logs Actions
// ============================================

// Get today's meal logs
export async function getTodayMealLogs(): Promise<MealLog[]> {
  try {
    const supabase = await createClient();
    await validateUser(supabase);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .gte('eaten_at', todayStart.toISOString())
      .lte('eaten_at', todayEnd.toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  } catch {
    handleError(error);
  }
}

// Get meal logs by date range
export async function getMealLogsByDate(startDate: Date, endDate: Date): Promise<MealLog[]> {
  try {
    if (
      !(startDate instanceof Date) ||
      !(endDate instanceof Date) ||
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime())
    ) {
      throw new ValidationError('日期格式无效');
    }

    if (startDate > endDate) {
      throw new ValidationError('开始日期不能晚于结束日期');
    }

    const supabase = await createClient();
    await validateUser(supabase);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .gte('eaten_at', startDate.toISOString())
      .lte('eaten_at', endDate.toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  } catch {
    handleError(error);
  }
}

// Get a single meal log by ID
export async function getMealLogById(id: string): Promise<MealLog | null> {
  try {
    if (!isValidUUID(id)) {
      throw new ValidationError('无效的记录ID');
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId) // 确保只能访问自己的数据
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch {
    handleError(error);
  }
}

// Create a new meal log
export async function createMealLog(mealLog: MealLogInput): Promise<MealLog> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 验证和清理输入数据
    const validatedInput = validateMealLogInput(mealLog);

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        ...validatedInput,
        eaten_at: validatedInput.eaten_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    revalidatePath('/');
    revalidatePath('/today');
    revalidatePath('/calendar');
    revalidatePath('/search');

    return data;
  } catch {
    handleError(error);
  }
}

// Update an existing meal log
export async function updateMealLog(
  id: string,
  updates: Partial<Omit<MealLogInput, 'photo_paths' | 'user_id'>>
): Promise<MealLog> {
  try {
    if (!isValidUUID(id)) {
      throw new ValidationError('无效的记录ID');
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 验证和清理更新数据
    const validatedUpdates = validateMealLogInput(updates as MealLogInput);

    const { data, error } = await supabase
      .from('meal_logs')
      .update({
        ...validatedUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId) // 确保只能更新自己的数据
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    revalidatePath('/');
    revalidatePath('/today');
    revalidatePath('/calendar');
    revalidatePath('/search');
    revalidatePath(`/edit/${id}`);

    return data;
  } catch {
    handleError(error);
  }
}

// Delete a meal log
export async function deleteMealLog(id: string, photoPaths: string[]): Promise<void> {
  try {
    if (!isValidUUID(id)) {
      throw new ValidationError('无效的记录ID');
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 删除所有照片从存储
    if (photoPaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('meal-photos').remove(photoPaths);

      if (storageError) {
        logError(storageError, 'storage deletion');
        // 继续删除数据库记录，即使存储删除失败
      }
    }

    // 删除数据库记录
    const { error } = await supabase.from('meal_logs').delete().eq('id', id).eq('user_id', userId); // 确保只能删除自己的数据

    if (error) {
      handleSupabaseError(error);
    }

    revalidatePath('/');
    revalidatePath('/today');
    revalidatePath('/calendar');
    revalidatePath('/search');
  } catch {
    handleError(error);
  }
}

// Search meal logs by keyword (防止 SQL 注入)
export async function searchMealLogs(keyword: string): Promise<MealLog[]> {
  try {
    // 验证和清理搜索关键词
    const sanitizedKeyword = sanitizeSearchKeyword(keyword);

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .or(`content.ilike.%${sanitizedKeyword}%,location.ilike.%${sanitizedKeyword}%`)
      .eq('user_id', userId) // 确保只能搜索自己的数据
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  } catch {
    handleError(error);
  }
}

// Search meal logs by tags
export async function searchMealLogsByTags(tags: string[]): Promise<MealLog[]> {
  try {
    // 验证和清理标签
    const sanitizedTags = sanitizeTags(tags);

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const { data, error } = await supabase
      .from('meal_logs')
      .select('*')
      .contains('tags', sanitizedTags)
      .eq('user_id', userId) // 确保只能搜索自己的数据
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    return data || [];
  } catch {
    handleError(error);
  }
}

// ============================================
// User Profiles Actions
// ============================================

// Get user profile
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error);
    }

    return data;
  } catch {
    handleError(error);
  }
}

// Update user profile
export async function updateUserProfile(updates: UserProfileInput): Promise<UserProfile> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 验证和清理更新数据
    const validatedUpdates = validateUserProfileInput(updates);

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          user_id: userId,
          ...validatedUpdates,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id',
        }
      )
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }

    revalidatePath('/profile');

    return data;
  } catch {
    handleError(error);
  }
}

// ============================================
// Statistics Actions (安全版本)
// ============================================

// Get streak days (consecutive days with meal logs)
export async function getStreakDays(): Promise<number> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 获取所有餐食记录，按日期排序
    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('eaten_at')
      .eq('user_id', userId) // 确保只获取自己的数据
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    if (!mealLogs || mealLogs.length === 0) {
      return 0;
    }

    // 按日期分组
    const datesSet = new Set(
      mealLogs.map((meal) => {
        const date = new Date(meal.eaten_at);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      })
    );

    const dates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));

    // 计算连续天数
    let streak = 0;
    let currentDate = new Date();
    currentDate = new Date(currentDate.toLocaleDateString('en-US', { timeZone: 'Asia/Shanghai' }));

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toLocaleDateString('en-CA', {
        timeZone: 'Asia/Shanghai',
      });

      if (dates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch {
    handleError(error);
  }
}

// Get recent days statistics (last 7 days)
export async function getRecentDaysStats(): Promise<
  Array<{ date: string; mealCount: number; hasRecords: boolean }>
> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 获取过去7天的餐食记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('eaten_at')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', getStartOfDay(sevenDaysAgo).toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    // 按日期分组
    const dateCountMap = new Map<string, number>();
    (mealLogs || []).forEach((meal) => {
      const date = new Date(meal.eaten_at);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      dateCountMap.set(dateStr, (dateCountMap.get(dateStr) || 0) + 1);
    });

    // 生成过去7天的统计
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      const displayDate = date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });

      stats.push({
        date: displayDate,
        mealCount: dateCountMap.get(dateStr) || 0,
        hasRecords: (dateCountMap.get(dateStr) || 0) > 0,
      });
    }

    return stats;
  } catch {
    handleError(error);
  }
}

// Get top tags from meal logs
export async function getTopTags(
  limit: number = 10
): Promise<Array<{ tag: string; count: number }>> {
  try {
    // 验证limit参数
    if (typeof limit !== 'number' || limit <= 0 || limit > 100) {
      throw new ValidationError('limit 参数必须为 1-100 之间的数字');
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 获取所有带标签的餐食记录
    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('tags')
      .eq('user_id', userId) // 确保只获取自己的数据
      .not('tags', 'is', null);

    if (error) {
      handleSupabaseError(error);
    }

    // 统计标签
    const tagCountMap = new Map<string, number>();
    (mealLogs || []).forEach((meal) => {
      if (meal.tags && Array.isArray(meal.tags)) {
        meal.tags.forEach((tag) => {
          // 确保标签是字符串
          if (typeof tag === 'string' && tag.trim().length > 0) {
            const sanitizedTag = tag.trim();
            tagCountMap.set(sanitizedTag, (tagCountMap.get(sanitizedTag) || 0) + 1);
          }
        });
      }
    });

    // 按计数排序并返回前N个标签
    const sortedTags = Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return sortedTags;
  } catch {
    handleError(error);
  }
}

// ============================================
// Price Statistics Actions (安全版本)
// ============================================

// Get recent days price statistics (last 7 days)
export async function getRecentDaysPriceStats(): Promise<
  Array<{ date: string; totalPrice: number; hasRecords: boolean }>
> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 获取过去7天的餐食记录
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('eaten_at, price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', getStartOfDay(sevenDaysAgo).toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    // 按日期分组并求和价格
    const datePriceMap = new Map<string, number>();
    (mealLogs || []).forEach((meal) => {
      const date = new Date(meal.eaten_at);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      const price = Math.max(0, Number(meal.price) || 0); // 确保价格为非负数
      datePriceMap.set(dateStr, (datePriceMap.get(dateStr) || 0) + price);
    });

    // 生成过去7天的统计
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      const displayDate = date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      });

      stats.push({
        date: displayDate,
        totalPrice: Math.round((datePriceMap.get(dateStr) || 0) * 100) / 100, // 保留两位小数
        hasRecords: (datePriceMap.get(dateStr) || 0) > 0,
      });
    }

    return stats;
  } catch {
    handleError(error);
  }
}

// Get total price statistics for different time periods
export async function getTotalPriceStats(): Promise<{
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  averageDaily: number;
}> {
  try {
    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();
    const weekStart = getStartOfDay(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    const monthStart = getStartOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    // 获取今天的餐食记录
    const { data: todayLogs } = await supabase
      .from('meal_logs')
      .select('price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', todayStart.toISOString())
      .lte('eaten_at', todayEnd.toISOString());

    const todayTotal = (todayLogs || []).reduce(
      (sum, meal) => sum + Math.max(0, Number(meal.price) || 0),
      0
    );

    // 获取本周的餐食记录
    const { data: weekLogs } = await supabase
      .from('meal_logs')
      .select('price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', weekStart.toISOString());

    const weekTotal = (weekLogs || []).reduce(
      (sum, meal) => sum + Math.max(0, Number(meal.price) || 0),
      0
    );

    // 获取本月的餐食记录
    const { data: monthLogs } = await supabase
      .from('meal_logs')
      .select('price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', monthStart.toISOString());

    const monthTotal = (monthLogs || []).reduce(
      (sum, meal) => sum + Math.max(0, Number(meal.price) || 0),
      0
    );

    // 计算过去7天的平均日消费
    const averageDaily = weekTotal / 7;

    return {
      todayTotal: Math.round(todayTotal * 100) / 100,
      weekTotal: Math.round(weekTotal * 100) / 100,
      monthTotal: Math.round(monthTotal * 100) / 100,
      averageDaily: Math.round(averageDaily * 100) / 100,
    };
  } catch {
    handleError(error);
  }
}

// Get recent weeks price statistics
export async function getRecentWeeksPriceStats(
  weeks: number = 4
): Promise<Array<{ date: string; totalPrice: number; hasRecords: boolean }>> {
  try {
    // 验证weeks参数
    if (typeof weeks !== 'number' || weeks <= 0 || weeks > 52) {
      throw new ValidationError('weeks 参数必须为 1-52 之间的数字');
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    // 获取过去N周的餐食记录
    const weeksAgo = new Date();
    weeksAgo.setDate(weeksAgo.getDate() - weeks * 7);

    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('eaten_at, price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', getStartOfDay(weeksAgo).toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    // 按周分组并求和价格
    const weekPriceMap = new Map<string, number>();

    (mealLogs || []).forEach((meal) => {
      const date = new Date(meal.eaten_at);
      // 获取周开始日期（周一）
      const dayOfWeek = date.getDay();
      const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff));
      const weekStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
      const price = Math.max(0, Number(meal.price) || 0);
      weekPriceMap.set(weekStr, (weekPriceMap.get(weekStr) || 0) + price);
    });

    // 生成过去N周的统计
    const stats = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(
      today.getDate() - currentDayOfWeek + (currentDayOfWeek === 0 ? -6 : 1)
    );

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekStr = weekStart.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });

      // 格式化显示日期
      const displayDate = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

      stats.push({
        date: displayDate,
        totalPrice: Math.round((weekPriceMap.get(weekStr) || 0) * 100) / 100,
        hasRecords: (weekPriceMap.get(weekStr) || 0) > 0,
      });
    }

    return stats;
  } catch {
    handleError(error);
  }
}

// Get monthly price statistics for a specific year
export async function getMonthlyPriceStats(
  year?: number
): Promise<Array<{ date: string; totalPrice: number; hasRecords: boolean }>> {
  try {
    // 验证year参数
    if (year !== undefined) {
      if (typeof year !== 'number' || year < 1900 || year > 2100) {
        throw new ValidationError('year 参数必须为有效的年份（1900-2100）');
      }
    }

    const supabase = await createClient();
    const userId = await validateUser(supabase);

    const targetYear = year || new Date().getFullYear();

    // 获取指定年份的餐食记录
    const yearStart = new Date(targetYear, 0, 1);
    const yearEnd = new Date(targetYear, 11, 31);

    const { data: mealLogs, error } = await supabase
      .from('meal_logs')
      .select('eaten_at, price')
      .eq('user_id', userId) // 确保只获取自己的数据
      .gte('eaten_at', getStartOfDay(yearStart).toISOString())
      .lte('eaten_at', getEndOfDay(yearEnd).toISOString())
      .order('eaten_at', { ascending: false });

    if (error) {
      handleSupabaseError(error);
    }

    // 按月分组并求和价格
    const monthPriceMap = new Map<number, number>();

    (mealLogs || []).forEach((meal) => {
      const date = new Date(meal.eaten_at);
      const month = date.getMonth();
      const price = Math.max(0, Number(meal.price) || 0);
      monthPriceMap.set(month, (monthPriceMap.get(month) || 0) + price);
    });

    // 生成所有12个月的统计
    const stats = [];
    const monthNames = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ];

    for (let month = 0; month < 12; month++) {
      stats.push({
        date: monthNames[month],
        totalPrice: Math.round((monthPriceMap.get(month) || 0) * 100) / 100,
        hasRecords: (monthPriceMap.get(month) || 0) > 0,
      });
    }

    return stats;
  } catch {
    handleError(error);
  }
}
