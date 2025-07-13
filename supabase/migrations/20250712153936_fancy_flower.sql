/*
  # Fix Profile RLS Policies for Authenticated Users

  1. Policy Updates
    - Drop and recreate INSERT policy with explicit authenticated role
    - Ensure SELECT and UPDATE policies are also explicitly for authenticated role
    - This resolves PGRST116 and 42501 RLS violations during profile creation

  2. Security
    - All policies explicitly target 'authenticated' role
    - Users can only manage their own profile data (auth.uid() = id)
    - Maintains data integrity and security
*/

-- DANGER ZONE: Drop existing policies to replace them cleanly
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;

-- Policy: Allow authenticated users to insert their own profile
-- Explicitly for 'authenticated' role to resolve RLS issues
CREATE POLICY "Allow authenticated users to insert their own profile." ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Policy: Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile." ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

-- Policy: Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile." ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);