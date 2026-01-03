'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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