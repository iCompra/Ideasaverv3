import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anonymous key is not defined.');
  }

  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return supabase;
}

/**
 * Check if Supabase is properly configured
 * @returns {boolean} Whether Supabase is configured
 */
export function isSupabaseReady(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return !!(supabaseUrl && supabaseAnonKey && 
    !supabaseUrl.includes('your-project') && 
    !supabaseAnonKey.includes('your-anon-key'));
}