-- Fix Users Table Schema Issues
-- This ensures the users table matches what the application expects

-- First, let's see what columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check if there are any users currently
SELECT COUNT(*) as user_count FROM public.users;

-- The issue might be:
-- 1. The schema in current_sql.sql has google_id as NOT NULL
-- 2. But schema.sql doesn't have google_id at all
-- 3. The INSERT code doesn't provide google_id

-- Let's check which schema is actually deployed
\d public.users

-- If google_id exists and is NOT NULL, we need to either:
-- A. Make it nullable
-- B. Provide a default value
-- C. Remove it entirely (since we have auth.users.id already)

-- Solution: Make google_id nullable if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'users'
    AND column_name = 'google_id'
  ) THEN
    -- Make google_id nullable
    ALTER TABLE public.users ALTER COLUMN google_id DROP NOT NULL;
    RAISE NOTICE '✅ Made google_id nullable';
  ELSE
    RAISE NOTICE 'ℹ️ Column google_id does not exist (this is fine)';
  END IF;
END $$;

-- Also ensure name column is nullable or has a default
-- Since OAuth might not always provide a name
DO $$
BEGIN
  ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;
  ALTER TABLE public.users ALTER COLUMN name SET DEFAULT 'Unknown User';
  RAISE NOTICE '✅ Made name nullable with default value';
EXCEPTION
  WHEN undefined_column THEN
    RAISE NOTICE '⚠️ Column name does not exist';
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Error modifying name column: %', SQLERRM;
END $$;

-- Verify the changes
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

RAISE NOTICE '✅ Users table schema fixed!';
RAISE NOTICE '📋 The INSERT operations should now work without NOT NULL violations';
