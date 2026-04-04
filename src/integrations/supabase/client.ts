import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const DEFAULT_URL = "https://mlyeqkkcqfsivqhuoedm.supabase.co";
const DEFAULT_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1seWVxa2tjcWZzaXZxaHVvZWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MjIyMjUsImV4cCI6MjA5MDE5ODIyNX0.GhtGdzlDeDC93RT3RP_78elndxule7Hz0XV0J_HiH20";

const SUPABASE_URL = localStorage.getItem('supabase_custom_url') || DEFAULT_URL;
const SUPABASE_PUBLISHABLE_KEY = localStorage.getItem('supabase_custom_key') || DEFAULT_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});