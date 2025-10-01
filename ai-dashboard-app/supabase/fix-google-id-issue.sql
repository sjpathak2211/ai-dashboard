-- Fix the google_id NOT NULL constraint issue
-- The app doesn't provide google_id when inserting users, so we need to make it nullable

-- Option 1: Make google_id nullable (RECOMMENDED)
ALTER TABLE public.users ALTER COLUMN google_id DROP NOT NULL;

-- Option 2: Set a default value for google_id
ALTER TABLE public.users ALTER COLUMN google_id SET DEFAULT '';

-- Verify the fix
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
  AND column_name = 'google_id';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ google_id is now nullable!';
  RAISE NOTICE '📝 User creation should now work without errors';
END $$;
