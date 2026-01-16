import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@/lib/env';

const supabaseConfig = getSupabaseConfig();

export function createClient() {
  return createBrowserClient(supabaseConfig.url, supabaseConfig.anonKey);
}
