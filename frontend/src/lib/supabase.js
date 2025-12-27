// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env');
}

const isBrowser = typeof window !== 'undefined';

if (!isBrowser) {
  throw new Error('Supabase client can only be initialized in the browser');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,       
    persistSession: true,          
    detectSessionInUrl: true,       
    storage: isBrowser ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'               
  }
});


export async function getSupabaseToken() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();
 
  console.log('Current session:', session);
  
  if (error || !session) {
    return null;
  }

  return session.access_token;
}

