-- Remove the redundant google_id column
-- We don't need it because:
-- 1. auth.users.id is already the canonical user identifier
-- 2. All foreign keys use user_id (UUID) not google_id
-- 3. Google OAuth info is stored in auth.users metadata

-- Drop the google_id column
ALTER TABLE public.users DROP COLUMN IF EXISTS google_id;

-- Verify the change
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Removed redundant google_id column';
  RAISE NOTICE '📝 User tracking still works via user_id (UUID)';
  RAISE NOTICE '🔐 All requests, activities, and updates are tracked by user_id';
END $$;
