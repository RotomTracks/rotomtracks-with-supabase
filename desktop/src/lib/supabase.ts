import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Don't throw error, just log warning to allow app to load
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase credentials:', {
    url: supabaseUrl ? 'OK' : 'MISSING',
    key: supabaseAnonKey ? 'OK' : 'MISSING',
  });
}

// Use placeholder values if missing to prevent crash
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    persistSession: false, // No guardar sesión - requiere login cada vez
    autoRefreshToken: false,
  },
});




