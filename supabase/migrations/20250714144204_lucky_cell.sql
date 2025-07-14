-- SQL Script to ADD the missing 'plan_selected' column to public.profiles
-- Execute this in Supabase SQL Editor if 'plan_selected' is missing.

-- CRITICAL: This script is idempotent and safe to run multiple times

-- Add the plan_selected column if it does not exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'plan_selected'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN plan_selected BOOLEAN NOT NULL DEFAULT FALSE;
    
    RAISE NOTICE 'Added plan_selected column to public.profiles';
  ELSE
    RAISE NOTICE 'plan_selected column already exists in public.profiles';
  END IF;
END $$;

-- Update existing rows to ensure they have the correct default value
-- This is important if you had users before adding the column
UPDATE public.profiles
SET plan_selected = FALSE
WHERE plan_selected IS NULL;

-- Refresh RLS policies to ensure they recognize the new column
-- Temporarily disable RLS to recreate policies
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create fresh RLS policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- Verify the schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name = 'plan_selected';

-- Show sample data to verify
SELECT id, email, plan_selected, current_plan, credits 
FROM public.profiles 
LIMIT 5;

-- Success message
SELECT 'Schema verification complete! plan_selected column should now be available.' as status;