-- ============================================================================
-- FIX PROFILES TABLE - Add missing columns for settings page
-- Run this to add the missing fields that the settings page needs
-- ============================================================================

-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
  -- Add company column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company') THEN
    ALTER TABLE public.profiles ADD COLUMN company TEXT;
    RAISE NOTICE 'Added company column to profiles table';
  ELSE
    RAISE NOTICE 'company column already exists';
  END IF;
  
  -- Add phone column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    RAISE NOTICE 'Added phone column to profiles table';
  ELSE
    RAISE NOTICE 'phone column already exists';
  END IF;
  
  -- Add website column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'website') THEN
    ALTER TABLE public.profiles ADD COLUMN website TEXT;
    RAISE NOTICE 'Added website column to profiles table';
  ELSE
    RAISE NOTICE 'website column already exists';
  END IF;
  
  -- Add email_preferences column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN email_preferences JSONB DEFAULT '{"statusUpdates": true, "distributionReports": true}';
    RAISE NOTICE 'Added email_preferences column to profiles table';
  ELSE
    RAISE NOTICE 'email_preferences column already exists';
  END IF;
END
$$;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current profiles data (if any)
SELECT 
  id,
  email,
  full_name,
  company,
  phone,
  website,
  email_preferences
FROM public.profiles 
LIMIT 5;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
SELECT 'Profiles table migration completed successfully!' as message; 