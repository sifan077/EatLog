'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  MealLog,
  MealLogInput,
  UserProfile,
  UserProfileInput,
  NutritionAnalysis,
} from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/utils/date';
import { analyzeNutrition } from '@/utils/nutrition';

// ============================================
// Todos Actions (Legacy)
// ============================================

export async function getTodos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch todos: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

export async function createTodo(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  const { error } = await supabase.from('todos').insert({ title, description });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to create todo: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
}

export async function updateTodo(id: string, completed: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').update({ completed }).eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update todo: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('todos').delete().eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to delete todo: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
}

// ============================================
// Meal Logs Actions
// ============================================

// Get today's meal logs
export async function getTodayMealLogs(): Promise<MealLog[]> {
  const supabase = await createClient();
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', todayStart.toISOString())
    .lte('eaten_at', todayEnd.toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch today's meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Get meal logs by date range
export async function getMealLogsByDate(startDate: Date, endDate: Date): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', startDate.toISOString())
    .lte('eaten_at', endDate.toISOString())
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Get a single meal log by ID
export async function getMealLogById(id: string): Promise<MealLog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('meal_logs').select('*').eq('id', id).single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch meal log: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

// Create a new meal log
export async function createMealLog(mealLog: MealLogInput): Promise<MealLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      ...mealLog,
      eaten_at: mealLog.eaten_at || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to create meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');

  return data;
}

// Update an existing meal log
export async function updateMealLog(
  id: string,
  updates: Partial<Omit<MealLogInput, 'photo_path'>>
): Promise<MealLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');
  revalidatePath(`/edit/${id}`);

  return data;
}

// Delete a meal log
export async function deleteMealLog(id: string, photoPaths: string[]): Promise<void> {
  const supabase = await createClient();

  // Delete all photos from storage
  if (photoPaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('meal-photos').remove(photoPaths);

    if (storageError) {
      console.error('Storage error:', storageError);
      throw new Error(`Failed to delete photos: ${storageError.message}`);
    }
  }

  // Delete record from database
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to delete meal log: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/');
  revalidatePath('/today');
  revalidatePath('/calendar');
  revalidatePath('/search');
}

// Search meal logs by keyword
export async function searchMealLogs(keyword: string): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .or(`content.ilike.%${keyword}%,location.ilike.%${keyword}%`)
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to search meal logs: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// Search meal logs by tags
export async function searchMealLogsByTags(tags: string[]): Promise<MealLog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .contains('tags', tags)
    .order('eaten_at', { ascending: false });

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to search meal logs by tags: ${error.message} (Code: ${error.code})`);
  }

  return data || [];
}

// ============================================
// User Profiles Actions
// ============================================

// Get user profile
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch user profile: ${error.message} (Code: ${error.code})`);
  }

  return data;
}

// Update user profile
export async function updateUserProfile(updates: UserProfileInput): Promise<UserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('未登录，请重新登录');
  }

  // Check if profile exists
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      {
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to update user profile: ${error.message} (Code: ${error.code})`);
  }

  revalidatePath('/profile');

  return data;
}

// ============================================
// Diet Recommendations
// ============================================

// Get nutrition analysis and recommendations
export async function getNutritionAnalysis(): Promise<NutritionAnalysis> {
  const supabase = await createClient();

  // Get user profile
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error('未登录，请重新登录');
  }

  // Get today's meal logs
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const { data: mealLogs, error: mealsError } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', todayStart.toISOString())
    .lte('eaten_at', todayEnd.toISOString())
    .order('eaten_at', { ascending: false });

  if (mealsError) {
    console.error('Supabase error:', mealsError);
    throw new Error(`Failed to fetch meal logs: ${mealsError.message} (Code: ${mealsError.code})`);
  }

  // Analyze nutrition
  return analyzeNutrition(mealLogs || [], profile);
}

// ============================================
// AI Recommendation Actions
// ============================================

// Get data for AI recommendation prompt
export async function getAiRecommendationData() {
  const supabase = await createClient();

  // Get user profile
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error('未登录，请重新登录');
  }

  // Get meal logs from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: mealLogs, error: mealsError } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', sevenDaysAgo.toISOString())
    .order('eaten_at', { ascending: false });

  if (mealsError) {
    console.error('Supabase error:', mealsError);
    throw new Error(`Failed to fetch meal logs: ${mealsError.message} (Code: ${mealsError.code})`);
  }

  // Get today's meal logs
  const todayStart = getStartOfDay();
  const todayEnd = getEndOfDay();

  const { data: todayMealLogs, error: todayMealsError } = await supabase
    .from('meal_logs')
    .select('*')
    .gte('eaten_at', todayStart.toISOString())
    .lte('eaten_at', todayEnd.toISOString())
    .order('eaten_at', { ascending: false });

  if (todayMealsError) {
    console.error('Supabase error:', todayMealsError);
    throw new Error(
      `Failed to fetch today's meal logs: ${todayMealsError.message} (Code: ${todayMealsError.code})`
    );
  }

  return {
    profile,
    recentMeals: mealLogs || [],
    todayMeals: todayMealLogs || [],
  };
}
