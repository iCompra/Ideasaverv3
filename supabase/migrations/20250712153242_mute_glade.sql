/*
  # Add INSERT RLS Policy for Profile Creation

  1. New Policy
    - `profiles` table: Allow users to insert their own profile data
    - This enables client-side fallback profile creation when the trigger fails

  2. Security
    - Users can only insert profiles with their own auth.uid()
    - Maintains data integrity and security
*/

-- Policy: Users can insert their own profile.
-- This complements the SELECT and UPDATE policies already in place.
CREATE POLICY "Users can insert their own profile." ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);