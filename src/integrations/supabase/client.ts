
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lenicshfzmzgugetuacg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlbmljc2hmem16Z3VnZXR1YWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDQ5MjEsImV4cCI6MjA1OTkyMDkyMX0.6a68GR266CZVC-lYsIyUPzDLlan2aOTWAVBSuFGdMeE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
