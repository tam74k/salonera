/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access environment variables securely.
// We fallback to the literal strings you provided ONLY during development, 
// but it is highly recommended to place them in the AI Studio Settings -> Secrets.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dngzzlvxndtfuxqfphgh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mTMP95EpmF2LneQYVREH7A_bP4btUYj';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
