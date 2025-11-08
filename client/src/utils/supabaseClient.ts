import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eznxtdzsvnfclgcavvhp.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bnh0ZHpzdm5mY2xnY2F2dmhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MDA5MDcsImV4cCI6MjA3ODE3NjkwN30.uxkZPGvN9-KXqulS-KguoFAvR33RluyNR-O3SNH8iwI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
