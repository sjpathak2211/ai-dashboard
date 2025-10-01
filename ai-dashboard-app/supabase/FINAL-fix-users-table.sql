-- FINAL Fix: Remove google_id column that's causing insert failures
-- This is the simplest and cleanest solution

-- Remove the google_id column entirely
ALTER TABLE public.users DROP COLUMN IF EXISTS google_id;

-- Verify the schema is now correct
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Done!
