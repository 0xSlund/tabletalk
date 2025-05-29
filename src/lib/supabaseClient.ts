import { createClient } from '@supabase/supabase-js';

// Replace these with your own Supabase URL and anon key
// You should store these in environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 