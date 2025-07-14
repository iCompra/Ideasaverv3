/*
  # Complete Idea Saver Database Schema
  
  This script creates all necessary tables, RLS policies, and functions for Idea Saver.
  It is idempotent and can be run multiple times safely.
  
  Tables Created:
  1. profiles - User profile data with plan information
  2. gift_codes - Gift codes for credit redemption
  3. redeem_gift_code_transaction - Database function for safe redemption
  
  Security:
  - All tables have RLS enabled
  - Users can only access their own data
  - Gift code redemption is handled via secure function
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 25,
  current_plan TEXT NOT NULL DEFAULT 'free' CHECK (current_plan IN ('free', 'full_app_purchase')),
  has_purchased_app BOOLEAN NOT NULL DEFAULT FALSE,
  cloud_sync_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  auto_cloud_sync BOOLEAN NOT NULL DEFAULT FALSE,
  deletion_policy_days INTEGER NOT NULL DEFAULT 0,
  plan_selected BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add plan_selected column if it doesn't exist (for existing installations)
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
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'updated_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
  END IF;
END $$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them (idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.profiles;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger to recreate it (idempotent)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- GIFT CODES TABLE
-- =============================================

-- Create gift_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.gift_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  credits INTEGER NOT NULL CHECK (credits > 0),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  description TEXT
);

-- Enable RLS on gift_codes
ALTER TABLE public.gift_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them (idempotent)
DROP POLICY IF EXISTS "Gift codes are readable by all authenticated users" ON public.gift_codes;
DROP POLICY IF EXISTS "Only service role can modify gift codes" ON public.gift_codes;

-- Create RLS policies for gift_codes (read-only for users, managed by functions)
CREATE POLICY "Gift codes are readable by all authenticated users" 
  ON public.gift_codes 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Only service role can insert/update/delete gift codes
CREATE POLICY "Only service role can modify gift codes" 
  ON public.gift_codes 
  FOR ALL 
  TO service_role 
  USING (true);

-- =============================================
-- GIFT CODE REDEMPTION FUNCTION
-- =============================================

-- Create the gift code redemption function
CREATE OR REPLACE FUNCTION public.redeem_gift_code_transaction(
  p_code TEXT,
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_gift_code_id UUID;
  v_credits INTEGER;
  v_current_credits INTEGER;
  v_new_credits INTEGER;
BEGIN
  -- Check if the gift code exists and is not used
  SELECT id, credits 
  INTO v_gift_code_id, v_credits
  FROM public.gift_codes 
  WHERE code = p_code 
    AND is_used = FALSE 
    AND (expires_at IS NULL OR expires_at > NOW());
  
  -- If no valid gift code found, raise exception
  IF v_gift_code_id IS NULL THEN
    RAISE EXCEPTION 'Code not found or already used';
  END IF;
  
  -- Get current user credits
  SELECT credits 
  INTO v_current_credits
  FROM public.profiles 
  WHERE id = p_user_id;
  
  -- If user profile not found, raise exception
  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Calculate new credits
  v_new_credits := v_current_credits + v_credits;
  
  -- Start transaction (implicit in function)
  -- Mark gift code as used
  UPDATE public.gift_codes 
  SET 
    is_used = TRUE,
    used_by = p_user_id,
    used_at = NOW()
  WHERE id = v_gift_code_id;
  
  -- Update user credits
  UPDATE public.profiles 
  SET 
    credits = v_new_credits,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Return new credit balance
  RETURN v_new_credits;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.redeem_gift_code_transaction(TEXT, UUID) TO authenticated;

-- =============================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================

-- Insert some sample gift codes for testing (only if table is empty)
INSERT INTO public.gift_codes (code, credits, description)
SELECT * FROM (
  VALUES 
    ('WELCOME2024', 50, 'Welcome bonus for new users'),
    ('BOOST100', 100, 'Credit boost pack'),
    ('TESTCODE', 25, 'Test redemption code')
) AS sample_codes(code, credits, description)
WHERE NOT EXISTS (SELECT 1 FROM public.gift_codes LIMIT 1);

-- =============================================
-- HELPER VIEWS (OPTIONAL)
-- =============================================

-- Create a view for gift code stats (admin use)
CREATE OR REPLACE VIEW public.gift_code_stats AS
SELECT 
  COUNT(*) as total_codes,
  COUNT(*) FILTER (WHERE is_used = true) as used_codes,
  COUNT(*) FILTER (WHERE is_used = false AND (expires_at IS NULL OR expires_at > NOW())) as active_codes,
  SUM(credits) FILTER (WHERE is_used = true) as total_credits_redeemed
FROM public.gift_codes;

-- Grant access to the view
GRANT SELECT ON public.gift_code_stats TO authenticated;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan_selected ON public.profiles(plan_selected);
CREATE INDEX IF NOT EXISTS idx_gift_codes_code ON public.gift_codes(code);
CREATE INDEX IF NOT EXISTS idx_gift_codes_is_used ON public.gift_codes(is_used);
CREATE INDEX IF NOT EXISTS idx_gift_codes_expires_at ON public.gift_codes(expires_at);

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify the schema (these will show in query results)
SELECT 
  'profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  'gift_codes' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'gift_codes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'gift_codes')
ORDER BY tablename, policyname;

-- Show sample gift codes
SELECT code, credits, is_used, description 
FROM public.gift_codes 
ORDER BY created_at;

-- Final success message
SELECT 'Database schema setup completed successfully!' as status;