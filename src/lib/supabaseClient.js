import { createClient } from '@supabase/supabase-js';

// Vite exposes env vars prefixed with VITE_ to the client-side code.
// Create a `.env` file at the project root with:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=public-anon-key

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not set. Supabase will not work until these env vars are provided.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
