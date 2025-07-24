import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Authentication features will not work.');
  // Use placeholder values to prevent crash - auth won't work but app will load
  const placeholderUrl = 'https://placeholder.supabase.co';
  const placeholderKey = 'placeholder-key';
  Object.assign(import.meta.env, {
    VITE_SUPABASE_URL: placeholderUrl,
    VITE_SUPABASE_ANON_KEY: placeholderKey
  });
}

export const supabase = createClient<Database>(
  supabaseUrl || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co',
  supabaseAnonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
});

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Helper function to check if user is admin
export const isUserAdmin = async () => {
  const user = await getCurrentUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  return !error && data?.is_admin === true;
};