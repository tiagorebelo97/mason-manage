import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ngfqbunbrnqyflznkgzx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZnFidW5icm5xeWZsem5rZ3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjczMjYsImV4cCI6MjA1NjYwMzMyNn0.eGiB4Fs9TUqxLYzDjOHVLIDqHJNCp6h3IkH03qwt0f4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
