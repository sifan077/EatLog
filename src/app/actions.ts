'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MealLog, MealLogInput } from '@/lib/types';
import { getStartOfDay, getEndOfDay } from '@/utils/date';

// ============================================
// Todos Actions (Legacy)
// ============================================

export async function getTodos() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });

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
  updates: Partial<Omit<MealLogInput, 'photo_path'>>,
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
      throw new Error(`Failed to delete photos: ${storageError.message} (Code: ${storageError.code})`);
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