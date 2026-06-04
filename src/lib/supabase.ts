import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

declare global {
  var __supabase: SupabaseClient<Database> | undefined;
}

export const supabase =
  globalThis.__supabase ?? createClient<Database>(supabaseUrl, supabaseAnonKey);

if (import.meta.hot) {
  globalThis.__supabase = supabase;
}

// Re-export types for convenience
export type { Database } from '@/types/database';
