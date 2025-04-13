
-- Add user_role and focus_hours columns to the profiles table
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS user_role TEXT,
ADD COLUMN IF NOT EXISTS focus_hours INTEGER;
